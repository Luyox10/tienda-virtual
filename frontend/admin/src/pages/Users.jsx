import { useEffect, useState } from 'react'
import { getUsers, getOrders } from '../api'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import DataTable from '../components/DataTable'

export default function Users({ token }) {
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = () => {
    setLoading(true)
    setError(null)
    Promise.all([getUsers(token), getOrders(token)])
      .then(([u, o]) => {
        setUsers(u)
        setOrders(o)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [token])

  const orderCount = (userId) => orders.filter((o) => o.user_id === userId).length

  const filtered = users.filter((u) => {
    const matchesSearch =
      (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  if (loading) return <p className="loading-message">Cargando usuarios...</p>

  return (
    <div className="dashboard">
      <PageHeader title="Usuarios" subtitle="Administra y consulta los usuarios registrados." />
      {error && <p className="error">{error}</p>}

      <section className="dashboard-section">
        <div className="users-header">
          <h2 className="section-title">Usuarios</h2>
          <div className="users-filters">
            <input
              type="text"
              placeholder="Buscar por nombre o correo"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="users-search"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="users-role-filter"
            >
              <option value="all">Todos los roles</option>
              <option value="client">Cliente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>

        <DataTable headers={['Nombre', 'Correo', 'Registro', 'Rol', 'Estado', 'Pedidos']}>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="6" className="empty-cell">No se encontraron usuarios.</td>
            </tr>
          ) : (
            filtered.map((u) => (
              <tr key={u.id}>
                <td>{u.full_name || '-'}</td>
                <td>{u.email}</td>
                <td>{new Date(u.created_at).toLocaleDateString('es-PE')}</td>
                <td><StatusBadge status={u.role} /></td>
                <td><StatusBadge status={u.is_active ? 'active' : 'inactive'} /></td>
                <td>{orderCount(u.id)}</td>
              </tr>
            ))
          )}
        </DataTable>
      </section>
    </div>
  )
}
