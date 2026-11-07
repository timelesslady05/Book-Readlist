"""Configure the SQLAlchemy engine and database session dependency."""

from collections.abc import Iterator
from pathlib import Path

from pydantic import Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import URL, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


class Settings(BaseSettings):
    """Read database and authentication settings from the backend .env file."""

    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "book_readlist"
    db_user: str = "postgres"
    db_password: SecretStr
    access_token_secret: SecretStr
    refresh_token_secret: SecretStr

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[1] / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @model_validator(mode="after")
    def validate_token_secrets(self) -> "Settings":
        """Require distinct secrets with enough entropy for signing tokens."""
        access_secret = self.access_token_secret.get_secret_value()
        refresh_secret = self.refresh_token_secret.get_secret_value()
        if len(access_secret) < 32 or len(refresh_secret) < 32:
            raise ValueError("JWT signing secrets must each be at least 32 characters.")
        if access_secret == refresh_secret:
            raise ValueError("Access and refresh token secrets must be different.")
        return self


settings = Settings()
database_url = URL.create(
    drivername="postgresql+psycopg",
    username=settings.db_user,
    password=settings.db_password.get_secret_value(),
    host=settings.db_host,
    port=settings.db_port,
    database=settings.db_name,
)

engine = create_engine(database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    """Base class for SQLAlchemy models."""


def get_db() -> Iterator[Session]:
    """Provide one database session per request and always close it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
