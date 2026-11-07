import { useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import { BooksContext } from './BooksContext.js'
import { createBook, deleteBook, fetchBooks, updateBook } from '../services/api.js'
import { loadPreviewBooks } from '../services/previewBookService.js'

function BooksProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [books, setBooks] = useState(loadPreviewBooks)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadBooks() {
      setIsLoading(true)
      try {
        if (!isAuthenticated) {
          setBooks(loadPreviewBooks())
          setError('')
          return
        }

        const data = await fetchBooks()
        if (isMounted) {
          setBooks(data)
          setError('')
        }
      } catch (loadError) {
        if (isMounted) {
          setBooks(loadPreviewBooks())
          setError('Could not load your books right now. Showing preview data instead.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadBooks()
    return () => {
      isMounted = false
    }
  }, [isAuthenticated])

  const getBook = (bookId) => books.find((book) => book.id === String(bookId))

  const addBook = async (payload) => {
    const createdBook = await createBook(payload)
    setBooks((currentBooks) => [createdBook, ...currentBooks])
    return createdBook
  }

  const saveBook = async (bookId, payload) => {
    const updatedBook = await updateBook(bookId, payload)
    setBooks((currentBooks) =>
      currentBooks.map((book) => (book.id === String(bookId) ? updatedBook : book)),
    )
    return updatedBook
  }

  const removeBook = async (bookId) => {
    await deleteBook(Number(bookId))
    setBooks((currentBooks) =>
      currentBooks.filter((book) => book.id !== String(bookId)),
    )
  }

  const value = useMemo(
    () => ({
      books,
      isLoading,
      error,
      getBook,
      addBook,
      saveBook,
      removeBook,
    }),
    [books, isLoading, error],
  )

  return <BooksContext.Provider value={value}>{children}</BooksContext.Provider>
}

export default BooksProvider
