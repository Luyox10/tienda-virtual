import { useState } from 'react'
import { createOrder } from './services/api'
import { productImage } from './productImage'

export default function Cart({ cart, products, isAuthenticated, token, shifts, onUpdate, onClear, onBack, onLogin, onOrder }) {
  const [error, setError] = useState(null)

  const findProduct = (id) => products.find((p) => p.id === Number(id))

  const itemSubtotal = (item) => {
    const p = findProduct(item.product_id)
    const price = p?.price ?? item.price
    return Number((price * item.quantity).toFixed(2))
  }

  const changeQty = (id, delta) => {
    const item = cart.find((i) => i.product_id === id)
    if (!item) return
    const q = Math.max(1, item.quantity + delta)
    onUpdate(id, q)
  }

  const removeItem = (id) => onUpdate(id, 0)

  const shiftEnabled = (productId) => {
    const p = findProduct(productId)
    const s = (shifts || []).find((shift) => shift.id === p?.shift_id)
    return !!s?.is_enabled
  }

  const cartTotal = cart.reduce((sum, item) => sum + itemSubtotal(item), 0)

  const checkoutAll = async () => {
    if (cart.some((item) => !shiftEnabled(item.product_id))) {
      setError('Alguno de los productos pertenece a un turno no habilitado')
      return
    }
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

  const checkoutOne = async (productId) => {
    if (!shiftEnabled(productId)) {
      setError('El turno de este producto no está habilitado')
      return
    }
    if (!isAuthenticated) {
      onLogin()
      return
    }
    const item = cart.find((i) => i.product_id === productId)
    if (!item) return
    try {
      const order = await createOrder(
        [{ product_id: item.product_id, quantity: item.quantity }],
        token
      )
      onUpdate(productId, 0)
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
                  <div className="cart-item-actions">
                    <button
                      className="btn small success"
                      onClick={() => checkoutOne(item.product_id)}
                      disabled={!shiftEnabled(item.product_id)}
                    >
                      Pagar
                    </button>
                    <button
                      className="btn small danger"
                      onClick={() => removeItem(item.product_id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>

          {cart.length > 1 && (
            <div className="cart-footer">
              <div className="cart-total">
                <span>Total</span>
                <span className="cart-total-amount">S/ {cartTotal.toFixed(2)}</span>
              </div>
              <button className="btn success" onClick={checkoutAll}>
                Pagar todo
              </button>
            </div>
          )}
        </>
      )}
    </main>
  )
}
