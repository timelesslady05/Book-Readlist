import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import BooksProvider from './context/BooksProvider.jsx'
import './index.css'
import './App.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BooksProvider>
          <App />
        </BooksProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
