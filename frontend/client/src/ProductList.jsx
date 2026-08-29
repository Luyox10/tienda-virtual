import { useState, useMemo } from 'react'
import ProductModal from './ProductModal'
import { productImage } from './productImage'
import './Products.css'

export default function ProductList({ products, shifts, current, onAdd }) {
  const [selected, setSelected] = useState(null)
  const [justAdded, setJustAdded] = useState(null)

  const openShiftIds = useMemo(
    () => new Set((shifts || []).filter((s) => s.is_open).map((s) => s.id)),
    [shifts]
  )

  const isAvailable = (p) => p.is_active && openShiftIds.has(p.shift_id)

  const handleAdd = (product, quantity) => {
    onAdd(product, quantity)
    setJustAdded(product.name)
    setTimeout(() => setJustAdded(null), 1600)
  }

  const shiftTagClass = (name) => {
    const lower = (name || '').toLowerCase()
    if (lower.includes('mañana')) return 'product-tag product-tag-morning'
    if (lower.includes('tarde')) return 'product-tag product-tag-afternoon'
    return 'product-tag product-tag-night'
  }

  return (
    <section className="products-section">
      {products.length === 0 ? (
        <p className="empty">No hay productos disponibles.</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => {
            const inCurrent = isAvailable(p)
            const src = productImage(p)
            return (
              <article
                key={p.id}
                className={`product-card ${inCurrent ? '' : 'product-card-sold'}`}
                onClick={() => inCurrent && setSelected(p)}
                role="button"
                tabIndex={inCurrent ? 0 : -1}
              >
                <div className="product-img-wrap">
                  {src ? (
                    <img
                      src={src}
                      alt={p.name}
                      className="product-img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="product-img placeholder">Sin imagen</div>
                  )}
                  {!inCurrent && <span className="product-sold-overlay">Agotado</span>}
                </div>

                <div className="product-body">
                  <h3 className="product-name">{p.name}</h3>
                  <span className={shiftTagClass(p.shift_name)}>{p.shift_name}</span>
                  <p className="product-price">S/ {Number(p.price).toFixed(2)}</p>
                  {p.description && <p className="product-desc">{p.description}</p>}
                  <button
                    className="btn product-add-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (inCurrent) handleAdd(p, 1)
                    }}
                    disabled={!inCurrent}
                  >
                    {inCurrent ? (
                      <>
                        <span aria-hidden="true">🛒</span> Agregar al carrito
                      </>
                    ) : (
                      'No disponible'
                    )}
                  </button>
                </div>
              </article>
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
