export default function Empty({ message = 'No hay datos.' }) {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <span className="empty-icon" aria-hidden="true">📭</span>
      <p className="empty-text">{message}</p>
    </div>
  )
}
