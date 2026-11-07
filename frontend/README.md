# Readlist frontend

This is the React and Vite frontend for the personal book readlist app. The current pages use sample books so you can explore the layout before the API is connected.

## Run the frontend

Open a terminal in the `frontend` folder and run:

```powershell
npm install
npm run dev
```

Open the local address printed by Vite in your browser. The bookshelf, dashboard, and book details pages are available from the navigation.

## Check the frontend

```powershell
npm run lint
npm run build
```

## Project layout

- `src/components/` contains reusable interface pieces such as book cards and navigation.
- `src/pages/` contains the dashboard, bookshelf, book details, login, and registration pages.
- `src/context/` shares preview book data between pages.
- `src/services/` contains the temporary preview data loader; it will be replaced by API calls in the connection phase.
- `src/data/` contains sample books used in preview mode.
