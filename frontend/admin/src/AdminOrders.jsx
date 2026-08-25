import { useState, useEffect } from 'react'
import { getOrders, getOrder } from './api'

export default function AdminOrders({ token }) {
  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState(null)

  const load = () => {
    getOrders(token)
      .then(setOrders)
      .catch((e) => setError(e.message))
  }

  useEffect(() => {
    load()
  }, [token])

  const view = (id) => {
    getOrder(id, token)
      .then(setSelected)
      .catch((e) => setError(e.message))
  }

  return (
    <div>
      <h2>Pedidos</h2>
      {error && <p className="error">{error}</p>}
      {selected ? (
        <div className="card">
          <h3>Pedido #{selected.id}</h3>
          <p>Usuario: {selected.user_id}</p>
          <p>Turno: {selected.shift_id}</p>
          <p>Total: S/ {selected.total}</p>
          <p>Estado: {selected.status}</p>
          <p>Pago: {selected.payment_status}</p>
          <p>Fecha: {new Date(selected.created_at).toLocaleString()}</p>
          <h4>Productos</h4>
          <ul>
            {selected.items?.map((i) => (
              <li key={i.id}>
                {i.product_name} x {i.quantity} - S/ {i.subtotal}
              </li>
            ))}
          </ul>
          <button className="btn" onClick={() => setSelected(null)}>
            Volver
          </button>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Pago</th>
              <th>Fecha</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.user_id}</td>
                <td>S/ {o.total}</td>
                <td>{o.status}</td>
                <td>{o.payment_status}</td>
                <td>{new Date(o.created_at).toLocaleString()}</td>
                <td>
                  <button className="btn small" onClick={() => view(o.id)}>
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
