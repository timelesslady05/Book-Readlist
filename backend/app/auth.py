"""Password hashing, JWT creation, and authenticated-user dependencies."""

import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pwdlib import PasswordHash
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db, settings
from app.models import RefreshToken, User

ACCESS_TOKEN_MINUTES = 15
REFRESH_TOKEN_DAYS = 7
JWT_ALGORITHM = "HS256"
password_hasher = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def hash_password(password: str) -> str:
    """Hash a plaintext password using the recommended Argon2 settings."""
    return password_hasher.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """Compare a candidate password with its stored Argon2 hash."""
    return password_hasher.verify(password, hashed_password)


def hash_refresh_token(token: str) -> str:
    """Hash a refresh token before storing it in the database."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_access_token(user_id: int) -> str:
    """Create a short-lived access token signed with its own secret."""
    now = datetime.now(timezone.utc)
    claims = {
        "sub": str(user_id),
        "type": "access",
        "iat": now,
        "exp": now + timedelta(minutes=ACCESS_TOKEN_MINUTES),
    }
    return jwt.encode(
        claims,
        settings.access_token_secret.get_secret_value(),
        algorithm=JWT_ALGORITHM,
    )


def decode_token(token: str, token_type: str) -> dict[str, Any]:
    """Verify a JWT with the secret reserved for its token type."""
    if token_type == "access":
        secret = settings.access_token_secret.get_secret_value()
    elif token_type == "refresh":
        secret = settings.refresh_token_secret.get_secret_value()
    else:
        raise ValueError("Unsupported token type.")

    try:
        claims = jwt.decode(token, secret, algorithms=[JWT_ALGORITHM])
    except JWTError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from error

    if claims.get("type") != token_type:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return claims


def create_refresh_token(db: Session, user: User) -> tuple[str, datetime]:
    """Create and record a refresh token by storing only its hash."""
    expires_at = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_DAYS)
    claims = {
        "sub": str(user.id),
        "type": "refresh",
        "jti": secrets.token_urlsafe(16),
        "iat": datetime.now(timezone.utc),
        "exp": expires_at,
    }
    token = jwt.encode(
        claims,
        settings.refresh_token_secret.get_secret_value(),
        algorithm=JWT_ALGORITHM,
    )
    db.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_refresh_token(token),
            expires_at=expires_at,
        )
    )
    return token, expires_at


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Return the account identified by a valid access token."""
    claims = decode_token(token, "access")
    subject = claims.get("sub")
    if not isinstance(subject, str) or not subject.isdigit():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.scalar(select(User).where(User.id == int(subject)))
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
