import { useMemo, useState } from 'react'
import BookCard from '../components/BookCard.jsx'
import PageHeading from '../components/PageHeading.jsx'
import useBooks from '../context/useBooks.js'

const emptyDraft = {
  title: '',
  author: '',
  genre: 'Fantasy',
  status: 'want_to_read',
  description: '',
  reading_progress: 0,
}

function BookshelfPage() {
  const { books, addBook, isLoading, error } = useBooks()
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('all')
  const [status, setStatus] = useState('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [draft, setDraft] = useState(emptyDraft)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formMessage, setFormMessage] = useState('')

  const genres = useMemo(
    () => [...new Set(books.map((book) => book.genre).filter(Boolean))].sort(),
    [books],
  )

  const filteredBooks = books.filter((book) => {
    const searchText = search.trim().toLowerCase()
    const matchesSearch =
      !searchText ||
      `${book.title} ${book.author} ${book.genre}`.toLowerCase().includes(searchText)
    const matchesGenre = genre === 'all' || book.genre === genre
    const matchesStatus = status === 'all' || book.status === status
    return matchesSearch && matchesGenre && matchesStatus
  })

  async function handleCreateBook(event) {
    event.preventDefault()
    try {
      setIsSubmitting(true)
      setFormMessage('')
      await addBook({
        title: draft.title.trim(),
        author: draft.author.trim(),
        genre: draft.genre || 'Fantasy',
        description: draft.description.trim() || 'No description yet.',
        reading_progress: Number(draft.reading_progress || 0),
        status: draft.status,
      })
      setDraft(emptyDraft)
      setIsFormOpen(false)
    } catch (submitError) {
      setFormMessage(submitError?.response?.data?.detail || 'Unable to add this book.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page">
      <PageHeading
        eyebrow="YOUR PERSONAL LIBRARY"
        title="My bookshelf"
        description={`${books.length} books, all in one happy place.`}
        action={
          <button className="button button-primary" type="button" onClick={() => setIsFormOpen((open) => !open)}>
            {isFormOpen ? 'Close form' : 'Add book'}
          </button>
        }
      />

      {isFormOpen && (
        <form className="book-form" onSubmit={handleCreateBook}>
          <div className="book-form-grid">
            <label>
              Title
              <input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} required type="text" />
            </label>
            <label>
              Author
              <input value={draft.author} onChange={(event) => setDraft((current) => ({ ...current, author: event.target.value }))} required type="text" />
            </label>
            <label>
              Genre
              <select value={draft.genre} onChange={(event) => setDraft((current) => ({ ...current, genre: event.target.value }))}>
                <option value="Fantasy">Fantasy</option>
                <option value="Romance">Romance</option>
                <option value="Mystery">Mystery</option>
                <option value="Classics">Classics</option>
                <option value="Non-fiction">Non-fiction</option>
              </select>
            </label>
            <label>
              Status
              <select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}>
                <option value="want_to_read">Want to read</option>
                <option value="currently_reading">Currently reading</option>
                <option value="completed">Completed</option>
              </select>
            </label>
            <label>
              Reading progress
              <input min="0" max="100" value={draft.reading_progress} onChange={(event) => setDraft((current) => ({ ...current, reading_progress: Number(event.target.value) }))} type="number" />
            </label>
          </div>
          <label>
            Description
            <textarea rows="3" value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} />
          </label>
          {formMessage && <p className="form-message" role="status">{formMessage}</p>}
          <div className="book-form-actions">
            <button className="button button-secondary" type="button" onClick={() => setIsFormOpen(false)}>
              Cancel
            </button>
            <button className="button button-primary" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Saving...' : 'Save book'}
            </button>
          </div>
        </form>
      )}

      {error && <div className="form-message form-message--warning">{error}</div>}

      <section className="shelf-toolbar" aria-label="Search and filter your bookshelf">
        <label className="search-field">
          <span className="visually-hidden">Search by title, author, or genre</span>
          <span className="search-icon" aria-hidden="true">
            ⌕
          </span>
          <input
            type="search"
            placeholder="Search title, author, or genre"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label className="select-field">
          <span className="visually-hidden">Filter by genre</span>
          <select value={genre} onChange={(event) => setGenre(event.target.value)}>
            <option value="all">All genres</option>
            {genres.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="select-field">
          <span className="visually-hidden">Filter by reading status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="want_to_read">Want to read</option>
            <option value="currently_reading">Currently reading</option>
            <option value="completed">Completed</option>
          </select>
        </label>
      </section>

      <div className="shelf-result-line">
        <span>{isLoading ? 'Loading...' : `${filteredBooks.length} books`}</span>
        {(search || genre !== 'all' || status !== 'all') && (
          <button
            className="text-button"
            type="button"
            onClick={() => {
              setSearch('')
              setGenre('all')
              setStatus('all')
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {filteredBooks.length > 0 ? (
        <div className="book-grid">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-state-mark" aria-hidden="true">
            0
          </span>
          <h2>No books found</h2>
          <p>Try a different search or clear your filters.</p>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => {
              setSearch('')
              setGenre('all')
              setStatus('all')
            }}
          >
            Show every book
          </button>
        </div>
      )}
    </div>
  )
}

export default BookshelfPage
