"""Create the FastAPI application and expose a basic health check."""

from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models
from app.database import Base, engine
from app.routers.auth import router as auth_router
from app.routers.books import router as books_router


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """Create tables for registered models when the API starts."""
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Personal Book Readlist API",
    description="API for a personal book library and reading tracker.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(books_router)


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    """Confirm that the API process is running."""
    return {"status": "ok"}
