import { productImage } from './productImage'
import './Home.css'

function ShiftCard({ s, isOpen, isCurrent }) {
  const lower = s.name.toLowerCase()
  let theme = 'home-shift-night'
  let icon = '🌙'
  if (lower.includes('mañana')) { theme = 'home-shift-morning'; icon = '☀️' }
  else if (lower.includes('tarde')) { theme = 'home-shift-afternoon'; icon = '🌤️' }

  return (
    <div
      className={`card home-shift-card ${theme} ${isOpen ? '' : 'home-shift-closed'} ${
        isCurrent ? 'home-shift-current' : ''
      }`}
    >
      <span className="home-shift-icon" aria-hidden="true">{icon}</span>
      <h3 className="home-shift-name">{s.name}</h3>
      <p className="home-shift-time">
        {s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)}
      </p>
      <span className={`home-shift-status ${isOpen ? 'open' : 'closed'}`}>
        {isOpen ? 'Abierto' : 'Cerrado'}
      </span>
    </div>
  )
}

function ProductCard({ p, inCurrent, onSelect }) {
  const src = productImage(p)
  return (
    <div className={`card home-product-card ${inCurrent ? '' : 'home-product-sold'}`}>
      <div className="home-product-img-wrap">
        {src ? (
          <img src={src} alt={p.name} className="home-product-img" />
        ) : (
          <div className="home-product-img placeholder">Sin imagen</div>
        )}
        {!inCurrent && <span className="home-product-sold-tag">Agotado</span>}
      </div>
      <div className="home-product-body">
        <div className="home-product-meta">
          <span className="home-product-shift">{p.shift_name}</span>
          <span className={`home-product-availability ${inCurrent ? 'available' : 'sold'}`}>
            {inCurrent ? 'Disponible' : 'Agotado'}
          </span>
        </div>
        <h3 className="home-product-title">{p.name}</h3>
        <p className="home-product-price">S/ {Number(p.price).toFixed(2)}</p>
        <button
          className="btn home-add-btn"
          onClick={() => inCurrent && onSelect(p)}
          disabled={!inCurrent}
        >
          {inCurrent ? 'Agregar al carrito' : 'No disponible'}
        </button>
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
  const featured = products.filter((p) => isAvailable(p)).slice(0, 4)
  const allShifts = (shifts || []).slice().sort((a, b) => a.id - b.id)

  return (
    <main className="page home-page">
      <section className="home-hero" aria-label="Bienvenida">
        <div className="home-hero-content">
          <span className="home-hero-eyebrow">Bienvenido a Sabor Delicioso</span>
          <h1 className="home-hero-title">Sabor casero, recién preparado</h1>
          <p className="home-hero-subtitle">
            Elige tu turno, pide tus favoritos y recibe frescura en cada bocado. Tu comida está a un clic.
          </p>
          <div className="home-hero-actions">
            <button className="btn home-hero-cta" onClick={() => setView('products')}>
              Ver productos
            </button>
            <button className="btn home-hero-ghost" onClick={() => setView('orders')}>
              Mis pedidos
            </button>
          </div>

          {currentData && (
            <div className="home-current-shift">
              <span className="home-current-label">Turno actual</span>
              <div className="home-current-pill">
                <span className="home-current-dot" aria-hidden="true" />
                <span className="home-current-name">{currentData.name}</span>
                <span className={`home-current-state ${open ? 'open' : 'closed'}`}>
                  {open ? 'Abierto' : 'Cerrado'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="home-hero-visual" aria-hidden="true">
          <img src="/imagenes/hero-home.svg" alt="Sabor Delicioso" className="home-hero-img" />
        </div>
      </section>

      <section className="home-shifts" aria-labelledby="home-shifts-title">
        <div className="home-section-header">
          <h2 className="home-section-title" id="home-shifts-title">Turnos disponibles</h2>
          <p className="home-section-subtitle">Selecciona el horario que mejor se adapte a ti</p>
        </div>
        <div className="home-shifts-grid">
          {allShifts.map((s) => (
            <ShiftCard
              key={s.id}
              s={s}
              isOpen={s.is_open}
              isCurrent={s.id === currentData?.id}
            />
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="home-products" aria-labelledby="home-products-title">
          <div className="home-section-header">
            <h2 className="home-section-title" id="home-products-title">Productos destacados</h2>
            <p className="home-section-subtitle">Lo más rico del día, listo para pedir</p>
          </div>
          <div className="home-products-grid">
            {featured.map((p) => (
              <ProductCard key={p.id} p={p} inCurrent={isAvailable(p)} onSelect={() => onAdd(p, 1)} />
            ))}
          </div>
          <div className="home-products-actions">
            <button className="btn home-products-cta" onClick={() => setView('products')}>
              Ver todos los productos
            </button>
          </div>
        </section>
      )}

      <section className="home-benefits" aria-labelledby="home-benefits-title">
        <div className="home-section-header">
          <h2 className="home-section-title" id="home-benefits-title">¿Por qué elegirnos?</h2>
          <p className="home-section-subtitle">Comprometidos con la calidad y el sabor</p>
        </div>
        <div className="home-benefits-grid">
          {benefits.map((b) => (
            <div key={b.title} className="card home-benefit-card">
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
