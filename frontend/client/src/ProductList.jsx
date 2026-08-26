import { useState } from 'react'
import ProductModal from './ProductModal'
import { productImage } from './productImage'

export default function ProductList({ products, current, onAdd }) {
  const [selected, setSelected] = useState(null)
  const [justAdded, setJustAdded] = useState(null)

  const currentShiftId = current?.current?.id
  const isOpen = current?.current?.is_open
  const isAvailable = (p) => p.is_active && p.shift_id === currentShiftId && isOpen

  const handleAdd = (product, quantity) => {
    onAdd(product, quantity)
    setJustAdded(product.name)
    setTimeout(() => setJustAdded(null), 1600)
  }

  return (
    <section className="products-section">
      <h2 className="page-title">Productos del turno</h2>
      {products.length === 0 ? (
        <p className="empty">No hay productos disponibles.</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => {
            const inCurrent = isAvailable(p)
            const src = productImage(p)
            return (
              <div
                key={p.id}
                className={`card product-card ${inCurrent ? '' : 'sold-out-card'}`}
                onClick={() => inCurrent && setSelected(p)}
                role="button"
                tabIndex={inCurrent ? 0 : -1}
              >
                {src ? (
                  <img
                    src={src}
                    alt={p.name}
                    className="product-img"
                    loading="lazy"
                  />
                ) : (
                  <div className="placeholder">Sin imagen</div>
                )}

                <div className="meta">
                  <span className="badge shift">{p.shift_name}</span>
                  {inCurrent ? (
                    <span className="badge accepted">Disponible</span>
                  ) : (
                    <span className="badge sold-out">Agotado</span>
                  )}
                </div>

                <h3>{p.name}</h3>
                {p.description && <p className="description">{p.description}</p>}
                <p className="price">S/ {p.price}</p>

                <button
                  className="btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (inCurrent) handleAdd(p, 1)
                  }}
                  disabled={!inCurrent}
                >
                  {inCurrent ? '🛒 Agregar' : 'No disponible'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {selected && (
        <ProductModal
          product={selected}
          inCurrent={isAvailable(selected)}
          onClose={() => setSelected(null)}
          onAdd={handleAdd}
        />
      )}

      {justAdded && (
        <div className="toast" role="status" aria-live="polite">
          <span className="toast-icon" aria-hidden="true">✓</span>
          <span>Se agregó <strong>{justAdded}</strong> al carrito</span>
        </div>
      )}
    </section>
  )
}
