import { useState } from 'react'
import { searchBookCovers } from '../services/bookCoverSearch.js'

function CoverSearch({ title, author, onSelect, selectedCoverUrl }) {
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [message, setMessage] = useState('')

  function handleSelect(coverUrl) {
    onSelect(coverUrl)
    setMessage('Cover selected.')
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
        setMessage('No covers found. You can still save the book without one.')
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
            <button
              aria-label={`Use cover for ${book.title} by ${book.author}`}
              aria-pressed={selectedCoverUrl === book.coverUrl}
              className={`cover-search-result${selectedCoverUrl === book.coverUrl ? ' cover-search-result--selected' : ''}`}
              key={book.id}
              onClick={() => handleSelect(book.coverUrl)}
              type="button"
            >
              <img src={book.coverUrl} alt="" />
              <span>{book.title}<small>{book.author}</small></span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default CoverSearch
