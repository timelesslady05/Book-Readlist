import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import BookCover from '../components/BookCover.jsx'
import CoverSearch from '../components/CoverSearch.jsx'
import PageHeading from '../components/PageHeading.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import useBooks from '../context/useBooks.js'

const statusLabels = {
  want_to_read: 'Want to read',
  currently_reading: 'Currently reading',
  completed: 'Completed',
}

function BookDetailsPage() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const { getBook, saveBook, removeBook } = useBooks()
  const [isEditing, setIsEditing] = useState(false)
  const [formMessage, setFormMessage] = useState('')
  const [draft, setDraft] = useState(null)
  const book = getBook(bookId)

  if (!book) {
    return (
      <div className="page">
        <div className="empty-state">
          <p className="eyebrow">NOT ON THIS SHELF</p>
          <h1>We couldn't find that book.</h1>
          <Link className="button button-primary" to="/books">
            Return to bookshelf
          </Link>
        </div>
      </div>
    )
  }

  function startEditing() {
    setDraft({
      title: book.title,
      author: book.author,
      cover_image_url: book.cover_image_url || '',
      online_read_url: book.online_read_url || '',
      genre: book.genre,
      description: book.description,
      reading_progress: book.readingProgress,
      status: book.status,
    })
    setIsEditing(true)
  }

  async function handleSave(event) {
    event.preventDefault()
    try {
      setFormMessage('')
      const updated = await saveBook(book.id, {
        title: draft.title.trim(),
        author: draft.author.trim(),
        cover_image_url: draft.cover_image_url || null,
        online_read_url: draft.online_read_url || null,
        genre: draft.genre,
        description: draft.description.trim(),
        reading_progress: Number(draft.reading_progress || 0),
        status: draft.status,
      })
      if (updated) {
        setIsEditing(false)
        setDraft(null)
      }
    } catch (error) {
      setFormMessage(error?.response?.data?.detail || 'Could not update this book.')
    }
  }

  async function handleDelete() {
    try {
      await removeBook(book.id)
      navigate('/books', { replace: true })
    } catch (error) {
      setFormMessage(error?.response?.data?.detail || 'Could not delete this book.')
    }
  }

  return (
    <div className="page">
      <Link className="back-link" to="/books">
        <span aria-hidden="true">←</span> Back to bookshelf
      </Link>

      {isEditing && draft ? (
        <form className="book-form book-form--detail" onSubmit={handleSave}>
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
              Progress
              <input min="0" max="100" value={draft.reading_progress} onChange={(event) => setDraft((current) => ({ ...current, reading_progress: Number(event.target.value) }))} type="number" />
            </label>
          </div>
          <CoverSearch
            title={draft.title}
            author={draft.author}
            selectedCoverUrl={draft.cover_image_url}
            selectedOnlineUrl={draft.online_read_url}
            onSelect={(result) => setDraft((current) => ({
              ...current,
              cover_image_url: result.coverUrl || '',
              online_read_url: result.onlineUrl || '',
            }))}
          />
          <label>
            Description
            <textarea rows="4" value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} />
          </label>
          {formMessage && <p className="form-message" role="status">{formMessage}</p>}
          <div className="book-form-actions">
            <button className="button button-secondary" type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
            <button className="button button-primary" type="submit">
              Save changes
            </button>
          </div>
        </form>
      ) : (
        <div className="book-detail-layout">
          <div className="detail-cover-wrap">
            <BookCover book={book} large />
            <span className="detail-cover-caption">A READLIST EDITION</span>
          </div>
          <div className="book-detail-copy">
            <PageHeading eyebrow={book.genre} title={book.title} />
            <p className="detail-author">by {book.author}</p>
            <div className="detail-meta">
              <span className="status-pill">{statusLabels[book.status]}</span>
              {book.rating ? (
                <span className="rating-label">
                  <span aria-hidden="true">★</span> {book.rating.toFixed(1)} / 5
                </span>
              ) : (
                <span className="muted">Not rated yet</span>
              )}
            </div>
            <div className="detail-progress">
              <div className="section-heading section-heading--compact">
                <h2>Reading progress</h2>
                <span>{book.readingProgress}%</span>
              </div>
              <ProgressBar value={book.readingProgress} />
            </div>
            <div className="detail-description">
              <h2>About this book</h2>
              <p>{book.description}</p>
            </div>
            {book.online_read_url && (
              <a
                className="button button-secondary online-book-link"
                href={book.online_read_url}
                rel="noreferrer"
                target="_blank"
              >
                Read or borrow online <span aria-hidden="true">↗</span>
              </a>
            )}
            {formMessage && <p className="form-message" role="status">{formMessage}</p>}
            <div className="book-form-actions">
              <button className="button button-secondary" type="button" onClick={startEditing}>
                Edit book
              </button>
              <button className="button button-primary" type="button" onClick={handleDelete}>
                Delete book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookDetailsPage
