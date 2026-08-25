import { useState } from 'react'
import { createOrder } from './services/api'
import { productImage } from './productImage'

export default function Cart({ cart, products, token, onUpdate, onClear, onBack, onOrder }) {
  const [error, setError] = useState(null)

  const findProduct = (id) => products.find((p) => p.id === Number(id))

  const subtotal = (item) => {
    const p = findProduct(item.product_id)
    const price = p?.price ?? item.price
    return Number((price * item.quantity).toFixed(2))
  }

  const total = cart.reduce((sum, item) => sum + subtotal(item), 0)

  const changeQty = (id, delta) => {
    const item = cart.find((i) => i.product_id === id)
    if (!item) return
    const q = Math.max(1, item.quantity + delta)
    onUpdate(id, q)
  }

  const removeItem = (id) => onUpdate(id, 0)

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
      <h2 className="page-title">
        <span>Mi carrito</span>
        <button className="btn secondary small" onClick={onBack}>
          Volver
        </button>
      </h2>

      {error && <p className="error">{error}</p>}

      {cart.length === 0 ? (
        <p className="empty">El carrito está vacío.</p>
      ) : (
        <>
          <ul className="cart-list">
            {cart.map((item) => {
              const p = findProduct(item.product_id)
              const img = p ? productImage(p) : ''
              return (
                <li key={item.product_id} className="cart-item">
                  {img ? (
                    <img src={img} alt={item.name} className="cart-thumb" />
                  ) : (
                    <div className="cart-thumb placeholder" />
                  )}
                  <div className="cart-info">
                    <p className="cart-name">{item.name}</p>
                    <p className="cart-price">S/ {item.price} c/u</p>
                  </div>
                  <div className="cart-qty">
                    <button
                      className="btn small secondary"
                      onClick={() => changeQty(item.product_id, -1)}
                    >
                      −
                    </button>
                    <span className="cart-qty-value">{item.quantity}</span>
                    <button
                      className="btn small secondary"
                      onClick={() => changeQty(item.product_id, 1)}
                    >
                      +
                    </button>
                  </div>
                  <p className="cart-subtotal">S/ {subtotal(item).toFixed(2)}</p>
                  <button
                    className="btn small secondary"
                    onClick={() => removeItem(item.product_id)}
                  >
                    Quitar
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="cart-footer">
            <div className="cart-total">
              <span>TOTAL</span>
              <span className="cart-total-amount">S/ {total.toFixed(2)}</span>
            </div>
            <button className="btn" onClick={checkout}>
              IR A PAGAR
            </button>
          </div>
        </>
      )}
    </div>
  )
}
