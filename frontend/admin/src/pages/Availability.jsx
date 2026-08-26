import { useEffect, useState } from 'react'
import { getProducts, getShifts, setProductAvailability } from '../api'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import { productImage } from '../utils/productImage'

export default function Availability({ token }) {
  const [products, setProducts] = useState([])
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [availability, setAvailability] = useState({})

  const load = () => {
    setLoading(true)
    setError(null)
    Promise.all([getProducts(), getShifts()])
      .then(([p, s]) => {
        setProducts(p)
        setShifts(s)
        // Estado inicial por producto basado en is_active
        const initial = {}
        p.forEach((prod) => {
          initial[prod.id] = prod.is_active ? 'available' : 'sold_out'
        })
        setAvailability(initial)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const toggle = async (product) => {
    const next = availability[product.id] === 'available' ? 'sold_out' : 'available'
    try {
      await setProductAvailability(product.id, { date, status: next }, token)
      setAvailability({ ...availability, [product.id]: next })
      setMessage(`Disponibilidad de ${product.name} actualizada`)
    } catch (err) {
      setError(err.message)
    }
  }

  const productsByShift = shifts.map((s) => ({
    ...s,
    products: products.filter((p) => p.shift_id === s.id),
  }))

  if (loading) return <p className="loading-message">Cargando disponibilidad...</p>

  return (
    <div className="dashboard">
      <PageHeader title="Disponibilidad" subtitle="Controla qué productos están disponibles hoy." />
      {error && <p className="error">{error}</p>}
      {message && <p className="message">{message}</p>}

      <section className="dashboard-section">
        <div className="availability-header">
          <h2 className="section-title">Disponibilidad del día</h2>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="small-input"
          />
        </div>

        {productsByShift.map((s) => (
          <div key={s.id} className="availability-shift">
            <h3 className="availability-shift-name">{s.name}</h3>
            {s.products.length === 0 ? (
              <p className="empty-cell">No hay productos para este turno.</p>
            ) : (
              <ul className="availability-list">
                {s.products.map((p) => (
                  <li key={p.id} className="availability-item">
                    <img src={productImage(p)} alt={p.name} className="product-thumb" />
                    <div className="availability-info">
                      <strong>{p.name}</strong>
                      <StatusBadge status={availability[p.id]} />
                    </div>
                    <button className="btn small" onClick={() => toggle(p)}>
                      {availability[p.id] === 'available' ? 'Marcar agotado' : 'Marcar disponible'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>
    </div>
  )
}
