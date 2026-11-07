"""SQLAlchemy models for users and refresh-token sessions."""

from datetime import datetime
from enum import Enum

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Enum as SqlEnum,
    Float,
    ForeignKey,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class BookStatus(str, Enum):
    """Supported stages in a reader's personal list."""

    WANT_TO_READ = "want_to_read"
    CURRENTLY_READING = "currently_reading"
    COMPLETED = "completed"


class User(Base):
    """A registered account with a private book library."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    books: Mapped[list["Book"]] = relationship(
        back_populates="owner",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class RefreshToken(Base):
    """A hashed refresh token that can be rotated or revoked."""

    __tablename__ = "refresh_tokens"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    user: Mapped[User] = relationship(back_populates="refresh_tokens")


class Book(Base):
    """A book saved in one user's private library."""

    __tablename__ = "books"
    __table_args__ = (
        CheckConstraint(
            "rating IS NULL OR (rating >= 0 AND rating <= 5)",
            name="check_book_rating_range",
        ),
        CheckConstraint(
            "reading_progress >= 0 AND reading_progress <= 100",
            name="check_book_progress_range",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(200))
    author: Mapped[str] = mapped_column(String(160))
    genre: Mapped[str | None] = mapped_column(String(80), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    cover_image_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    online_read_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    rating: Mapped[float | None] = mapped_column(Float, nullable=True)
    reading_progress: Mapped[int] = mapped_column(default=0)
    status: Mapped[BookStatus] = mapped_column(
        SqlEnum(
            BookStatus,
            name="book_status",
            native_enum=False,
            values_callable=lambda enum_type: [item.value for item in enum_type],
        ),
        default=BookStatus.WANT_TO_READ,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    owner: Mapped[User] = relationship(back_populates="books")
