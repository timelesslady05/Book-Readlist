const OPEN_LIBRARY_API = 'https://openlibrary.org/search.json'

export async function searchBookCovers(title, author) {
  const params = new URLSearchParams({
    title: title.trim(),
    limit: '5',
    fields: 'key,title,author_name,cover_i,ebook_access,ia',
  })
  if (author.trim()) params.set('author', author.trim())

  const response = await fetch(`${OPEN_LIBRARY_API}?${params}`)
  if (!response.ok) {
    throw new Error('Book cover search is temporarily unavailable. Please try again.')
  }

  const data = await response.json()
  return (data.docs || [])
    .map((book) => {
      const onlineId = ['public', 'borrowable'].includes(book.ebook_access)
        ? book.ia?.[0]
        : null
      return {
        id: book.key,
        title: book.title || 'Untitled book',
        author: (book.author_name || []).join(', ') || 'Unknown author',
        coverUrl: book.cover_i
          ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
          : null,
        onlineUrl: onlineId ? `https://archive.org/details/${onlineId}` : null,
      }
    })
    .filter((book) => book.coverUrl || book.onlineUrl)
}
