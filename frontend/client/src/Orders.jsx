import { useState, useEffect, useCallback } from 'react'
import { getOrders, getOrder } from './services/api'
import OrderTracker from './OrderTracker'

export default function Orders({ token, onBack, onPay }) {
  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState(null)

  const loadOrders = useCallback(() => {
    getOrders(token)
      .then(setOrders)
      .catch((e) => setError(e.message))
  }, [token])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const viewDetail = (id) => {
    getOrder(id, token)
      .then(setSelected)
      .catch((e) => setError(e.message))
  }

  const goBack = () => setSelected(null)

  return (
    <div>
      <h2 className="page-title">
        <span>Mis pedidos</span>
        <button className="btn secondary small" onClick={onBack}>
          Volver
        </button>
      </h2>

      {error && <p className="error">{error}</p>}

      {selected ? (
        <div>
          <OrderTracker key={selected.id} order={selected} token={token} />
          <button className="btn secondary" onClick={goBack}>
            Volver al historial
          </button>
        </div>
      ) : (
        <ul className="order-list">
          {orders.map((o) => (
            <li key={o.id} className="order-item">
              <div className="order-info">
                <span className="order-id">Pedido #{o.id}</span>
                <span className="order-total">S/ {o.total}</span>
                <span className={`badge ${o.status === 'ACCEPTED' || o.status === 'COMPLETED' ? 'accepted' : o.status === 'REJECTED' || o.status === 'CANCELLED' ? 'rejected' : 'pending'}`}>
                  {o.status}
                </span>
              </div>
              <div>
                {o.status === 'PENDING_PAYMENT' && (
                  <button className="btn small" onClick={() => onPay(o)}>
                    Pagar
                  </button>
                )}
                <button className="btn small" onClick={() => viewDetail(o.id)}>
                  Seguimiento
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
