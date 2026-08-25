import { useState, useEffect } from 'react'
import { login } from './api'
import AdminPanel from './AdminPanel'
import './styles.css'

function App() {
  const [auth, setAuth] = useState(null)
  const [error, setError] = useState(null)

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
  }

  return (
    <div className="container">
      <h1>Tienda Virtual - Administrador</h1>
      {error && <p className="error">{error}</p>}
      {auth ? (
        <AdminPanel auth={auth} onLogout={logout} />
      ) : (
        <form onSubmit={handleLogin} className="form">
          <h2>Iniciar sesión</h2>
          <input name="email" type="email" placeholder="Correo" required />
          <input name="password" type="password" placeholder="Contraseña" required />
          <button type="submit" className="btn">Ingresar</button>
        </form>
      )}
    </div>
  )
}

export default App
