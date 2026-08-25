import { useState } from 'react'

export default function ProductList({ products, current, onAdd }) {
  const [qty, setQty] = useState({})

  const currentShiftId = current?.current?.id

  return (
    <div>
      <h2>Productos</h2>
      {currentShiftId ? (
        <p>Turno actual: {current.current.name}</p>
      ) : (
        <p className="error">No hay turno abierto ahora</p>
      )}
      <div className="grid">
        {products.map((p) => {
          const inCurrent = p.is_active && p.shift_id === currentShiftId
          return (
            <div className={`card ${inCurrent ? '' : 'sold-out'}`} key={p.id}>
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} className="product-img" />
              ) : (
                <div className="product-img placeholder">Sin imagen</div>
              )}
              <h3>{p.name}</h3>
              <p>Precio: S/ {p.price}</p>
              <p>Turno: {p.shift_name}</p>
              <p>{p.is_active ? 'Disponible' : 'Agotado / Inactivo'}</p>
              {inCurrent ? (
                <>
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
                    Agregar al carrito
                  </button>
                </>
              ) : (
                <p className="error">No disponible para este turno</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
