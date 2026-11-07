import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
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
      await register(email, password)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      const detail = error?.response?.data?.detail || 'Registration failed. Please try again.'
      setMessage(detail)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page auth-page">
      <div className="auth-card">
        <p className="eyebrow">START YOUR LIBRARY</p>
        <h1>Your next chapter starts here.</h1>
        <p className="auth-intro">Create a personal space for every book you want to remember.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email address
            <input autoComplete="email" name="email" placeholder="you@example.com" required type="email" />
          </label>
          <label>
            Password
            <input autoComplete="new-password" minLength="8" name="password" placeholder="At least 8 characters" required type="password" />
          </label>
          {message && <p className="form-message" role="status">{message}</p>}
          <button className="button button-primary button-wide" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Creating account...' : 'Create my account'}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
