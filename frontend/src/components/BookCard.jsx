import { Link } from 'react-router-dom'
import BookCover from './BookCover.jsx'
import ProgressBar from './ProgressBar.jsx'

const statusLabels = {
  want_to_read: 'Want to read',
  currently_reading: 'Currently reading',
  completed: 'Completed',
}

function BookCard({ book }) {
  return (
    <article className="book-card">
      <Link className="book-card-link" to={`/books/${book.id}`}>
        <BookCover book={book} />
        <div className="book-card-copy">
          <div className="book-card-heading">
            <div>
              <span className="eyebrow">{book.genre}</span>
              <h3>{book.title}</h3>
            </div>
            <span className="card-arrow" aria-hidden="true">
              ↗
            </span>
          </div>
          <p className="muted">{book.author}</p>
          <div className="card-progress">
            <span className="status-label">{statusLabels[book.status]}</span>
            <ProgressBar value={book.readingProgress} />
          </div>
        </div>
      </Link>
    </article>
  )
}

export default BookCard
