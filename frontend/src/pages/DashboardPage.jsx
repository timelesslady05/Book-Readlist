import { Link } from 'react-router-dom'
import BookCard from '../components/BookCard.jsx'
import BookCover from '../components/BookCover.jsx'
import PageHeading from '../components/PageHeading.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import useBooks from '../context/useBooks.js'
import { getGenreThemeClass } from '../utils/genreThemes.js'

function DashboardPage() {
  const { books } = useBooks()
  const currentlyReading = books.filter((book) => book.status === 'currently_reading')
  const completed = books.filter((book) => book.status === 'completed')
  const featuredBook = currentlyReading[0]
  const recentBooks = [...books].slice(0, 3)
  const featuredTheme = getGenreThemeClass(featuredBook?.genre || 'Fantasy')

  return (
    <div className={`page dashboard-page ${featuredTheme}`}>
      <PageHeading
        eyebrow="YOUR READING SPACE"
        title="A good book makes a good day."
        description="A little corner to keep track of the stories you're living in."
      />

      <section className="stat-grid" aria-label="Reading statistics">
        <div className="stat-card stat-card--accent">
          <span className="stat-label">On your shelf</span>
          <strong>{books.length}</strong>
          <span className="stat-footnote">stories and ideas</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">In progress</span>
          <strong>{currentlyReading.length}</strong>
          <span className="stat-footnote">pages turning right now</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Finished</span>
          <strong>{completed.length}</strong>
          <span className="stat-footnote">stories kept with you</span>
        </div>
      </section>

      {featuredBook ? (
        <section className="continue-panel">
          <div className="continue-copy">
            <p className="eyebrow eyebrow-light">PICK UP WHERE YOU LEFT OFF</p>
            <h2>{featuredBook.title}</h2>
            <p className="continue-author">by {featuredBook.author}</p>
            <div className="continue-progress">
              <ProgressBar value={featuredBook.readingProgress} />
              <span>You're making lovely progress.</span>
            </div>
            <Link className="button button-light" to={`/books/${featuredBook.id}`}>
              Open book details <span aria-hidden="true">→</span>
            </Link>
          </div>
          <Link className="continue-cover-link" to={`/books/${featuredBook.id}`} aria-label={`View ${featuredBook.title}`}>
            <BookCover book={featuredBook} large />
          </Link>
          <span className="continue-sparkle" aria-hidden="true">
            ✳
          </span>
        </section>
      ) : (
        <section className="empty-panel">
          <p className="eyebrow">YOUR NEXT CHAPTER</p>
          <h2>Choose a book to begin.</h2>
          <Link className="button button-primary" to="/books">
            Browse your shelf
          </Link>
        </section>
      )}

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A FEW TO VISIT AGAIN</p>
            <h2>Recently on your shelf</h2>
          </div>
          <Link className="text-link" to="/books">
            See all books <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="book-grid book-grid--dashboard">
          {recentBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default DashboardPage
