"""CRUD endpoints for each user's private book library."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Book, BookStatus, User
from app.schemas import BookCreate, BookRead, BookUpdate

router = APIRouter(prefix="/books", tags=["books"])


def get_owned_book(db: Session, book_id: int, user_id: int) -> Book:
    """Find a book only when it belongs to the requesting account."""
    book = db.scalar(
        select(Book).where(Book.id == book_id, Book.user_id == user_id)
    )
    if book is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found.",
        )
    return book


@router.post("", response_model=BookRead, status_code=status.HTTP_201_CREATED)
def create_book(
    payload: BookCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Book:
    """Add a book to the authenticated user's library."""
    book_data = payload.model_dump()
    for field_name in ("cover_image_url", "online_read_url"):
        if book_data[field_name] is not None:
            book_data[field_name] = str(book_data[field_name])
    book = Book(**book_data, user_id=current_user.id)
    db.add(book)
    db.commit()
    db.refresh(book)
    return book


@router.get("", response_model=list[BookRead])
def list_books(
    status_filter: Annotated[BookStatus | None, Query(alias="status")] = None,
    genre: Annotated[str | None, Query(max_length=80)] = None,
    search: Annotated[str | None, Query(alias="q", max_length=200)] = None,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Book]:
    """List only the caller's books, with optional search and filters."""
    query = select(Book).where(Book.user_id == current_user.id)
    if status_filter is not None:
        query = query.where(Book.status == status_filter)
    if genre is not None and genre.strip():
        query = query.where(Book.genre.ilike(genre.strip()))
    if search is not None and search.strip():
        search_pattern = f"%{search.strip()}%"
        query = query.where(
            or_(
                Book.title.ilike(search_pattern),
                Book.author.ilike(search_pattern),
                Book.description.ilike(search_pattern),
            )
        )
    query = query.order_by(Book.updated_at.desc(), Book.id.desc())
    query = query.offset(skip).limit(limit)
    return list(db.scalars(query).all())


@router.get("/{book_id}", response_model=BookRead)
def read_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Book:
    """Return one book only if it belongs to the authenticated user."""
    return get_owned_book(db, book_id, current_user.id)


@router.patch("/{book_id}", response_model=BookRead)
def update_book(
    book_id: int,
    payload: BookUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Book:
    """Update only supplied fields on one owned book."""
    book = get_owned_book(db, book_id, current_user.id)
    updates = payload.model_dump(exclude_unset=True)
    for field_name in ("cover_image_url", "online_read_url"):
        if updates.get(field_name) is not None:
            updates[field_name] = str(updates[field_name])
    for field_name, value in updates.items():
        setattr(book, field_name, value)
    db.commit()
    db.refresh(book)
    return book


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(
    book_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    """Delete one book only when it belongs to the authenticated user."""
    book = get_owned_book(db, book_id, current_user.id)
    db.delete(book)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
