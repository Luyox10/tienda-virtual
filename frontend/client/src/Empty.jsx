export default function Empty({ message = 'No hay información para mostrar.' }) {
  return (
    <div className="empty" role="status" aria-live="polite">
      <p>{message}</p>
    </div>
  )
}
