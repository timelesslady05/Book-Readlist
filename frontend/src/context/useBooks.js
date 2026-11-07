import { useContext } from 'react'
import { BooksContext } from './BooksContext.js'

function useBooks() {
  const context = useContext(BooksContext)

  if (!context) {
    throw new Error('useBooks must be used inside a BooksProvider.')
  }

  return context
}

export default useBooks
