import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import useBooks from '../context/useBooks.js'
import { getGenreThemeClass } from '../utils/genreThemes.js'

function AppShell() {
  const { isAuthenticated, user, logout } = useAuth()
  const { books } = useBooks()
  const location = useLocation()
  const matchedBookId = location.pathname.match(/^\/books\/(\d+)$/)?.[1]
  const currentBook = books.find((book) => String(book.id) === matchedBookId)
  const themeClass = getGenreThemeClass(currentBook?.genre || 'Fantasy')

  return (
    <div className={`app-shell ${themeClass}`}>
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink className="brand" to={isAuthenticated ? '/dashboard' : '/login'} aria-label="Readlist home">
            <span className="brand-mark" aria-hidden="true">
              <span />
              <span />
            </span>
            <span>readlist</span>
          </NavLink>

          <nav className="main-nav" aria-label="Main navigation">
            <NavLink
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              to="/dashboard"
            >
              Overview
            </NavLink>
            <NavLink
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              to="/books"
            >
              My bookshelf
            </NavLink>
          </nav>

          <div className="topbar-actions">
            {isAuthenticated ? (
              <>
                <span className="reader-avatar" aria-hidden="true">
                  {user?.email?.slice(0, 1).toUpperCase() || 'R'}
                </span>
                <button className="text-button sign-out-button" type="button" onClick={logout}>
                  Sign out
                </button>
              </>
            ) : (
              <NavLink className="text-link sign-in-link" to="/login">
                Sign in
              </NavLink>
            )}
          </div>
        </div>
      </header>

      {!isAuthenticated && (
        <div className="preview-notice">
          Preview mode: sample books are shown until the API is connected.
        </div>
      )}

      <main className="page-content">
        <Outlet />
      </main>

      <footer className="site-footer">
        <span>Make room for another story.</span>
        <NavLink to="/books">Back to your bookshelf</NavLink>
      </footer>
    </div>
  )
}

export default AppShell
