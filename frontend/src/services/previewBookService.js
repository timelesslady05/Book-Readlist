import { previewBooks } from '../data/previewBooks.js'

export function loadPreviewBooks() {
  return previewBooks.map((book) => ({ ...book }))
}
