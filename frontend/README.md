# Readlist frontend

This is the React and Vite frontend for the personal book readlist app. It connects to the FastAPI backend for accounts and personal book libraries.

## Run the frontend

Open a terminal in the `frontend` folder and run:

```powershell
npm install
npm run dev
```

Open the local address printed by Vite in your browser. The bookshelf, dashboard, and book details pages are available from the navigation.

## Find a book cover

When adding or editing a book, enter its title and optionally its author, then choose **Find cover online**. Select a matching edition to save its cover and, when Open Library lists a public or borrowable digital copy, its **Read or borrow online** link. Links are also shown on the book details page. Cover search uses Open Library's public search and covers services and does not require an API key. If no digital edition is listed, the book can still be saved without an online link.

## Check the frontend

```powershell
npm run lint
npm run build
```

## Project layout

- `src/components/` contains reusable interface pieces such as book cards and navigation.
- `src/pages/` contains the dashboard, bookshelf, book details, login, and registration pages.
- `src/context/` shares authentication state and the user's book library between pages.
- `src/services/` contains the backend API client and public book-cover search.
- `src/data/` contains sample books used in preview mode.
