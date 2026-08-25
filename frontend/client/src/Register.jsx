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
    <form onSubmit={handleSubmit} className="form auth-form">
      <h2>Crear cuenta</h2>
      {error && <p className="error">{error}</p>}
      <input
        name="full_name"
        placeholder="Nombre completo"
        required
        autoComplete="name"
      />
      <input
        name="email"
        type="email"
        placeholder="Correo electrónico"
        required
        autoComplete="email"
      />
      <input
        name="phone"
        placeholder="Teléfono (opcional)"
        autoComplete="tel"
      />
      <input
        name="password"
        type="password"
        placeholder="Contraseña"
        required
        autoComplete="new-password"
      />
      <input
        name="confirm"
        type="password"
        placeholder="Confirmar contraseña"
        required
        autoComplete="new-password"
      />
      <button type="submit" className="btn" disabled={loading}>
        {loading ? 'Creando cuenta...' : 'Registrarse'}
      </button>
      <p className="auth-link">
        ¿Ya tienes cuenta?{' '}
        <button type="button" className="link" onClick={onToggle}>
          Inicia sesión
        </button>
      </p>
    </form>
  )
}
