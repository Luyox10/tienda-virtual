import { useState, useEffect } from 'react'
import AdminOrders from './AdminOrders'
import AdminPayments from './AdminPayments'
import {
  getProducts,
  getShifts,
  getUsers,
  getDashboard,
  createProduct,
  updateProduct,
  setProductAvailability,
  updateShift,
} from './api'

export default function AdminPanel({ auth, onLogout }) {
  const [products, setProducts] = useState([])
  const [shifts, setShifts] = useState([])
  const [users, setUsers] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [form, setForm] = useState({
    id: null,
    name: '',
    description: '',
    price: '',
    image_url: '',
    shift_id: '',
  })
  const [availability, setAvailability] = useState({
    productId: '',
    date: '',
    status: 'available',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
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
  }

  const editProduct = (p) => {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: p.price,
      image_url: p.image_url || '',
      shift_id: p.shift_id,
    })
  }

  const resetProduct = () => {
    setForm({
      id: null,
      name: '',
      description: '',
      price: '',
      image_url: '',
      shift_id: '',
    })
  }

  const handleProductSubmit = async (e) => {
    e.preventDefault()
    try {
      const body = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        image_url: form.image_url,
        shift_id: Number(form.shift_id),
      }
      if (form.id) {
        await updateProduct(form.id, body, auth.token)
        setMessage('Producto actualizado')
      } else {
        await createProduct(body, auth.token)
        setMessage('Producto creado')
      }
      resetProduct()
      loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleActive = async (p) => {
    try {
      await updateProduct(p.id, { is_active: !p.is_active }, auth.token)
      setMessage(`Producto ${p.is_active ? 'desactivado' : 'activado'}`)
      loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleAvailability = async (e) => {
    e.preventDefault()
    try {
      await setProductAvailability(
        availability.productId,
        {
          date: availability.date,
          status: availability.status,
        },
        auth.token
      )
      setMessage('Disponibilidad actualizada')
      setAvailability({ productId: '', date: '', status: 'available' })
    } catch (err) {
      setError(err.message)
    }
  }

  const handleShift = async (s, field, value) => {
    try {
      await updateShift(s.id, { [field]: value }, auth.token)
      setMessage('Turno actualizado')
      loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  const nextOverride = (s) => {
    if (s.manual_override === null) return 0
    if (s.manual_override === 0) return 1
    return null
  }

  const overrideLabel = (s) => {
    if (s.manual_override === null) return 'Auto'
    if (s.manual_override === 0) return 'Cerrado'
    return 'Abierto'
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Tienda Virtual - Administrador</h1>
        <div>
          <span>{auth.user.email} ({auth.user.role})</span>
          <button onClick={onLogout} className="btn">Cerrar sesión</button>
        </div>
      </header>

      {error && <p className="error">{error}</p>}
      {message && <p className="message">{message}</p>}

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
      <table className="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Habilitado</th>
            <th>Override</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.start_time}</td>
              <td>{s.end_time}</td>
              <td>
                <button
                  className="btn small"
                  onClick={() => handleShift(s, 'is_enabled', !s.is_enabled)}
                >
                  {s.is_enabled ? 'Sí' : 'No'}
                </button>
              </td>
              <td>
                <button
                  className="btn small"
                  onClick={() => handleShift(s, 'manual_override', nextOverride(s))}
                >
                  {overrideLabel(s)}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>{form.id ? 'Editar' : 'Crear'} producto</h2>
      <form onSubmit={handleProductSubmit} className="form">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nombre"
          required
        />
        <input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Descripción"
        />
        <input
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          placeholder="Precio"
          required
        />
        <input
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          placeholder="URL de imagen"
        />
        <select
          value={form.shift_id}
          onChange={(e) => setForm({ ...form, shift_id: e.target.value })}
          required
        >
          <option value="">Turno</option>
          {shifts.map((s) => (
            <option value={s.id} key={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <div>
          <button type="submit" className="btn">
            {form.id ? 'Guardar cambios' : 'Crear producto'}
          </button>
          {form.id && (
            <button type="button" className="btn secondary" onClick={resetProduct}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <h2>Disponibilidad diaria</h2>
      <form onSubmit={handleAvailability} className="form">
        <select
          value={availability.productId}
          onChange={(e) => setAvailability({ ...availability, productId: e.target.value })}
          required
        >
          <option value="">Producto</option>
          {products.map((p) => (
            <option value={p.id} key={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={availability.date}
          onChange={(e) => setAvailability({ ...availability, date: e.target.value })}
          required
        />
        <select
          value={availability.status}
          onChange={(e) => setAvailability({ ...availability, status: e.target.value })}
          required
        >
          <option value="available">Disponible</option>
          <option value="sold_out">Agotado</option>
        </select>
        <button type="submit" className="btn">Actualizar disponibilidad</button>
      </form>

      <AdminOrders token={auth.token} />
      <AdminPayments token={auth.token} />

      <h2>Productos</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Turno</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className={p.is_active ? '' : 'sold-out'}>
              <td>
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="product-thumb" />
                ) : (
                  '—'
                )}
              </td>
              <td>{p.name}</td>
              <td>S/ {p.price}</td>
              <td>{p.shift_name}</td>
              <td>{p.is_active ? 'Activo' : 'Inactivo'}</td>
              <td>
                <button className="btn small" onClick={() => editProduct(p)}>
                  Editar
                </button>
                <button className="btn small" onClick={() => toggleActive(p)}>
                  {p.is_active ? 'Desactivar' : 'Activar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
