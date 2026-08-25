import { useState, useEffect } from 'react'
import { login, getProducts, getShifts, getUsers, getDashboard } from './api'
import './styles.css'

function App() {
  const [auth, setAuth] = useState(null)
  const [products, setProducts] = useState([])
  const [shifts, setShifts] = useState([])
  const [users, setUsers] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('admin')
    if (saved) setAuth(JSON.parse(saved))
  }, [])

  useEffect(() => {
    if (!auth) return
    Promise.all([
      getProducts(),
      getShifts(),
      getUsers(auth.token),
      getDashboard(auth.token),
    ])
      .then(([p, s, u, d]) => {
        setProducts(p)
        setShifts(s)
        setUsers(u)
        setDashboard(d)
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
      localStorage.setItem('admin', JSON.stringify(data))
      setAuth(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const logout = () => {
    localStorage.removeItem('admin')
    setAuth(null)
    setProducts([])
    setShifts([])
    setUsers([])
    setDashboard(null)
  }

  if (auth) {
    return (
      <div className="container">
        <header className="header">
          <h1>Tienda Virtual - Administrador</h1>
          <div>
            <span>{auth.user.email} ({auth.user.role})</span>
            <button onClick={logout} className="btn">Cerrar sesión</button>
          </div>
        </header>
        {error && <p className="error">{error}</p>}

        <h2>Dashboard</h2>
        {dashboard ? (
          <ul>
            <li>Ventas hoy: S/ {dashboard.sales_today}</li>
            <li>Ventas mes: S/ {dashboard.sales_month}</li>
            <li>Aceptados: {dashboard.accepted_orders}</li>
            <li>Rechazados: {dashboard.rejected_orders}</li>
            <li>Pendientes: {dashboard.pending_payment_orders}</li>
          </ul>
        ) : (
          <p>Cargando...</p>
        )}

        <h2>Usuarios</h2>
        <ul>
          {users.map((u) => (
            <li key={u.id}>{u.email} ({u.role})</li>
          ))}
        </ul>

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

  return (
    <div className="container">
      <h1>Tienda Virtual - Administrador</h1>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleLogin} className="form">
        <h2>Iniciar sesión</h2>
        <input name="email" type="email" placeholder="Correo" required />
        <input name="password" type="password" placeholder="Contraseña" required />
        <button type="submit" className="btn">Ingresar</button>
      </form>
    </div>
  )
}

export default App
