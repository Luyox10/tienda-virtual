import { useState, useEffect } from 'react'
import { register, login, getProducts, getShifts, getCurrentShift } from './api'
import './styles.css'

function App() {
  const [view, setView] = useState('login')
  const [auth, setAuth] = useState(null)
  const [products, setProducts] = useState([])
  const [shifts, setShifts] = useState([])
  const [current, setCurrent] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('customer')
    if (saved) setAuth(JSON.parse(saved))
  }, [])

  useEffect(() => {
    if (!auth) return
    Promise.all([getProducts(), getShifts(), getCurrentShift()])
      .then(([p, s, c]) => {
        setProducts(p)
        setShifts(s)
        setCurrent(c)
      })
      .catch((e) => setError(e.message))
  }, [auth])

  const handleLogin = async (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    try {
      const data = await login({
        email: form.get('email'),
        password: form.get('password'),
      })
      localStorage.setItem('customer', JSON.stringify(data))
      setAuth(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    try {
      const data = await register({
        full_name: form.get('full_name'),
        email: form.get('email'),
        phone: form.get('phone'),
        password: form.get('password'),
      })
      localStorage.setItem('customer', JSON.stringify(data))
      setAuth(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const logout = () => {
    localStorage.removeItem('customer')
    setAuth(null)
    setProducts([])
    setShifts([])
    setCurrent(null)
  }

  if (auth) {
    return (
      <div className="container">
        <header className="header">
          <h1>Tienda Virtual - Cliente</h1>
          <div>
            <span>{auth.user.email} ({auth.user.role})</span>
            <button onClick={logout} className="btn">Cerrar sesión</button>
          </div>
        </header>
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
            <div className={`card ${p.is_active ? '' : 'sold-out'}`} key={p.id}>
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} className="product-img" />
              ) : (
                <div className="product-img placeholder">Sin imagen</div>
              )}
              <h3>{p.name}</h3>
              <p>Precio: S/ {p.price}</p>
              <p>Turno: {p.shift_name}</p>
              <p>{p.is_active ? 'Disponible' : 'Agotado / Inactivo'}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>Tienda Virtual - Cliente</h1>
      {error && <p className="error">{error}</p>}

      {view === 'login' ? (
        <form onSubmit={handleLogin} className="form">
          <h2>Iniciar sesión</h2>
          <input name="email" type="email" placeholder="Correo" required />
          <input name="password" type="password" placeholder="Contraseña" required />
          <button type="submit" className="btn">Ingresar</button>
          <p>
            ¿No tienes cuenta?{' '}
            <button type="button" className="link" onClick={() => setView('register')}>
              Regístrate
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="form">
          <h2>Crear cuenta</h2>
          <input name="full_name" placeholder="Nombre completo" required />
          <input name="email" type="email" placeholder="Correo" required />
          <input name="phone" placeholder="Teléfono" />
          <input name="password" type="password" placeholder="Contraseña" required />
          <button type="submit" className="btn">Registrarse</button>
          <p>
            ¿Ya tienes cuenta?{' '}
            <button type="button" className="link" onClick={() => setView('login')}>
              Inicia sesión
            </button>
          </p>
        </form>
      )}
    </div>
  )
}

export default App
