import { productImage } from './productImage'

function ProductCard({ p, inCurrent, onSelect }) {
  const src = productImage(p)
  return (
    <div
      className={`card home-product-card ${inCurrent ? '' : 'sold-out-card'}`}
      onClick={() => inCurrent && onSelect(p)}
      role="button"
      tabIndex={inCurrent ? 0 : -1}
    >
      <div className="home-product-img-wrap">
        {src ? (
          <img src={src} alt={p.name} className="home-product-img" />
        ) : (
          <div className="home-product-img placeholder">Sin imagen</div>
        )}
        {!inCurrent && <span className="home-product-sold">Agotado</span>}
      </div>
      <div className="home-product-info">
        <strong>{p.name}</strong>
        <p className="home-product-price">S/ {Number(p.price).toFixed(2)}</p>
      </div>
    </div>
  )
}

const benefits = [
  { icon: '🚚', title: 'Entrega rápida', desc: 'Recibe tu pedido sin demoras' },
  { icon: '✓', title: 'Ingredientes frescos', desc: 'Calidad garantizada' },
  { icon: '💳', title: 'Pago seguro', desc: 'Tus pagos protegidos' },
  { icon: '❤', title: 'Atención amable', desc: 'Estamos para ayudarte' },
]

export default function Home({ products, shifts, current, onAdd, setView }) {
  const currentData = current?.current
  const open = currentData?.is_open

  const openShiftIds = new Set((shifts || []).filter((s) => s.is_open).map((s) => s.id))
  const isAvailable = (p) => p.is_active && openShiftIds.has(p.shift_id)
  const sample = products.slice(0, 4)

  return (
    <main className="page home-page">
      <section className="hero" aria-label="Bienvenida">
        <div className="hero-content">
          <div className="hero-current" role="status" aria-live="polite">
            <span className="hero-label">Turno actual</span>
            <div className="hero-shift">
              <span className={`shift-dot ${open ? 'open' : 'closed'}`} aria-hidden="true" />
              <span className="hero-shift-name">{currentData?.name || '—'}</span>
              {currentData && (
                <span className="hero-shift-time">{currentData.start_time} - {currentData.end_time}</span>
              )}
            </div>
            <span className={`hero-status ${open ? 'open' : 'closed'}`}>
              {open ? 'Abierto' : 'Cerrado'}
            </span>
          </div>

          <h1 className="hero-title">¡Disfruta lo mejor del día!</h1>
          <p className="hero-subtitle">
            Platos deliciosos preparados para ti. Pide ahora y recibe frescura en cada bocado.
          </p>
          <div className="hero-actions">
            <button className="btn" onClick={() => setView('products')}>
              Ver productos
            </button>
            <button className="btn secondary" onClick={() => setView('orders')}>
              Mis pedidos
            </button>
          </div>
        </div>

        <div className="hero-image" aria-hidden="true">
          <img src="/imagenes/hero-home.svg" alt="Sabor Delicioso" className="hero-img" />
        </div>
      </section>

      {sample.length > 0 && (
        <section className="home-products" aria-labelledby="home-products-title">
          <h2 id="home-products-title" className="section-title center">Productos destacados</h2>
          <div className="home-products-grid">
            {sample.map((p) => (
              <ProductCard key={p.id} p={p} inCurrent={isAvailable(p)} onSelect={() => onAdd(p, 1)} />
            ))}
          </div>
          <div className="home-products-actions">
            <button className="btn" onClick={() => setView('products')}>
              Ver todos los productos
            </button>
          </div>
        </section>
      )}

      <section className="benefits" aria-labelledby="benefits-title">
        <h2 id="benefits-title" className="section-title center">¿Por qué elegirnos?</h2>
        <div className="benefits-grid">
          {benefits.map((b) => (
            <div key={b.title} className="benefit-card">
              <span className="benefit-icon" aria-hidden="true">{b.icon}</span>
              <h3>{b.title}</h3>
              <p>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
