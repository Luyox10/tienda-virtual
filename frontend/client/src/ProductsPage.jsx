import { useState, useMemo } from 'react'
import ProductList from './ProductList'
import './Products.css'

export default function ProductsPage({ products, shifts, current, onAdd }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')

  const categories = useMemo(() => {
    const fromShifts = (shifts || []).map((s) => s.name)
    return ['Todos', ...fromShifts]
  }, [shifts])

  const openShiftIds = new Set((shifts || []).filter((s) => s.is_open).map((s) => s.id))
  const isAvailable = (p) => p.is_active && openShiftIds.has(p.shift_id)

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(search.toLowerCase())
      if (!matchesSearch) return false
      if (category === 'Todos') return isAvailable(p)
      return p.shift_name === category
    })
  }, [products, search, category, shifts])

  const currentData = current?.current

  return (
    <main className="page products-page">
      <section className="page-hero" aria-label="Productos">
        <div className="page-hero-content">
          <span className="page-hero-eyebrow">PRODUCTOS</span>
          <h1 className="page-hero-title">Nuestros productos</h1>
          <p className="page-hero-subtitle">Elige tus favoritos según el turno disponible</p>

          {currentData && (
            <div className="products-current-shift" role="status" aria-live="polite">
              <span className="products-current-name">{currentData.name}</span>
              <span className="products-current-time">
                {currentData.start_time?.slice(0, 5)} - {currentData.end_time?.slice(0, 5)}
              </span>
              <span className={`products-current-status ${currentData.is_open ? 'open' : 'closed'}`}>
                {currentData.is_open ? 'Abierto' : 'Cerrado'}
              </span>
            </div>
          )}
        </div>

        <div className="page-hero-visual" aria-hidden="true">
          <img src="/imagenes/productos/logo_deliturnos.png" alt="DeliTurnos" className="page-hero-img" />
        </div>
      </section>

      <section className="products-filters">
        <input
          type="search"
          className="products-search"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar producto"
        />

        <div className="products-pills" role="tablist" aria-label="Turnos">
          {categories.map((c) => (
            <button
              key={c}
              className={`products-pill ${category === c ? 'active' : ''}`}
              onClick={() => setCategory(c)}
              role="tab"
              aria-selected={category === c}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <ProductList products={filtered} shifts={shifts} current={current} onAdd={onAdd} />
    </main>
  )
}
