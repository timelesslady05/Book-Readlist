import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('readlist_access_token', token)
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    return
  }

  localStorage.removeItem('readlist_access_token')
  delete api.defaults.headers.common.Authorization
}

export function setRefreshToken(token) {
  if (token) {
    localStorage.setItem('readlist_refresh_token', token)
    return
  }

  localStorage.removeItem('readlist_refresh_token')
}

export function getStoredTokens() {
  return {
    accessToken: localStorage.getItem('readlist_access_token'),
    refreshToken: localStorage.getItem('readlist_refresh_token'),
  }
}

export function clearStoredTokens() {
  setAuthToken(null)
  setRefreshToken(null)
}

api.interceptors.request.use((config) => {
  const { accessToken } = getStoredTokens()
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const { refreshToken } = getStoredTokens()

    if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
      originalRequest._retry = true
      try {
        const response = await api.post('/auth/refresh', {
          refresh_token: refreshToken,
        })
        const nextAccessToken = response.data.access_token
        setAuthToken(nextAccessToken)
        setRefreshToken(response.data.refresh_token)
        originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`
        return api(originalRequest)
      } catch {
        clearStoredTokens()
      }
    }

    return Promise.reject(error)
  },
)

export const normalizeStatus = (value) => {
  if (!value) return 'want_to_read'
  const mapping = {
    want_to_read: 'want_to_read',
    currently_reading: 'currently_reading',
    completed: 'completed',
  }
  return mapping[value] || 'want_to_read'
}

export function normalizeBook(book) {
  if (!book) return null

  const coverToneMap = {
    Fantasy: 'sage',
    Romance: 'rose',
    Mystery: 'plum',
    'Classics': 'plum',
    'Non-fiction': 'sand',
  }

  return {
    id: String(book.id),
    title: book.title,
    author: book.author,
    genre: book.genre || 'General',
    description: book.description || 'No description yet.',
    cover_image_url: book.cover_image_url || null,
    rating: typeof book.rating === 'number' ? Number(book.rating) : null,
    readingProgress: Number(book.reading_progress ?? 0),
    status: normalizeStatus(book.status),
    coverTone: coverToneMap[book.genre] || 'sage',
    created_at: book.created_at,
    updated_at: book.updated_at,
  }
}

export function loginUser(email, password) {
  const params = new URLSearchParams({ username: email, password })
  return api.post('/auth/token', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

export function registerUser(email, password) {
  return api.post('/auth/register', { email, password })
}

export function fetchCurrentUser() {
  return api.get('/auth/me')
}

export function fetchBooks() {
  return api.get('/books').then((response) => response.data.map(normalizeBook))
}

export function createBook(payload) {
  const body = {
    ...payload,
    status: normalizeStatus(payload.status),
    reading_progress: Number(payload.reading_progress ?? payload.readingProgress ?? 0),
  }
  delete body.readingProgress
  return api.post('/books', body).then((response) => normalizeBook(response.data))
}

export function updateBook(bookId, payload) {
  const body = {
    ...payload,
    status: payload.status ? normalizeStatus(payload.status) : undefined,
    reading_progress:
      payload.reading_progress ??
      ((typeof payload.readingProgress === 'number' && payload.readingProgress) || undefined),
  }
  if (body.readingProgress !== undefined) delete body.readingProgress
  if (body.reading_progress === undefined) delete body.reading_progress
  return api.patch(`/books/${bookId}`, body).then((response) => normalizeBook(response.data))
}

export function deleteBook(bookId) {
  return api.delete(`/books/${bookId}`)
}

export default api
