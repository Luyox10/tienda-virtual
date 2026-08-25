import { useState, useEffect } from 'react'
import { getProducts, getShifts, getCurrentShift } from './api'
import './styles.css'

function App() {
  const [products, setProducts] = useState([])
  const [shifts, setShifts] = useState([])
  const [current, setCurrent] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([getProducts(), getShifts(), getCurrentShift()])
      .then(([p, s, c]) => {
        setProducts(p)
        setShifts(s)
        setCurrent(c)
      })
      .catch((e) => setError(e.message))
  }, [])

  return (
    <div className="container">
      <h1>Tienda Virtual - Cliente</h1>
      {error && <p className="error">{error}</p>}

      <h2>Turno actual</h2>
      {current?.current ? (
        <p>
          {current.current.name} - {current.current.is_open ? 'Abierto' : 'Cerrado'}
        </p>
      ) : (
        <p>Cargando...</p>
      )}

      <h2>Turnos</h2>
      <ul>
        {shifts.map((s) => (
          <li key={s.id}>
            {s.name}: {s.start_time} - {s.end_time}
          </li>
        ))}
      </ul>

      <h2>Productos</h2>
      <div className="grid">
        {products.map((p) => (
          <div className="card" key={p.id}>
            <h3>{p.name}</h3>
            <p>Precio: S/ {p.price}</p>
            <p>Turno: {p.shift_name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
