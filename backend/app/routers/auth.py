"""Registration, login, refresh, logout, and current-user endpoints."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth import (
    ACCESS_TOKEN_MINUTES,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
    hash_password,
    hash_refresh_token,
    verify_password,
)
from app.database import get_db
from app.models import RefreshToken, User
from app.schemas import RefreshTokenRequest, TokenResponse, UserCreate, UserRead

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
)
def register_user(payload: UserCreate, db: Session = Depends(get_db)) -> User:
    """Create an account without returning its stored password hash."""
    existing_user = db.scalar(select(User).where(User.email == payload.email))
    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(email=str(payload.email), hashed_password=hash_password(payload.password))
    db.add(user)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        ) from error
    db.refresh(user)
    return user


@router.post("/token", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Verify email and password, then issue a token pair."""
    email = form_data.username.strip().lower()
    user = db.scalar(select(User).where(User.email == email))
    if user is None or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    refresh_token, _ = create_refresh_token(db, user)
    db.commit()
    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=refresh_token,
        expires_in=ACCESS_TOKEN_MINUTES * 60,
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_tokens(
    payload: RefreshTokenRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Rotate a valid refresh token and revoke the submitted token."""
    claims = decode_token(payload.refresh_token, "refresh")
    subject = claims.get("sub")
    if not isinstance(subject, str) or not subject.isdigit():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject.",
        )

    stored_token = db.scalar(
        select(RefreshToken)
        .where(RefreshToken.token_hash == hash_refresh_token(payload.refresh_token))
        .with_for_update()
    )
    now = datetime.now(timezone.utc)
    if (
        stored_token is None
        or stored_token.revoked_at is not None
        or stored_token.expires_at <= now
        or stored_token.user_id != int(subject)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is invalid or has already been used.",
        )

    user = db.get(User, stored_token.user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account no longer exists.",
        )

    stored_token.revoked_at = now
    new_refresh_token, _ = create_refresh_token(db, user)
    db.commit()
    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=new_refresh_token,
        expires_in=ACCESS_TOKEN_MINUTES * 60,
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    payload: RefreshTokenRequest,
    db: Session = Depends(get_db),
) -> Response:
    """Revoke a refresh token so it cannot be used again."""
    decode_token(payload.refresh_token, "refresh")
    stored_token = db.scalar(
        select(RefreshToken).where(
            RefreshToken.token_hash == hash_refresh_token(payload.refresh_token)
        )
    )
    if stored_token is not None and stored_token.revoked_at is None:
        stored_token.revoked_at = datetime.now(timezone.utc)
        db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/me", response_model=UserRead)
def read_current_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Return the account associated with the caller's access token."""
    return current_user
