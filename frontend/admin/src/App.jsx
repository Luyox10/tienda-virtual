import { useState, useEffect } from 'react'
import { getProducts, getShifts, getUsers, getDashboard } from './api'
import './styles.css'

function App() {
  const [products, setProducts] = useState([])
  const [shifts, setShifts] = useState([])
  const [users, setUsers] = useState(null)
  const [dashboard, setDashboard] = useState(null)

  useEffect(() => {
    Promise.allSettled([getProducts(), getShifts(), getUsers(), getDashboard()])
      .then(([p, s, u, d]) => {
        if (p.status === 'fulfilled') setProducts(p.value)
        if (s.status === 'fulfilled') setShifts(s.value)
        if (u.status === 'fulfilled') setUsers(u.value)
        if (d.status === 'fulfilled') setDashboard(d.value)
      })
  }, [])

  return (
    <div className="container">
      <h1>Tienda Virtual - Administrador</h1>

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
        <p className="error">Dashboard requiere autenticación</p>
      )}

      <h2>Usuarios</h2>
      {users ? (
        <ul>
          {users.map((u) => (
            <li key={u.id}>{u.email} ({u.role})</li>
          ))}
        </ul>
      ) : (
        <p className="error">Usuarios requieren autenticación</p>
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
