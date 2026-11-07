import { useState } from 'react'

function BookCover({ book, large = false }) {
  const [failedImageUrl, setFailedImageUrl] = useState('')
  const hasImage = book.cover_image_url && failedImageUrl !== book.cover_image_url

  return (
    <div
      className={`book-cover book-cover--${book.coverTone || 'sage'}${large ? ' book-cover--large' : ''}${hasImage ? ' book-cover--has-image' : ''}`}
      role="img"
      aria-label={`Cover for ${book.title}`}
    >
      {hasImage ? (
        <img
          className="book-cover-image"
          src={book.cover_image_url}
          alt=""
          onError={() => setFailedImageUrl(book.cover_image_url)}
        />
      ) : (
        <>
          <span className="cover-imprint">A READLIST EDITION</span>
          <span className="cover-title">{book.title}</span>
          <span className="cover-author">{book.author}</span>
          <span className="cover-orbit" aria-hidden="true" />
        </>
      )}
    </div>
  )
}

export default BookCover
