import { useState, useEffect, useCallback, useMemo } from 'react'
import { getOrders, getOrder } from './services/ordersService'
import { productImage } from './productImage'
import OrderTracker from './OrderTracker'
import Loading from './Loading'
import Empty from './Empty'

const FILTERS = [
  { key: 'PENDING_PAYMENT', label: 'Enviado' },
  { key: 'PAYMENT_REVIEW', label: 'Pendiente' },
  { key: 'ACCEPTED', label: 'Aceptado' },
]

export default function Orders({ token, onBack, onPay }) {
  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('PENDING_PAYMENT')
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
    const interval = setInterval(loadOrders, 10000)
    return () => clearInterval(interval)
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
    return orders.filter((o) => o.status === filter)
  }, [orders, filter])

  const emptyMessage = `No tienes pedidos ${FILTERS.find((f) => f.key === filter)?.label.toLowerCase()}.`

  return (
    <main className="page orders-page">
      {error && <p className="error">{error}</p>}

      {selected ? (
        <>
          <OrderTracker key={selected.id} order={selected} token={token} onBack={goBack} />
        </>
      ) : (
        <>
          <section className="page-hero" aria-label="Mis pedidos">
            <div className="page-hero-content">
              <span className="page-hero-eyebrow">PEDIDOS</span>
              <h1 className="page-hero-title">Mis pedidos</h1>
              <p className="page-hero-subtitle">Revisa el estado y el detalle de tus pedidos</p>
              <button className="page-hero-cta" onClick={onBack}>
                Volver
              </button>
            </div>

            <div className="page-hero-visual" aria-hidden="true">
              <img src="/imagenes/hero-home.svg" alt="Sabor Delicioso" className="page-hero-img" />
            </div>
          </section>

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
                    {productImage({ image_url: o.first_product_image, name: o.first_product_name }) ? (
                      <img
                        src={productImage({ image_url: o.first_product_image, name: o.first_product_name })}
                        alt={o.first_product_name || 'Producto'}
                        className="order-thumb"
                      />
                    ) : (
                      <div className="order-thumb placeholder">Sin imagen</div>
                    )}
                    <div>
                      <p className="order-product-name">{o.first_product_name || 'Pedido #' + o.id}</p>
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
                    <button
                      className={`btn small ${o.status === 'ACCEPTED' ? 'accepted-detail' : 'secondary'}`}
                      onClick={() => viewDetail(o.id)}
                    >
                      {o.status === 'ACCEPTED' ? '✓ Ver detalle' : 'Ver detalle'}
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
