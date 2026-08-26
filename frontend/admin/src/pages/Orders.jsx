import { useEffect, useState } from 'react'
import { getOrders, getOrder, getPayments, approvePayment, rejectPayment } from '../api'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import DataTable from '../components/DataTable'

const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'PENDING_PAYMENT', label: 'Pendientes' },
  { key: 'PENDING_REVIEW', label: 'Pago en revisión' },
  { key: 'ACCEPTED', label: 'Aceptados' },
  { key: 'REJECTED', label: 'Rechazados' },
  { key: 'CANCELLED', label: 'Cancelados' },
]

export default function Orders({ token }) {
  const [orders, setOrders] = useState([])
  const [payments, setPayments] = useState([])
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const load = () => {
    setLoading(true)
    setError(null)
    Promise.all([getOrders(token), getPayments(token)])
      .then(([o, p]) => {
        setOrders(o)
        setPayments(p)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [token])

  const view = (order) => {
    getOrder(order.id, token)
      .then((data) => {
        const payment = payments.find((pay) => pay.order_id === data.id)
        setSelected({ ...data, payment })
      })
      .catch((e) => setError(e.message))
  }

  const filtered = orders.filter((o) => {
    if (filter === 'all') return true
    if (filter === 'PENDING_REVIEW') return o.payment_status === 'PENDING' && o.status !== 'ACCEPTED'
    return o.status === filter
  })

  const handleApprove = async (paymentId) => {
    try {
      await approvePayment(paymentId, token)
      setMessage('Pago aprobado')
      load()
      setSelected(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleReject = async (paymentId) => {
    try {
      await rejectPayment(paymentId, token, rejectReason)
      setMessage('Pago rechazado')
      load()
      setSelected(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const formatDate = (d) => new Date(d).toLocaleString('es-PE')

  if (loading) return <p className="loading-message">Cargando pedidos...</p>

  return (
    <div className="dashboard">
      <PageHeader title="Pedidos" subtitle="Gestiona y supervisa los pedidos realizados." />
      {error && <p className="error">{error}</p>}
      {message && <p className="message">{message}</p>}

      <section className="dashboard-section">
        <div className="orders-header">
          <h2 className="section-title">Pedidos</h2>
          <div className="filter-pills">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`filter-pill ${filter === f.key ? 'active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {selected ? (
          <div className="card order-detail">
            <div className="order-detail-header">
              <h3>Pedido #{selected.id}</h3>
              <button className="btn secondary small" onClick={() => setSelected(null)}>
                Volver
              </button>
            </div>

            <div className="order-detail-grid">
              <div>
                <p className="detail-label">Cliente</p>
                <p className="detail-value">{selected.user_email || selected.user_id}</p>

                <p className="detail-label">Turno</p>
                <p className="detail-value">{selected.shift_name || selected.shift_id}</p>

                <p className="detail-label">Fecha</p>
                <p className="detail-value">{formatDate(selected.created_at)}</p>
              </div>
              <div>
                <p className="detail-label">Total</p>
                <p className="detail-value">S/ {selected.total}</p>

                <p className="detail-label">Estado del pedido</p>
                <p><StatusBadge status={selected.status} /></p>

                <p className="detail-label">Estado del pago</p>
                <p><StatusBadge status={selected.payment_status} /></p>
              </div>
            </div>

            <h4 className="detail-subtitle">Productos</h4>
            <DataTable headers={['Producto', 'Cantidad', 'Precio', 'Subtotal']}>
              {(selected.items || []).map((i) => (
                <tr key={i.id || i.product_id}>
                  <td>{i.product_name}</td>
                  <td>{i.quantity}</td>
                  <td>S/ {i.unit_price}</td>
                  <td>S/ {i.subtotal}</td>
                </tr>
              ))}
            </DataTable>

            {selected.payment && (
              <div className="payment-box">
                <h4 className="detail-subtitle">Pago Yape</h4>
                <p className="detail-label">Método</p>
                <p className="detail-value">{selected.payment.method}</p>
                <p className="detail-label">Monto</p>
                <p className="detail-value">S/ {selected.payment.amount}</p>
                <p className="detail-label">Estado</p>
                <p><StatusBadge status={selected.payment.status} /></p>

                {selected.payment.voucher_url && (
                  <div className="payment-proof">
                    <p className="detail-label">Comprobante</p>
                    <img src={selected.payment.voucher_url} alt="Comprobante" />
                  </div>
                )}

                {selected.payment.status === 'PENDING' && (
                  <div className="payment-actions">
                    <button className="btn" onClick={() => handleApprove(selected.payment.id)}>
                      Aprobar pago
                    </button>
                    <div className="reject-group">
                      <input
                        type="text"
                        placeholder="Motivo del rechazo"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                      <button className="btn secondary" onClick={() => handleReject(selected.payment.id)}>
                        Rechazar pago
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <DataTable headers={['ID', 'Cliente', 'Turno', 'Total', 'Pago', 'Estado', 'Fecha', '']}>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-cell">No hay pedidos en este filtro.</td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id}>
                  <td>#ORD-{o.id}</td>
                  <td>{o.user_email || o.user_id}</td>
                  <td>{o.shift_name || o.shift_id}</td>
                  <td>S/ {o.total}</td>
                  <td><StatusBadge status={o.payment_status} /></td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>{formatDate(o.created_at)}</td>
                  <td>
                    <button className="btn small" onClick={() => view(o)}>
                      Ver
                    </button>
                  </td>
                </tr>
              ))
            )}
          </DataTable>
        )}
      </section>
    </div>
  )
}
