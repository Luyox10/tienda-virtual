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

  const cartShiftIds = new Set(
    cart.map((item) => findProduct(item.product_id)?.shift_id).filter(Boolean)
  )
  const cartShiftId = cartShiftIds.size === 1 ? [...cartShiftIds][0] : null
  const cartShift = (shifts || []).find((s) => s.id === cartShiftId)
  const hasMixedShifts = cartShiftIds.size > 1
  const isShiftOpen = cart.length > 0 && !!cartShift?.is_open

  const checkout = async () => {
    if (hasMixedShifts) {
      setError('Los productos deben pertenecer al mismo turno')
      return
    }
    if (!isShiftOpen) {
      setError('El turno seleccionado no está habilitado')
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

  return (
    <main className="page cart-page">
      <h2 className="page-title">
        <span>Mi carrito</span>
        <button className="btn secondary small" onClick={onBack}>
          Volver
        </button>
      </h2>

      {error && <p className="error">{error}</p>}

      {cart.length > 0 && hasMixedShifts && (
        <p className="error">Los productos deben pertenecer al mismo turno para poder pagar.</p>
      )}

      {cart.length > 0 && !hasMixedShifts && !isShiftOpen && (
        <p className="error">El turno seleccionado no está habilitado. No se pueden realizar pagos en este momento.</p>
      )}

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
                      onClick={checkout}
                      disabled={!isShiftOpen || hasMixedShifts}
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
        </>
      )}
    </main>
  )
}
