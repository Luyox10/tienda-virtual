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
    <form onSubmit={handleSubmit} className="form auth-form">
      <h2>Iniciar sesión</h2>
      {error && <p className="error">{error}</p>}
      <input
        name="email"
        type="email"
        placeholder="Correo electrónico"
        required
        autoComplete="email"
      />
      <input
        name="password"
        type="password"
        placeholder="Contraseña"
        required
        autoComplete="current-password"
      />
      <button type="submit" className="btn" disabled={loading}>
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>
      <p className="auth-link">
        ¿No tienes cuenta?{' '}
        <button type="button" className="link" onClick={onToggle}>
          Regístrate
        </button>
      </p>
    </form>
  )
}
