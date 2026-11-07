import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="page">
      <div className="empty-state">
        <p className="eyebrow">PAGE NOT FOUND</p>
        <h1>This page wandered off the shelf.</h1>
        <Link className="button button-primary" to="/dashboard">
          Back to overview
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
