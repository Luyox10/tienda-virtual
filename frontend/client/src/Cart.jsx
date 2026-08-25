import { useState } from 'react'
import { createOrder } from './services/api'

export default function Cart({ cart, products, token, onUpdate, onClear, onBack, onOrder }) {
  const [error, setError] = useState(null)

  const findProduct = (id) => products.find((p) => p.id === Number(id)) || {}

  const subtotal = (item) => {
    const p = findProduct(item.product_id)
    return Number((p.price * item.quantity).toFixed(2))
  }

  const total = cart.reduce((sum, item) => sum + subtotal(item), 0)

  const updateQty = (id, quantity) => {
    const q = Number(quantity)
    if (q <= 0) onUpdate(id, 0)
    else onUpdate(id, q)
  }

  const checkout = async () => {
    if (cart.length === 0) return
    const items = cart.map((i) => ({
      product_id: i.product_id,
      quantity: i.quantity,
    }))
    try {
      const order = await createOrder(items, token)
      onClear()
      onOrder(order)
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h2>Carrito</h2>
      <button className="btn secondary" onClick={onBack}>
        Volver al catálogo
      </button>
      {error && <p className="error">{error}</p>}
      {cart.length === 0 ? (
        <p>El carrito está vacío.</p>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => {
                const p = findProduct(item.product_id)
                return (
                  <tr key={item.product_id}>
                    <td>{p.name}</td>
                    <td>S/ {p.price}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQty(item.product_id, e.target.value)}
                        className="qty-input"
                      />
                    </td>
                    <td>S/ {subtotal(item).toFixed(2)}</td>
                    <td>
                      <button
                        className="btn small secondary"
                        onClick={() => onUpdate(item.product_id, 0)}
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <h3>Total: S/ {total.toFixed(2)}</h3>
          <button className="btn" onClick={checkout}>
            Crear pedido
          </button>
        </>
      )}
    </div>
  )
}
