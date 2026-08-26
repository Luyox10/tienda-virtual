import { useState, useEffect, useCallback, useMemo } from 'react'
import { getOrders, getOrder } from './services/ordersService'
import OrderTracker from './OrderTracker'
import Loading from './Loading'
import Empty from './Empty'

const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'PENDING_PAYMENT', label: 'Pendientes' },
  { key: 'PAYMENT_REVIEW', label: 'En preparación' },
  { key: 'ACCEPTED', label: 'Aceptados' },
  { key: 'COMPLETED', label: 'Entregados' },
  { key: 'CANCELLED', label: 'Cancelados' },
  { key: 'REJECTED', label: 'Rechazados' },
]

export default function Orders({ token, onBack, onPay }) {
  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadOrders = useCallback(() => {
    setLoading(true)
    setError(null)
    getOrders(token)
      .then((data) => {
        setOrders(data)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })
  }, [token])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const viewDetail = (id) => {
    setLoading(true)
    getOrder(id, token)
      .then((data) => {
        setSelected(data)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })
  }

  const goBack = () => setSelected(null)

  const filtered = useMemo(() => {
    if (filter === 'all') return orders
    return orders.filter((o) => o.status === filter)
  }, [orders, filter])

  const emptyMessage =
    filter === 'all'
      ? 'No tienes pedidos todavía.'
      : `No tienes pedidos ${FILTERS.find((f) => f.key === filter)?.label.toLowerCase()}.`

  return (
    <main className="page orders-page">
      <h2 className="page-title">
        <span>Mis pedidos</span>
        <button className="btn secondary small" onClick={onBack}>
          Volver
        </button>
      </h2>

      {error && <p className="error">{error}</p>}

      {selected ? (
        <>
          <OrderTracker key={selected.id} order={selected} token={token} onBack={goBack} />
        </>
      ) : (
        <>
          <div className="order-filters" role="tablist" aria-label="Filtrar pedidos">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`category-pill ${filter === f.key ? 'active' : ''}`}
                onClick={() => setFilter(f.key)}
                role="tab"
                aria-selected={filter === f.key}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <Loading message="Cargando pedidos..." />
          ) : filtered.length === 0 ? (
            <Empty message={emptyMessage} />
          ) : (
            <ul className="order-list">
              {filtered.map((o) => (
                <li key={o.id} className="order-item card">
                  <div className="order-meta-row">
                    <span className="order-id">#ORD-{String(o.id).padStart(4, '0')}</span>
                    <span className={`order-status-badge ${o.status.toLowerCase()}`}>
                      {o.status === 'ACCEPTED' || o.status === 'COMPLETED'
                        ? '✓ '
                        : o.status === 'REJECTED' || o.status === 'CANCELLED'
                        ? '✗ '
                        : '🟡 '}
                      {o.status}
                    </span>
                  </div>
                  <div className="order-detail-row">
                    <div>
                      <p className="order-date">{new Date(o.created_at).toLocaleString('es-PE')}</p>
                      <p className="order-shift">Turno: {o.shift_name || '-'}</p>
                    </div>
                    <p className="order-total">S/ {Number(o.total).toFixed(2)}</p>
                  </div>
                  <div className="order-actions">
                    {o.status === 'PENDING_PAYMENT' && (
                      <button className="btn small" onClick={() => onPay(o)}>
                        Pagar
                      </button>
                    )}
                    <button className="btn small secondary" onClick={() => viewDetail(o.id)}>
                      Ver detalle
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  )
}
