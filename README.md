# Personal Book Readlist

A full-stack reading tracker for keeping a personal bookshelf. Create an account, organize books by reading status, track progress, and find real book covers online.

## What you can do

- Register and sign in to a personal account.
- Add, view, edit, and delete books in your private library.
- Track books as **Want to read**, **Currently reading**, or **Completed**.
- Save a book's genre, description, rating, and reading progress.
- Search and filter your bookshelf.
- Search Open Library for a matching cover when adding or editing a book. Cover search is optional; the app uses an illustrated fallback if no cover is selected.

## Technology

- **Frontend:** React, Vite, JavaScript, React Router, Axios
- **Backend:** Python, FastAPI, SQLAlchemy, Pydantic, JWT authentication
- **Database:** PostgreSQL

## Run the application locally

You will need Python, Node.js with npm, and PostgreSQL installed and running.

### 1. Create the database

Create a PostgreSQL database called `book_readlist`. For example, in pgAdmin's Query Tool, run:

```sql
CREATE DATABASE book_readlist;
```

The app's default local database settings are `localhost:5432`, database `book_readlist`, and username `postgres`.

### 2. Configure and start the backend

Open a PowerShell terminal at the project folder and run:

```powershell
Copy-Item backend\.env.example backend\.env
notepad backend\.env
```

In `backend\.env`, replace `DB_PASSWORD` with your PostgreSQL password. Replace the two JWT secret placeholders with different random values of at least 32 characters. You can generate two values with Python:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48)); print(secrets.token_urlsafe(48))"
```

Keep `backend\.env` private; it contains local credentials and should not be committed.

In the same terminal, move into the backend folder, install its packages, and start the API:

```powershell
Set-Location backend
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

The API creates the application tables when it starts.

### 3. Start the frontend

Open a **second** PowerShell terminal at the project folder:

```powershell
Set-Location frontend
npm install
npm run dev
```

Open the address Vite prints in the terminal, usually [http://localhost:5173](http://localhost:5173).

## Useful local links

- Web application: [http://localhost:5173](http://localhost:5173)
- API health check: [http://localhost:8000/health](http://localhost:8000/health)
- Interactive API documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

Both backend and frontend terminals need to remain open while you use the app.

## Checks

Run frontend checks from the `frontend` folder:

```powershell
npm run lint
npm run build
```

## Project structure

```text
backend/
  app/
    routers/       Authentication and book API routes
    auth.py        Password hashing and token authentication
    database.py    PostgreSQL connection and sessions
    main.py        FastAPI application
    models.py      SQLAlchemy database models
    schemas.py     Pydantic request and response schemas
  requirements.txt
  .env.example
frontend/
  src/
    components/    Shared interface components
    context/       Authentication and book-library state
    pages/         Dashboard, bookshelf, login, and book details
    services/      API client and Open Library cover search
```

## Troubleshooting

- **Database connection error:** Confirm PostgreSQL is running, the `book_readlist` database exists, and the values in `backend\.env` match your PostgreSQL setup.
- **JWT secret validation error:** Make sure the access and refresh secrets are different and each is at least 32 characters.
- **Frontend cannot reach the API:** Start the backend and check that `http://localhost:8000/health` returns `{"status":"ok"}`.
- **Cover search returns no results:** Check your internet connection and try the full title and author. You can save the book without a cover.
