import { useState, useMemo } from 'react'
import ProductList from './ProductList'

export default function ProductsPage({ products, shifts, current, onAdd }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')

  const categories = useMemo(() => {
    const fromProducts = products
      .map((p) => p.category)
      .filter(Boolean)
    const unique = Array.from(new Set(fromProducts))
    return unique.length ? ['Todos', ...unique] : ['Todos']
  }, [products])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'Todos' || p.category === category
      return matchesSearch && matchesCategory
    })
  }, [products, search, category])

  const currentData = current?.current

  return (
    <main className="page products-page">
      <header className="page-hero small">
        <h1 className="page-title center">Productos</h1>
        <p className="page-subtitle">Elige tus productos favoritos según el turno actual.</p>

        {currentData && (
          <div className="current-shift-banner" role="status" aria-live="polite">
            <span className="shift-name">{currentData.name}</span>
            <span className="shift-time">{currentData.start_time} - {currentData.end_time}</span>
            <span className={`shift-status ${currentData.is_open ? 'open' : 'closed'}`}>
              {currentData.is_open ? 'Abierto' : 'Cerrado'}
            </span>
          </div>
        )}
      </header>

      <section className="filters">
        <input
          type="search"
          className="search-input"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar producto"
        />

        {categories.length > 1 && (
          <div className="category-pills" role="tablist" aria-label="Categorías">
            {categories.map((c) => (
              <button
                key={c}
                className={`category-pill ${category === c ? 'active' : ''}`}
                onClick={() => setCategory(c)}
                role="tab"
                aria-selected={category === c}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </section>

      <ProductList products={filtered} shifts={shifts} current={current} onAdd={onAdd} />
    </main>
  )
}
