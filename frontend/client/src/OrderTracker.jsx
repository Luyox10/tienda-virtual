import { useEffect, useState } from 'react'
import { getOrder } from './services/ordersService'
import { WHATSAPP_NUMBER } from './config'

const STEPS = [
  { key: 'PENDING_PAYMENT', label: 'Pedido recibido', desc: 'Hemos recibido tu pedido.' },
  { key: 'PAYMENT_REVIEW', label: 'Pago confirmado', desc: 'Tu pago fue confirmado.' },
  { key: 'ACCEPTED', label: 'En preparación', desc: 'Tu pedido se está preparando.' },
  { key: 'READY', label: 'Listo para entrega', desc: 'Tu pedido está listo.' },
  { key: 'COMPLETED', label: 'Entregado', desc: 'Pedido entregado.' },
]

const STATUS_LABELS = {
  PENDING_PAYMENT: { label: 'Pendiente de pago', color: 'pending' },
  PAYMENT_REVIEW: { label: 'Pago en revisión', color: 'pending' },
  ACCEPTED: { label: 'Aceptado', color: 'accepted' },
  REJECTED: { label: 'Rechazado', color: 'rejected' },
  CANCELLED: { label: 'Cancelado', color: 'rejected' },
  COMPLETED: { label: 'Entregado', color: 'accepted' },
}

export default function OrderTracker({ order, token, onBack }) {
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
  const isDone = (step) => {
    if (status === 'REJECTED' || status === 'CANCELLED') return false
    const currentIndex = STEPS.findIndex((s) => s.key === status)
    const stepIndex = STEPS.findIndex((s) => s.key === step)
    return stepIndex <= currentIndex
  }

  const isCurrent = (step) => step === status

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hola, consulto por mi pedido #${live.id} de DeliTurnos.`
  )}`

  const currentInfo = STATUS_LABELS[status] || { label: status, color: 'pending' }

  return (
    <main className="page tracker-page">
      <h2 className="page-title">
        <span>Seguimiento del pedido</span>
        <button className="btn secondary small" onClick={onBack}>
          Volver
        </button>
      </h2>

      <div className="card order-summary">
        <div className="order-summary-row">
          <div>
            <p className="order-label">Pedido</p>
            <p className="order-big">#ORD-{String(live.id).padStart(4, '0')}</p>
          </div>
          <div>
            <p className="order-label">Total</p>
            <p className="order-big">S/ {Number(live.total).toFixed(2)}</p>
          </div>
          <div>
            <p className="order-label">Estado</p>
            <span className={`order-status-badge ${currentInfo.color}`}>{currentInfo.label}</span>
          </div>
        </div>
        <p className="order-date">{new Date(live.created_at).toLocaleString('es-PE')}</p>
      </div>

      <div className="card tracker-timeline">
        {STEPS.map((step, index) => {
          const done = isDone(step.key)
          const current = isCurrent(step.key)
          const pending = !done
          const date = done && live.created_at ? new Date(live.created_at).toLocaleString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Pendiente'
          return (
            <div key={step.key} className={`timeline-item ${done ? 'done' : ''} ${current ? 'current' : ''}`}>
              <div className="timeline-marker" aria-hidden="true">
                {done ? '✓' : current ? '🟠' : '○'}
              </div>
              <div className="timeline-content">
                <strong>{step.label}</strong>
                <p>{current ? step.desc : date}</p>
              </div>
              {index < STEPS.length - 1 && <div className="timeline-line" aria-hidden="true" />}
            </div>
          )
        })}
      </div>

      <div className="card tracker-products">
        <h4>Productos</h4>
        <ul>
          {live.items?.map((i) => (
            <li key={i.id}>
              {i.product_name} x {i.quantity} — S/ {Number(i.subtotal).toFixed(2)}
            </li>
          ))}
        </ul>
      </div>

      {status === 'ACCEPTED' && (
        <div className="card recomendation">
          <p className="recomendation-text">
            Para una mejor entrega del producto, comunícate por WhatsApp con nosotros.
          </p>
          <a className="btn whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer">
            💬 Escribir por WhatsApp
          </a>
        </div>
      )}

      <div className="card help-section">
        <h4>¿Necesitas ayuda?</h4>
        <p>Puedes contactar al administrador para consultar el estado de tu pedido.</p>
        <a className="btn whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer">
          💬 Contactar por WhatsApp
        </a>
      </div>
    </main>
  )
}
