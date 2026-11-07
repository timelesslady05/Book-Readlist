"""Pydantic request and response schemas for authentication."""

from datetime import datetime

from pydantic import AnyHttpUrl, BaseModel, EmailStr, Field, field_validator, model_validator

from app.models import BookStatus


class UserCreate(BaseModel):
    """Fields required to register an account."""

    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: object) -> object:
        """Treat email casing and surrounding spaces consistently."""
        if isinstance(value, str):
            return value.strip().lower()
        return value


class UserRead(BaseModel):
    """Safe public fields returned for an account."""

    id: int
    email: EmailStr
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """Access and refresh tokens returned after sign-in or rotation."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshTokenRequest(BaseModel):
    """A refresh token submitted for rotation or logout."""

    refresh_token: str = Field(min_length=1)


class BookCreate(BaseModel):
    """Fields required or optionally accepted when adding a book."""

    title: str = Field(min_length=1, max_length=200)
    author: str = Field(min_length=1, max_length=160)
    genre: str | None = Field(default=None, max_length=80)
    description: str | None = Field(default=None, max_length=5000)
    cover_image_url: AnyHttpUrl | None = None
    rating: float | None = Field(default=None, ge=0, le=5)
    reading_progress: int = Field(default=0, ge=0, le=100)
    status: BookStatus = BookStatus.WANT_TO_READ

    @field_validator("title", "author", mode="before")
    @classmethod
    def trim_required_text(cls, value: object) -> object:
        """Remove surrounding whitespace from titles and author names."""
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("genre", mode="before")
    @classmethod
    def normalize_genre(cls, value: object) -> object:
        """Treat an empty genre as if no genre was supplied."""
        if isinstance(value, str):
            return value.strip() or None
        return value


class BookUpdate(BaseModel):
    """Fields that may be changed when editing an existing book."""

    title: str | None = Field(default=None, min_length=1, max_length=200)
    author: str | None = Field(default=None, min_length=1, max_length=160)
    genre: str | None = Field(default=None, max_length=80)
    description: str | None = Field(default=None, max_length=5000)
    cover_image_url: AnyHttpUrl | None = None
    rating: float | None = Field(default=None, ge=0, le=5)
    reading_progress: int | None = Field(default=None, ge=0, le=100)
    status: BookStatus | None = None

    @field_validator("title", "author", mode="before")
    @classmethod
    def trim_required_text(cls, value: object) -> object:
        """Remove surrounding whitespace from titles and author names."""
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("genre", mode="before")
    @classmethod
    def normalize_genre(cls, value: object) -> object:
        """Treat an empty genre as if the genre was cleared."""
        if isinstance(value, str):
            return value.strip() or None
        return value

    @model_validator(mode="after")
    def validate_patch_fields(self) -> "BookUpdate":
        """Require a change and prevent nulling non-nullable book fields."""
        if not self.model_fields_set:
            raise ValueError("Provide at least one field to update.")
        for field_name in ("title", "author", "status", "reading_progress"):
            if field_name in self.model_fields_set and getattr(self, field_name) is None:
                raise ValueError(f"{field_name} cannot be null.")
        return self


class BookRead(BaseModel):
    """Book fields returned by the library API."""

    id: int
    user_id: int
    title: str
    author: str
    genre: str | None
    description: str | None
    cover_image_url: AnyHttpUrl | None
    rating: float | None
    reading_progress: int
    status: BookStatus
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
