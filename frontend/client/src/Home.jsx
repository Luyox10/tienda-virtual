import ShiftCards from './ShiftCards'
import ProductList from './ProductList'

export default function Home({ products, shifts, current, cart, onAdd, setView }) {
  const currentData = current?.current

  return (
    <div>
      <section className="hero">
        <h2 className="hero-title">
          {currentData?.is_open ? '¡Hola! El turno está abierto' : '¡Hola! Bienvenido a DeliTurnos'}
        </h2>
        <p className="hero-subtitle">
          {currentData?.is_open
            ? `Puedes pedir ahora del turno ${currentData.name}`
            : 'Revisa los turnos y vuelve en cuanto esté abierto el que prefieras'}
        </p>
        {cart.length > 0 && (
          <button className="btn hero-cta" onClick={() => setView('cart')}>
            Ir al carrito ({cart.reduce((a, i) => a + i.quantity, 0)})
          </button>
        )}
      </section>

      <ShiftCards shifts={shifts} current={current} />
      <ProductList products={products} current={current} onAdd={onAdd} />
    </div>
  )
}
