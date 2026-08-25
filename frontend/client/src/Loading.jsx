export default function Loading({ message = 'Cargando...' }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  )
}
