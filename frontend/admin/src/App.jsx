import { useState, useEffect } from 'react'
import { login } from './api'
import AdminLayout from './components/AdminLayout'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Shifts from './pages/Shifts'
import Availability from './pages/Availability'
import Orders from './pages/Orders'
import Payments from './pages/Payments'
import Users from './pages/Users'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Modal from './components/Modal'
import './styles.css'

function App() {
  const [auth, setAuth] = useState(null)
  const [error, setError] = useState(null)
  const [page, setPage] = useState('dashboard')
  const [logoutModal, setLogoutModal] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('admin')
    if (saved) setAuth(JSON.parse(saved))
  }, [])

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
    setPage('dashboard')
  }

  const isAdmin = auth?.user?.role === 'admin'

  if (auth && !isAdmin) {
    return (
      <div className="unauthorized">
        <h2>Acceso no autorizado</h2>
        <p>
          Esta área es exclusiva para administradores. Si tienes un rol de cliente,
          usa la tienda principal.
        </p>
        <button className="btn" onClick={logout}>Cerrar sesión</button>
      </div>
    )
  }

  const renderPage = () => {
    if (page === 'dashboard') return <Dashboard token={auth.token} onNavigate={setPage} />
    if (page === 'products') return <Products token={auth.token} />
    if (page === 'shifts') return <Shifts token={auth.token} />
    if (page === 'availability') return <Availability token={auth.token} />
    if (page === 'orders') return <Orders token={auth.token} />
    if (page === 'payments') return <Payments token={auth.token} />
    if (page === 'users') return <Users token={auth.token} />
    if (page === 'reports') return <Reports token={auth.token} />
    if (page === 'settings') return <Settings token={auth.token} />
    return <Dashboard token={auth.token} onNavigate={setPage} />
  }

  return (
    <div className="admin-app">
      {error && <p className="error error-toast">{error}</p>}
      {auth ? (
        <AdminLayout
          user={auth.user}
          onLogout={() => setLogoutModal(true)}
          page={page}
          onNavigate={setPage}
        >
          {renderPage()}
        </AdminLayout>
      ) : (
        <div className="login-screen">
          <form onSubmit={handleLogin} className="form login-form">
            <div className="brand auth-brand">
              <img src="/imagenes/productos/logo_deliturnos.png" alt="DeliTurnos" className="brand-logo" />
            </div>
            <h2>Iniciar sesión</h2>
            <input name="email" type="email" placeholder="Correo" required />
            <input name="password" type="password" placeholder="Contraseña" required />
            <button type="submit" className="btn">Ingresar</button>
          </form>
        </div>
      )}

      {logoutModal && (
        <Modal
          title="¿Deseas cerrar sesión?"
          onClose={() => setLogoutModal(false)}
          onConfirm={() => {
            logout()
            setLogoutModal(false)
          }}
          confirmClass="btn danger"
          confirmText="Cerrar sesión"
        >
          Tu sesión actual será finalizada.
        </Modal>
      )}
    </div>
  )
}

export default App
