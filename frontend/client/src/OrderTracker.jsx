import { useEffect, useState } from 'react'
import { getOrder } from './services/api'
import { WHATSAPP_NUMBER } from './config'

const STATUS_ORDER = [
  'PENDING_PAYMENT',
  'PAYMENT_REVIEW',
  'ACCEPTED',
  'COMPLETED',
]

const STATUS_LABELS = {
  PENDING_PAYMENT: { label: 'Pedido creado', icon: '✓', active: true },
  PAYMENT_REVIEW: { label: 'Pago en revisión', icon: '🟡', active: true },
  ACCEPTED: { label: 'Pedido aceptado', icon: '✓', active: true },
  REJECTED: { label: 'Pago rechazado', icon: '✗', active: true, danger: true },
  CANCELLED: { label: 'Pedido cancelado', icon: '✗', active: true, danger: true },
  COMPLETED: { label: 'Pedido completado', icon: '✓', active: true },
}

export default function OrderTracker({ order, token }) {
  const [live, setLive] = useState(order)

  useEffect(() => {
    const id = order.id
    const interval = setInterval(() => {
      getOrder(id, token)
        .then(setLive)
        .catch(() => {})
    }, 10000)
    return () => clearInterval(interval)
  }, [order, token])

  const status = live.status
  const isTerminal = status === 'REJECTED' || status === 'CANCELLED'
  const reached = (step) => {
    if (isTerminal) return status === step
    if (status === 'PENDING_PAYMENT' && step === 'PENDING_PAYMENT') return true
    if (status === 'PAYMENT_REVIEW') return step !== 'ACCEPTED' && step !== 'COMPLETED'
    if (status === 'ACCEPTED' || status === 'COMPLETED') return step !== 'COMPLETED' || status === 'COMPLETED'
    return false
  }

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hola, consulto por mi pedido #${live.id} de DeliTurnos.`
  )}`

  return (
    <div className="card detail tracker-card">
      <h3>Pedido #{live.id}</h3>
      <p className="order-total">Total: S/ {live.total}</p>
      <p>
        Estado actual:{' '}
        <span className={`badge ${status === 'ACCEPTED' || status === 'COMPLETED' ? 'accepted' : isTerminal ? 'rejected' : 'pending'}`}>
          {STATUS_LABELS[status]?.label || status}
        </span>
      </p>

      <div className="tracker">
        {STATUS_ORDER.map((step) => {
          const info = STATUS_LABELS[step]
          const done = reached(step)
          const current = status === step
          return (
            <div
              key={step}
              className={`tracker-step ${done ? 'done' : ''} ${current ? 'current' : ''} ${isTerminal && !done ? 'muted' : ''}`}
            >
              <div className="tracker-icon">{done ? info.icon : '⚪'}</div>
              <p className="tracker-label">{info.label}</p>
            </div>
          )
        })}
      </div>

      <div className="tracker-products">
        <h4>Productos</h4>
        <ul>
          {live.items?.map((i) => (
            <li key={i.id}>
              {i.product_name} x {i.quantity} — S/ {i.subtotal}
            </li>
          ))}
        </ul>
      </div>

      <div className="whatsapp-section">
        <p>¿Necesitas ayuda?</p>
        <a
          className="btn whatsapp"
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
        >
          💬 Contactar por WhatsApp
        </a>
      </div>
    </div>
  )
}
