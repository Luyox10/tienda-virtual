import { useState } from 'react'
import { createOrder } from './services/api'
import { productImage } from './productImage'

const DELIVERY = 3.00

export default function Cart({ cart, products, isAuthenticated, token, onUpdate, onClear, onBack, onLogin, onOrder }) {
  const [error, setError] = useState(null)

  const findProduct = (id) => products.find((p) => p.id === Number(id))

  const itemSubtotal = (item) => {
    const p = findProduct(item.product_id)
    const price = p?.price ?? item.price
    return Number((price * item.quantity).toFixed(2))
  }

  const itemsTotal = cart.reduce((sum, item) => sum + itemSubtotal(item), 0)
  const delivery = cart.length > 0 ? DELIVERY : 0
  const total = Number((itemsTotal + delivery).toFixed(2))

  const changeQty = (id, delta) => {
    const item = cart.find((i) => i.product_id === id)
    if (!item) return
    const q = Math.max(1, item.quantity + delta)
    onUpdate(id, q)
  }

  const removeItem = (id) => onUpdate(id, 0)

  const checkout = async () => {
    if (!isAuthenticated) {
      onLogin()
      return
    }
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
    <main className="page cart-page">
      <h2 className="page-title">
        <span>Mi carrito</span>
        <button className="btn secondary small" onClick={onBack}>
          Volver
        </button>
      </h2>

      {error && <p className="error">{error}</p>}

      {cart.length === 0 ? (
        <p className="empty">El carrito está vacío. Agrega productos para comenzar.</p>
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
                      aria-label="Disminuir cantidad"
                    >
                      −
                    </button>
                    <span className="cart-qty-value">{item.quantity}</span>
                    <button
                      className="btn small secondary"
                      onClick={() => changeQty(item.product_id, 1)}
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>
                  <p className="cart-subtotal">S/ {itemSubtotal(item).toFixed(2)}</p>
                  <button
                    className="btn small danger"
                    onClick={() => removeItem(item.product_id)}
                  >
                    Eliminar
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="cart-summary card">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>S/ {itemsTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span>S/ {delivery.toFixed(2)}</span>
            </div>
            <div className="summary-row total-row">
              <span>TOTAL</span>
              <span>S/ {total.toFixed(2)}</span>
            </div>
            <div className="cart-actions">
              <button className="btn secondary" onClick={onBack}>
                Seguir comprando
              </button>
              <button className="btn" onClick={checkout}>
                {isAuthenticated ? 'Continuar' : 'Iniciar sesión para continuar'}
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
