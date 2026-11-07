function ProgressBar({ value, label = 'Reading progress' }) {
  return (
    <div className="progress-wrap">
      <div className="progress-track" role="progressbar" aria-label={label} aria-valuemin="0" aria-valuemax="100" aria-valuenow={value}>
        <span className="progress-fill" style={{ width: `${value}%` }} />
      </div>
      <span className="progress-value">{value}%</span>
    </div>
  )
}

export default ProgressBar
