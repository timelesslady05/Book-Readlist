const OPEN_LIBRARY_API = 'https://openlibrary.org/search.json'

export async function searchBookCovers(title, author) {
  const params = new URLSearchParams({
    title: title.trim(),
    limit: '8',
    fields: 'key,title,author_name,cover_i',
  })
  if (author.trim()) params.set('author', author.trim())

  const response = await fetch(`${OPEN_LIBRARY_API}?${params}`)
  if (!response.ok) {
    throw new Error('Book cover search is temporarily unavailable. Please try again.')
  }

  const data = await response.json()
  return (data.docs || [])
    .filter((book) => book.cover_i)
    .map((book) => ({
      id: book.key,
      title: book.title || 'Untitled book',
      author: (book.author_name || []).join(', ') || 'Unknown author',
      coverUrl: `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`,
    }))
}
