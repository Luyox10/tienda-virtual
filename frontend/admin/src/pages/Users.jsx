import { useEffect, useState } from 'react'
import { getUsers, getOrders, updateUser, deleteUser } from '../api'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'

export default function Users({ token }) {
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [viewUser, setViewUser] = useState(null)
  const [editUser, setEditUser] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

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

  const handleDelete = async (id) => {
    try {
      await deleteUser(id, token)
      setMessage('Usuario eliminado')
      setDeleteConfirm(null)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleUpdate = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    try {
      await updateUser(editUser.id, {
        full_name: editUser.full_name,
        email: editUser.email,
        phone: editUser.phone,
        is_active: editUser.is_active,
      }, token)
      setMessage('Usuario actualizado')
      setEditUser(null)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

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
      {message && <p className="message">{message}</p>}

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

        <DataTable headers={['Nombre', 'Correo', 'Celular', 'Registro', 'Rol', 'Estado', 'Pedidos', 'Acciones']}>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="8" className="empty-cell">No se encontraron usuarios.</td>
            </tr>
          ) : (
            filtered.map((u) => (
              <tr key={u.id}>
                <td>{u.full_name || '-'}</td>
                <td>{u.email}</td>
                <td>{u.phone || '-'}</td>
                <td>{new Date(u.created_at).toLocaleDateString('es-PE')}</td>
                <td><StatusBadge status={u.role} /></td>
                <td><StatusBadge status={u.is_active ? 'active' : 'inactive'} /></td>
                <td>{orderCount(u.id)}</td>
                <td>
                  <button className="btn small" onClick={() => setViewUser(u)}>Ver</button>
                  {u.role === 'admin' ? (
                    <button className="btn small" onClick={() => setEditUser(u)}>
                      Editar
                    </button>
                  ) : (
                    <button className="btn small danger" onClick={() => setDeleteConfirm(u)}>
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </DataTable>
      </section>

      {viewUser && (
        <Modal title={viewUser.full_name || viewUser.email} onClose={() => setViewUser(null)}>
          <div className="user-detail">
            <p><strong>ID:</strong> {viewUser.id}</p>
            <p><strong>Correo:</strong> {viewUser.email}</p>
            <p><strong>Teléfono:</strong> {viewUser.phone || '-'}</p>
            <p><strong>Rol:</strong> {viewUser.role}</p>
            <p><strong>Estado:</strong> {viewUser.is_active ? 'Activo' : 'Inactivo'}</p>
            <p><strong>Registro:</strong> {new Date(viewUser.created_at).toLocaleDateString('es-PE')}</p>
            <p><strong>Pedidos:</strong> {orderCount(viewUser.id)}</p>
          </div>
        </Modal>
      )}

      {editUser && (
        <Modal
          title="Editar usuario"
          onClose={() => setEditUser(null)}
          onConfirm={handleUpdate}
          confirmText="Guardar cambios"
          confirmClass="btn"
          cancelText="Cancelar"
        >
          <form onSubmit={handleUpdate} className="form user-form" onClick={(e) => e.stopPropagation()}>
            <label>
              Nombre
              <input
                value={editUser.full_name || ''}
                onChange={(e) => setEditUser({ ...editUser, full_name: e.target.value })}
                required
              />
            </label>
            <label>
              Correo
              <input
                type="email"
                value={editUser.email || ''}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                required
              />
            </label>
            <label>
              Teléfono
              <input
                value={editUser.phone || ''}
                onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
              />
            </label>
            <label className="form-check">
              <input
                type="checkbox"
                checked={editUser.is_active}
                onChange={(e) => setEditUser({ ...editUser, is_active: e.target.checked })}
              />
              <span>Activo</span>
            </label>
          </form>
        </Modal>
      )}

      {deleteConfirm && (
        <Modal
          title={`¿Eliminar a ${deleteConfirm.full_name || deleteConfirm.email}?`}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => handleDelete(deleteConfirm.id)}
          confirmText="Eliminar"
          confirmClass="btn danger"
        >
          Esta acción eliminará al usuario y no se puede deshacer.
        </Modal>
      )}
    </div>
  )
}
