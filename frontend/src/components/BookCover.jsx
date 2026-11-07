function BookCover({ book, large = false }) {
  return (
    <div
      className={`book-cover book-cover--${book.coverTone || 'sage'}${large ? ' book-cover--large' : ''}`}
      role="img"
      aria-label={`Illustrated cover for ${book.title}`}
    >
      <span className="cover-imprint">A READLIST EDITION</span>
      <span className="cover-title">{book.title}</span>
      <span className="cover-author">{book.author}</span>
      <span className="cover-orbit" aria-hidden="true" />
    </div>
  )
}

export default BookCover
