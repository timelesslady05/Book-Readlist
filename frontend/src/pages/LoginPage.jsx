import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const email = form.email.value.trim()
    const password = form.password.value

    try {
      setIsSubmitting(true)
      setMessage('')
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      const detail = error?.response?.data?.detail || 'Unable to sign in right now.'
      setMessage(detail)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <p className="eyebrow">WELCOME BACK</p>
        <h1>Good to see you again.</h1>
        <p className="auth-intro">Sign in to find your way back to the stories on your shelf.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email address
            <input autoComplete="email" name="email" placeholder="you@example.com" required type="email" />
          </label>
          <label>
            Password
            <input autoComplete="current-password" name="password" placeholder="Your password" required type="password" />
          </label>
          {message && <p className="form-message" role="status">{message}</p>}
          <button className="button button-primary button-wide" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="auth-switch">
          New to Readlist? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
