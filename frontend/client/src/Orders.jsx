import { useState, useEffect } from 'react'
import { getOrders, getOrder } from './api'

export default function Orders({ token, onBack }) {
  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getOrders(token)
      .then(setOrders)
      .catch((e) => setError(e.message))
  }, [token])

  const viewDetail = (id) => {
    getOrder(id, token)
      .then(setSelected)
      .catch((e) => setError(e.message))
  }

  return (
    <div>
      <h2>Mis pedidos</h2>
      <button className="btn secondary" onClick={onBack}>
        Volver al catálogo
      </button>
      {error && <p className="error">{error}</p>}

      {selected ? (
        <div className="card detail">
          <h3>Pedido #{selected.id}</h3>
          <p>Total: S/ {selected.total}</p>
          <p>Estado: {selected.status}</p>
          <p>Pago: {selected.payment_status}</p>
          <h4>Productos</h4>
          <ul>
            {selected.items?.map((i) => (
              <li key={i.id}>
                {i.product_name} x {i.quantity} - S/ {i.subtotal}
              </li>
            ))}
          </ul>
          <button className="btn" onClick={() => setSelected(null)}>
            Volver al historial
          </button>
        </div>
      ) : (
        <ul>
          {orders.map((o) => (
            <li key={o.id} className="order-item">
              <span>Pedido #{o.id} - S/ {o.total} - {o.status}</span>
              <button className="btn small" onClick={() => viewDetail(o.id)}>
                Ver
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
