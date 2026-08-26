import { useState } from 'react'
import { useAuth } from './context/AuthContext'

export default function Register({ onToggle, onSuccess }) {
  const { register } = useAuth()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const form = new FormData(e.target)
    const full_name = form.get('full_name')
    const email = form.get('email')
    const password = form.get('password')
    const confirm = form.get('confirm')
    const phone = form.get('phone')

    if (!full_name || !email || !password) {
      setError('Completa todos los campos obligatorios')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    try {
      await register({
        full_name,
        email,
        phone,
        password,
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
        <h2 className="auth-title">Crear cuenta</h2>
        <p className="auth-subtitle">Regístrate para empezar a pedir.</p>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit} className="form auth-form">
          <label htmlFor="register-name">Nombre completo</label>
          <input
            id="register-name"
            name="full_name"
            placeholder="Tu nombre completo"
            required
            autoComplete="name"
          />
          <label htmlFor="register-email">Correo electrónico</label>
          <input
            id="register-email"
            name="email"
            type="email"
            placeholder="tu@correo.com"
            required
            autoComplete="email"
          />
          <label htmlFor="register-phone">Teléfono (opcional)</label>
          <input
            id="register-phone"
            name="phone"
            placeholder="999 999 999"
            autoComplete="tel"
          />
          <label htmlFor="register-password">Contraseña</label>
          <input
            id="register-password"
            name="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            required
            autoComplete="new-password"
          />
          <label htmlFor="register-confirm">Confirmar contraseña</label>
          <input
            id="register-confirm"
            name="confirm"
            type="password"
            placeholder="Repite tu contraseña"
            required
            autoComplete="new-password"
          />
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>
        <p className="auth-link">
          ¿Ya tienes cuenta?{' '}
          <button type="button" className="link" onClick={onToggle}>
            Inicia sesión
          </button>
        </p>
      </div>
    </main>
  )
}
