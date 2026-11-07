import { useState } from 'react'
import { searchBookCovers } from '../services/bookCoverSearch.js'

function CoverSearch({ title, author, onSelect, selectedCoverUrl, selectedOnlineUrl }) {
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [message, setMessage] = useState('')

  function handleSelect(book) {
    onSelect(book)
    setMessage(book.onlineUrl ? 'Cover and online link selected.' : 'Cover selected.')
  }

  async function handleSearch() {
    if (!title.trim()) {
      setMessage('Enter a book title before searching for its cover.')
      setResults([])
      return
    }

    try {
      setIsSearching(true)
      setMessage('')
      const covers = await searchBookCovers(title, author)
      setResults(covers)
      if (!covers.length) {
        setMessage('No cover or online edition found. You can still save the book.')
      }
    } catch (error) {
      setMessage(error.message || 'Could not search for book covers.')
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="cover-search">
      <div className="cover-search-heading">
        <p>Book cover <span>(optional)</span></p>
        <button
          className="text-button"
          disabled={isSearching}
          onClick={handleSearch}
          type="button"
        >
          {isSearching ? 'Searching...' : 'Find cover online'}
        </button>
      </div>
      {message && <p className="form-message" role="status">{message}</p>}
      {results.length > 0 && (
        <div className="cover-search-results" aria-label="Cover search results">
          {results.map((book) => (
            <div
              className="cover-search-result"
              key={book.id}
            >
              <button
                aria-label={`Select details for ${book.title} by ${book.author}`}
                aria-pressed={selectedCoverUrl === book.coverUrl && selectedOnlineUrl === book.onlineUrl}
                className={`cover-search-result-select${selectedCoverUrl === book.coverUrl && selectedOnlineUrl === book.onlineUrl ? ' cover-search-result-select--selected' : ''}`}
                onClick={() => handleSelect(book)}
                type="button"
              >
                {book.coverUrl ? <img src={book.coverUrl} alt="" /> : <span className="cover-search-no-image">No cover</span>}
                <span>{book.title}<small>{book.author}</small></span>
              </button>
              {book.onlineUrl ? (
                <a href={book.onlineUrl} rel="noreferrer" target="_blank">
                  Read or borrow online
                </a>
              ) : (
                <span className="cover-search-unavailable">No online edition listed</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CoverSearch
