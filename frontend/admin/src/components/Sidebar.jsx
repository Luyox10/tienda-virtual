export default function Sidebar({ active, onNavigate, onLogout, isOpen, onToggle }) {
  const mainItems = [
    { key: 'dashboard', label: 'Dashboard', emoji: '🏠' },
    { key: 'orders', label: 'Pedidos', emoji: '🧾' },
    { key: 'products', label: 'Productos', emoji: '🍔' },
    { key: 'shifts', label: 'Turnos', emoji: '🕐' },
    { key: 'payments', label: 'Pagos', emoji: '💳' },
    { key: 'users', label: 'Usuarios', emoji: '👥' },
    { key: 'reports', label: 'Reportes', emoji: '📊' },
  ]

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} aria-label="Menú de administración">
        <div className="sidebar-brand">
          <img src="/imagenes/productos/logo_deliturnos.png" alt="DeliTurnos" className="sidebar-logo" />
        </div>

        <div className="sidebar-section">MENÚ PRINCIPAL</div>
        <nav className="sidebar-nav" role="navigation">
          {mainItems.map((item) => (
            <button
              key={item.key}
              className={`sidebar-item ${active === item.key ? 'active' : ''}`}
              onClick={() => {
                onNavigate(item.key)
                onToggle(false)
              }}
              aria-label={item.label}
            >
              <span className="sidebar-icon" aria-hidden="true">{item.emoji}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-section">CONFIGURACIÓN</div>
        <nav className="sidebar-nav">
          <button className="sidebar-item" onClick={onLogout} aria-label="Cerrar sesión">
            <span className="sidebar-icon" aria-hidden="true">↪</span>
            <span>Cerrar sesión</span>
          </button>
        </nav>
      </aside>

      {isOpen && <div className="sidebar-overlay" onClick={() => onToggle(false)} />}
    </>
  )
}
