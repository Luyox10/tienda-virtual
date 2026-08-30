export default function AdminHeader({ title, user, onLogout, onMenuToggle }) {
  const today = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button className="menu-toggle" onClick={onMenuToggle} aria-label="Abrir menú">
          ☰
        </button>
        <div>
          <h1 className="admin-title">{title}</h1>
          <p className="admin-subtitle">Hoy tienes un resumen general de tu tienda.</p>
        </div>
      </div>

      <div className="admin-header-right">
        <span className="admin-date" aria-label="Fecha actual">{today}</span>
        <button className="icon-btn" aria-label="Notificaciones">🔔</button>
        <div className="admin-user" aria-label="Usuario administrador">
          <span className="admin-avatar" aria-hidden="true">👤</span>
          <span className="admin-user-name">{user?.full_name || user?.email || 'Administrador'}</span>
          <span className="admin-user-role">{user?.role ? `(${user.role})` : ''}</span>
        </div>
        <button onClick={onLogout} className="btn secondary small">Salir</button>
      </div>
    </header>
  )
}
