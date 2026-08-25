export default function MobileNav({ view, onNavigate, isAuthenticated, cartCount, onLogin, onLogout }) {
  const items = [
    { key: 'home', label: 'Inicio', emoji: '🏠' },
    { key: 'orders', label: 'Pedidos', emoji: '📦' },
    { key: 'cart', label: 'Carrito', emoji: '🛒' },
  ]

  const go = (key) => {
    if (key === 'orders' && !isAuthenticated) {
      onLogin()
    } else {
      onNavigate(key)
    }
  }

  return (
    <nav className="mobile-nav" aria-label="Navegación principal">
      {items.map((item) => (
        <button
          key={item.key}
          className={`mobile-nav-item ${view === item.key ? 'active' : ''}`}
          onClick={() => go(item.key)}
          aria-label={item.label}
        >
          <span className="mobile-nav-icon" aria-hidden="true">
            {item.emoji}
            {item.key === 'cart' && cartCount > 0 && (
              <span className="mobile-nav-badge">{cartCount}</span>
            )}
          </span>
          <span className="mobile-nav-label">{item.label}</span>
        </button>
      ))}
      {isAuthenticated ? (
        <button
          className="mobile-nav-item"
          onClick={onLogout}
          aria-label="Cerrar sesión"
        >
          <span className="mobile-nav-icon" aria-hidden="true">👤</span>
          <span className="mobile-nav-label">Salir</span>
        </button>
      ) : (
        <button
          className="mobile-nav-item"
          onClick={onLogin}
          aria-label="Iniciar sesión"
        >
          <span className="mobile-nav-icon" aria-hidden="true">👤</span>
          <span className="mobile-nav-label">Ingresar</span>
        </button>
      )}
    </nav>
  )
}
