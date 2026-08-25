import { useState } from 'react'

function productImage(p) {
  if (p.image_url) {
    if (p.image_url.startsWith('http')) return p.image_url
    return `/imagenes/productos/${p.image_url}`
  }
  const name = p.name?.toLowerCase() || ''
  if (name.includes('causa')) return '/imagenes/productos/causa-pollo.jpg'
  if (name.includes('papa')) return '/imagenes/productos/papa-rellena.jpg'
  return ''
}

export default function ProductList({ products, current, onAdd }) {
  const [qty, setQty] = useState({})

  const currentShiftId = current?.current?.id
  const isOpen = !!currentShiftId && current?.current?.is_open

  return (
    <div>
      <div className={`shift-banner ${isOpen ? '' : 'closed'}`}>
        {isOpen ? (
          <>
            <span className="badge accepted">Abierto</span>
            <span>Turno actual: {current.current.name}</span>
          </>
        ) : (
          <>
            <span className="badge sold-out">Cerrado</span>
            <span>No hay turno abierto en este momento</span>
          </>
        )}
      </div>

      <h2 className="page-title">Productos del turno</h2>
      {products.length === 0 ? (
        <p className="empty">No hay productos disponibles.</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => {
            const inCurrent = p.is_active && p.shift_id === currentShiftId
            const src = productImage(p)
            return (
              <div
                className={`card product-card ${inCurrent ? '' : 'sold-out-card'}`}
                key={p.id}
              >
                {src ? (
                  <img src={src} alt={p.name} className="product-img" loading="lazy" />
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

                {inCurrent ? (
                  <div className="product-actions">
                    <input
                      type="number"
                      min="1"
                      value={qty[p.id] || 1}
                      onChange={(e) =>
                        setQty({ ...qty, [p.id]: Number(e.target.value) })
                      }
                      className="qty-input"
                    />
                    <button
                      className="btn"
                      onClick={() => onAdd(p, Number(qty[p.id] || 1))}
                    >
                      Agregar
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="sold-out-text">AGOTADO</p>
                    <button className="btn" disabled>
                      NO DISPONIBLE
                    </button>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
