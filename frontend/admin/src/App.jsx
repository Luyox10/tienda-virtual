import { useState, useEffect } from 'react'
import { login } from './api'
import AdminLayout from './components/AdminLayout'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Shifts from './pages/Shifts'
import Availability from './pages/Availability'
import './styles.css'

function App() {
  const [auth, setAuth] = useState(null)
  const [error, setError] = useState(null)
  const [page, setPage] = useState('dashboard')

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

  const renderPage = () => {
    if (page === 'dashboard') return <Dashboard token={auth.token} onNavigate={setPage} />
    if (page === 'products') return <Products token={auth.token} />
    if (page === 'shifts') return <Shifts token={auth.token} />
    if (page === 'availability') return <Availability token={auth.token} />
    if (page === 'orders' || page === 'payments' || page === 'users' || page === 'reports' || page === 'settings') {
      return (
        <div className="card">
          <h2>{page.charAt(0).toUpperCase() + page.slice(1)}</h2>
          <p>Sección en construcción para la Fase 4.</p>
        </div>
      )
    }
    return <Dashboard token={auth.token} onNavigate={setPage} />
  }

  return (
    <div className="admin-app">
      {error && <p className="error error-toast">{error}</p>}
      {auth ? (
        <AdminLayout
          user={auth.user}
          onLogout={logout}
          page={page}
          onNavigate={setPage}
        >
          {renderPage()}
        </AdminLayout>
      ) : (
        <div className="login-screen">
          <form onSubmit={handleLogin} className="form login-form">
            <div className="brand auth-brand">
              <span className="brand-dot" />
              DeliTurnos Admin
            </div>
            <h2>Iniciar sesión</h2>
            <input name="email" type="email" placeholder="Correo" required />
            <input name="password" type="password" placeholder="Contraseña" required />
            <button type="submit" className="btn">Ingresar</button>
          </form>
        </div>
      )}
    </div>
  )
}

export default App
