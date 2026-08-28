import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { getOrders, getOrder, getPayments, approvePayment, rejectPayment } from '../api'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import DataTable from '../components/DataTable'
import { productImage } from '../utils/productImage'

const FILTERS = [
  { key: 'PENDING', label: 'Pendientes' },
  { key: 'ACCEPTED', label: 'Aceptados' },
]

export default function Orders({ token }) {
  const [orders, setOrders] = useState([])
  const [payments, setPayments] = useState([])
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('PENDING')
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
    if (filter === 'ACCEPTED') return o.status === 'ACCEPTED'
    return o.status !== 'ACCEPTED'
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

        {selected &&
          createPortal(
            <div className="order-modal-overlay" onClick={() => setSelected(null)}>
              <div className="order-modal" onClick={(e) => e.stopPropagation()}>
                <div className="order-modal-header">
                  <h3>Pedido #{selected.id}</h3>
                  <button className="btn secondary small" onClick={() => setSelected(null)}>
                    Cerrar
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
                <div className="order-modal-products">
                  {(selected.items || []).map((i) => (
                    <div key={i.id || i.product_id} className="order-modal-product">
                      <img src={productImage(i)} alt={i.product_name} />
                      <div className="order-modal-product-info">
                        <strong>{i.product_name}</strong>
                        <p>Cantidad: {i.quantity}</p>
                        <p>Precio: S/ {i.unit_price}</p>
                        <p>Subtotal: S/ {i.subtotal}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="payment-box">
                  <h4 className="detail-subtitle">Pago Yape</h4>
                  <div className="order-detail-grid">
                    <div>
                      <p className="detail-label">Método</p>
                      <p className="detail-value">{selected.payment?.method || 'YAPE'}</p>
                    </div>
                    <div>
                      <p className="detail-label">Monto</p>
                      <p className="detail-value">S/ {selected.total}</p>
                    </div>
                    <div>
                      <p className="detail-label">Estado del pedido</p>
                      <p><StatusBadge status={selected.status} /></p>
                    </div>
                    <div>
                      <p className="detail-label">Estado del pago</p>
                      <p><StatusBadge status={selected.payment?.status || 'PENDING'} /></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}
      </section>
    </div>
  )
}
