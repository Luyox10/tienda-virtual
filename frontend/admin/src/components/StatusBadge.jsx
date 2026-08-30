const STATUS_LABELS = {
  available: 'Disponible',
  sold_out: 'Agotado',
  active: 'Activo',
  inactive: 'Inactivo',
  pending: 'Pendiente',
  payment_review: 'Pendiente',
  accepted: 'Aceptado',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
  completed: 'Completado',
  approved: 'Aprobado',
  APPROVED: 'Aprobado',
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  PENDING_PAYMENT: 'Enviado',
  PAYMENT_REVIEW: 'Pendiente',
  ACCEPTED: 'Aceptado',
  REJECTED: 'Rechazado',
  CANCELLED: 'Cancelado',
}

const STATUS_COLORS = {
  available: '#22c55e',
  sold_out: '#6b7280',
  active: '#22c55e',
  inactive: '#6b7280',
  pending: '#f97316',
  payment_review: '#f59e0b',
  accepted: '#22c55e',
  rejected: '#ef4444',
  cancelled: '#6b7280',
  completed: '#22c55e',
  approved: '#22c55e',
  APPROVED: '#22c55e',
  PENDING: '#f97316',
  PAID: '#22c55e',
  PENDING_PAYMENT: '#f97316',
  PAYMENT_REVIEW: '#f59e0b',
  ACCEPTED: '#22c55e',
  REJECTED: '#ef4444',
  CANCELLED: '#6b7280',
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
