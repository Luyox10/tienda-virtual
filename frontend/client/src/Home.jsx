import { productImage } from './productImage'
import './Home.css'

function ShiftCard({ s, isOpen }) {
  const lower = s.name.toLowerCase()
  let theme = 'home-shift-night'
  let icon = '🌙'
  if (lower.includes('mañana')) { theme = 'home-shift-morning'; icon = '☀️' }
  else if (lower.includes('tarde')) { theme = 'home-shift-afternoon'; icon = '🌤️' }

  const statusClass = isOpen ? `open ${theme}` : 'closed'

  return (
    <article className={`home-shift-card ${theme} ${isOpen ? '' : 'home-shift-closed'}`}>
      <span className="home-shift-icon" aria-hidden="true">{icon}</span>
      <div className="home-shift-info">
        <h3 className="home-shift-name">{s.name}</h3>
        <p className="home-shift-time">
          {s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)}
        </p>
      </div>
      <span className={`home-shift-status ${statusClass}`}>
        {isOpen ? 'Disponible' : 'No disponible'}
      </span>
    </article>
  )
}

function ProductCard({ p, inCurrent, onSelect }) {
  const src = productImage(p)
  return (
    <article className={`home-product-card ${inCurrent ? '' : 'home-product-card-sold'}`}>
      <div className="home-product-img-wrap">
        {src ? (
          <img src={src} alt={p.name} className="home-product-img" />
        ) : (
          <div className="home-product-img placeholder">Sin imagen</div>
        )}
        {!inCurrent && <span className="home-product-sold-overlay">Agotado</span>}
      </div>
      <div className="home-product-body">
        <h3 className="home-product-title">{p.name}</h3>
        {p.description && <p className="home-product-desc">{p.description}</p>}
        <p className="home-product-price">S/ {Number(p.price).toFixed(2)}</p>
        <button
          className="btn home-add-btn"
          onClick={() => inCurrent && onSelect(p)}
          disabled={!inCurrent}
        >
          <span aria-hidden="true">🛒</span> Agregar al carrito
        </button>
      </div>
    </article>
  )
}

const benefits = [
  { icon: '🚚', title: 'Entrega rápida', desc: 'Recibe tu pedido sin demoras' },
  { icon: '✓', title: 'Ingredientes frescos', desc: 'Calidad garantizada' },
  { icon: '💳', title: 'Pago seguro', desc: 'Tus pagos protegidos' },
  { icon: '❤', title: 'Atención amable', desc: 'Estamos para ayudarte' },
]

export default function Home({ products, shifts, current, onAdd, setView }) {
  const openShiftIds = new Set((shifts || []).filter((s) => s.is_open).map((s) => s.id))
  const isAvailable = (p) => p.is_active && openShiftIds.has(p.shift_id)
  const featured = products.slice(0, 3)
  const allShifts = (shifts || []).slice().sort((a, b) => a.id - b.id)

  return (
    <main className="page home-page">
      <section className="home-hero" aria-label="Bienvenida">
        <div className="home-hero-content">
          <span className="home-hero-eyebrow">BIENVENIDO</span>
          <h1 className="home-hero-title">¡Hola! <span aria-hidden="true">👋</span></h1>
          <p className="home-hero-subtitle">¿Qué delicioso vas a pedir hoy?</p>
          <button className="btn home-hero-cta" onClick={() => setView('products')}>
            Ver productos
          </button>
        </div>

        <div className="home-hero-visual" aria-hidden="true">
          <img src="/imagenes/productos/logo_deliturnos.png" alt="DeliTurnos" className="home-hero-img" />
        </div>
      </section>

      <section className="home-shifts" aria-labelledby="home-shifts-title">
        <h2 className="home-section-title" id="home-shifts-title">Turnos del día</h2>
        <div className="home-shifts-grid">
          {allShifts.map((s) => (
            <ShiftCard key={s.id} s={s} isOpen={s.is_open} />
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="home-products" aria-labelledby="home-products-title">
          <div className="home-products-header">
            <h2 className="home-section-title" id="home-products-title">Productos destacados</h2>
            <button className="home-products-link" onClick={() => setView('products')}>
              Ver todos <span aria-hidden="true">→</span>
            </button>
          </div>
          <div className="home-products-grid">
            {featured.map((p) => (
              <ProductCard key={p.id} p={p} inCurrent={isAvailable(p)} onSelect={() => onAdd(p, 1)} />
            ))}
          </div>
        </section>
      )}

      <section className="home-benefits" aria-labelledby="home-benefits-title">
        <h2 className="home-section-title" id="home-benefits-title">¿Por qué elegirnos?</h2>
        <div className="home-benefits-grid">
          {benefits.map((b) => (
            <div key={b.title} className="home-benefit-card">
              <span className="home-benefit-icon" aria-hidden="true">{b.icon}</span>
              <h3 className="home-benefit-title">{b.title}</h3>
              <p>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
