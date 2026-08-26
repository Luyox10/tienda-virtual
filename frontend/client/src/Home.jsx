import { productImage } from './productImage'

const benefits = [
  { icon: '🚚', title: 'Entrega rápida', desc: 'Recibe tu pedido sin demoras' },
  { icon: '✓', title: 'Ingredientes frescos', desc: 'Calidad garantizada' },
  { icon: '💳', title: 'Pago seguro', desc: 'Tus pagos protegidos' },
  { icon: '❤', title: 'Atención amable', desc: 'Estamos para ayudarte' },
]

export default function Home({ products, current, onAdd, setView }) {
  const currentData = current?.current
  const open = currentData?.is_open

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
          {sample[0] ? (
            <img src={productImage(sample[0])} alt={sample[0].name} />
          ) : (
            <div className="hero-placeholder">🍽️</div>
          )}
        </div>
      </section>

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
