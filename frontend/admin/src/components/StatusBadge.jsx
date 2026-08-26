const STATUS_LABELS = {
  available: 'Disponible',
  sold_out: 'Agotado',
  active: 'Activo',
  inactive: 'Inactivo',
  pending: 'Pendiente',
  payment_review: 'En revisión',
  accepted: 'Aceptado',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
  completed: 'Completado',
  approved: 'Aprobado',
}

const STATUS_COLORS = {
  available: '#22c55e',
  active: '#22c55e',
  accepted: '#22c55e',
  completed: '#22c55e',
  approved: '#22c55e',
  pending: '#f97316',
  payment_review: '#f59e0b',
  rejected: '#ef4444',
  cancelled: '#6b7280',
  sold_out: '#6b7280',
  inactive: '#6b7280',
}

export default function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || '#6b7280'
  const label = STATUS_LABELS[status] || status
  return (
    <span
      className="status-badge"
      style={{
        background: `${color}1a`,
        color: color,
        borderColor: color,
      }}
    >
      {label}
    </span>
  )
}
