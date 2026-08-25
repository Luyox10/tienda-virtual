import { useState } from 'react'
import { productImage } from './productImage'

export default function ProductModal({ product, inCurrent, onClose, onAdd }) {
  const [qty, setQty] = useState(1)

  if (!product) return null

  const src = productImage(product)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        {src ? (
          <img src={src} alt={product.name} className="modal-img" loading="lazy" />
        ) : (
          <div className="modal-placeholder">Sin imagen</div>
        )}

        <div className="modal-body">
          <div className="meta">
            <span className="badge shift">{product.shift_name}</span>
            {inCurrent ? (
              <span className="badge accepted">Disponible</span>
            ) : (
              <span className="badge sold-out">Agotado</span>
            )}
          </div>

          <h2>{product.name}</h2>
          {product.description && <p className="description">{product.description}</p>}
          <p className="price">S/ {product.price}</p>

          {inCurrent ? (
            <div className="quantity-row">
              <button
                className="btn small secondary"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="quantity-value">{qty}</span>
              <button
                className="btn small secondary"
                onClick={() => setQty((q) => q + 1)}
              >
                +
              </button>
            </div>
          ) : (
            <p className="sold-out-text">AGOTADO</p>
          )}

          <div className="modal-actions">
            <button
              className="btn"
              onClick={() => {
                onAdd(product, qty)
                onClose()
              }}
              disabled={!inCurrent}
            >
              Agregar al carrito
            </button>
            <button className="btn secondary" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
