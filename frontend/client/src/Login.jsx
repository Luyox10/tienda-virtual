import { useState } from 'react'
import { useAuth } from './context/AuthContext'

export default function Login({ onToggle, onSuccess }) {
  const { login } = useAuth()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const form = new FormData(e.target)
    try {
      await login({
        email: form.get('email'),
        password: form.get('password'),
      })
      onSuccess?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Bienvenido nuevamente</h2>
        <p className="auth-subtitle">Inicia sesión para continuar con tu pedido.</p>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit} className="form auth-form">
          <label htmlFor="login-email">Correo electrónico</label>
          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="tu@correo.com"
            required
            autoComplete="email"
          />
          <label htmlFor="login-password">Contraseña</label>
          <input
            id="login-password"
            name="password"
            type="password"
            placeholder="Contraseña"
            required
            autoComplete="current-password"
          />
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
        <p className="auth-link">
          ¿No tienes cuenta?{' '}
          <button type="button" className="link" onClick={onToggle}>
            Crear cuenta
          </button>
        </p>
      </div>
    </main>
  )
}
