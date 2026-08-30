import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import { getOrders } from './services/api'

export default function Header({ view, onNavigate, isAuthenticated, user, cartCount, onLogout }) {
  const { token } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [acceptedOrders, setAcceptedOrders] = useState([])
  const [readIds, setReadIds] = useState([])

  const unreadCount = acceptedOrders.filter((o) => !readIds.includes(o.id)).length

  const markRead = () => {
    if (unreadCount === 0 || !user?.id) return
    const updated = [...new Set([...readIds, ...acceptedOrders.map((o) => o.id)])]
    localStorage.setItem(`read-accepted-${user.id}`, JSON.stringify(updated))
    setReadIds(updated)
  }

  useEffect(() => {
    if (!user?.id) {
      setReadIds([])
      return
    }
    try {
      const saved = localStorage.getItem(`read-accepted-${user.id}`)
      setReadIds(saved ? JSON.parse(saved) : [])
    } catch {
      setReadIds([])
    }
  }, [user?.id])

  useEffect(() => {
    if (!isAuthenticated || !token) return
    const today = new Date().toLocaleDateString('es-PE', { timeZone: 'America/Lima' })
    const fetchOrders = async () => {
      try {
        const orders = await getOrders(token)
        const accepted = orders.filter((o) => {
          if (o.status !== 'ACCEPTED') return false
          const orderDate = new Date(o.created_at).toLocaleDateString('es-PE', { timeZone: 'America/Lima' })
          return orderDate === today
        })
        setAcceptedOrders(accepted)
      } catch {
        // ignore
      }
    }
    fetchOrders()
    const interval = setInterval(fetchOrders, 2000)
    return () => clearInterval(interval)
  }, [isAuthenticated, token])

  useEffect(() => {
    if (!user?.id) return
    const todayIds = new Set(acceptedOrders.map((o) => o.id))
    const pruned = readIds.filter((id) => todayIds.has(id))
    if (pruned.length !== readIds.length) {
      localStorage.setItem(`read-accepted-${user.id}`, JSON.stringify(pruned))
      setReadIds(pruned)
    }
  }, [acceptedOrders, user?.id])

  const nav = [
    { key: 'home', label: 'Inicio' },
    { key: 'products', label: 'Productos' },
    { key: 'orders', label: 'Mis pedidos' },
    { key: 'contact', label: 'Contacto' },
  ]

  return (
    <header className="app-header" role="banner">
      <div className="inner header-inner">
        <a className="brand" href="#" onClick={(e) => { e.preventDefault(); onNavigate('home') }} aria-label="DeliTurnos - Inicio">
          <img src="/imagenes/productos/logo_deliturnos.png" alt="" className="brand-logo" aria-hidden="true" />
          <span className="brand-name">Deli<span className="brand-accent">Turnos</span></span>
        </a>

        <nav className="main-nav" aria-label="Navegación principal">
          {nav.map((n) => (
            <button
              key={n.key}
              className={`nav-link ${view === n.key ? 'active' : ''}`}
              onClick={() => onNavigate(n.key)}
              aria-current={view === n.key ? 'page' : undefined}
            >
              {n.label}
            </button>
          ))}
        </nav>

        <div className="header-tools">
          <button className="tool-btn cart-btn" onClick={() => onNavigate('cart')} aria-label={`Carrito con ${cartCount} productos`}>
            <span aria-hidden="true">🛒</span>
            {cartCount > 0 && <span className="tool-badge">{cartCount}</span>}
          </button>
          <div className="notif-container">
            <button className="tool-btn" onClick={() => { setNotifOpen((p) => !p); if (!notifOpen) markRead() }} aria-label="Notificaciones">
              <span aria-hidden="true">🔔</span>
              {unreadCount > 0 && <span className="tool-badge notif-badge">{unreadCount}</span>}
            </button>
            {notifOpen && (
              <div className="notification-dropdown">
                {acceptedOrders.length === 0 ? (
                  <div className="notification-empty">No tienes notificaciones</div>
                ) : (
                  acceptedOrders.map((o) => (
                    <button key={o.id} className="notification-item" onClick={() => { setNotifOpen(false); onNavigate('orders') }}>
                      <span className="notification-title">Pedido #{String(o.id).padStart(4, '0')}</span>
                      <span className="notification-meta">{new Date(o.created_at).toLocaleString('es-PE', { timeZone: 'America/Lima' })}</span>
                      <span className="notification-meta">{o.first_product_name || 'Pedido'} · Turno {o.shift_name || '-'} · S/ {Number(o.total).toFixed(2)}</span>
                      <span className="notification-order">El administrador acaba de aceptar tu pedido, entra a detalles para tener un mejor control de tu compra por favor</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-pill" aria-haspopup="true" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
                <span className="avatar" aria-hidden="true">👤</span>
                <span className="user-name">{user?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}</span>
              </span>
              {menuOpen && (
                <div className="dropdown">
                  <button onClick={() => { setMenuOpen(false); onNavigate('profile') }}>Mi perfil</button>
                  <button onClick={() => { setMenuOpen(false); onLogout() }}>Cerrar sesión</button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn small" onClick={() => onNavigate('login')}>Ingresar</button>
          )}

          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menú" aria-expanded={menuOpen}>
            <span aria-hidden="true">☰</span>
          </button>
        </div>

        {menuOpen && (
          <nav className="mobile-menu" aria-label="Menú móvil">
            {nav.map((n) => (
              <button
                key={n.key}
                className={`mobile-nav-link ${view === n.key ? 'active' : ''}`}
                onClick={() => { setMenuOpen(false); onNavigate(n.key) }}
              >
                {n.label}
              </button>
            ))}
            <button onClick={() => { setMenuOpen(false); onNavigate('cart') }}>Carrito ({cartCount})</button>
            {isAuthenticated ? (
              <button onClick={() => { setMenuOpen(false); onLogout() }}>Cerrar sesión</button>
            ) : (
              <button onClick={() => { setMenuOpen(false); onNavigate('login') }}>Ingresar</button>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
