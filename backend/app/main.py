"""Create the FastAPI application and expose a basic health check."""

from fastapi import FastAPI

app = FastAPI(
    title="Personal Book Readlist API",
    description="API for a personal book library and reading tracker.",
    version="0.1.0",
)


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    """Confirm that the API process is running."""
    return {"status": "ok"}
