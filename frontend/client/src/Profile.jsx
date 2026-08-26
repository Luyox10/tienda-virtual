import { useState } from 'react'

const SECTIONS = [
  { key: 'profile', label: 'Mi perfil' },
  { key: 'addresses', label: 'Direcciones' },
  { key: 'payments', label: 'Métodos de pago' },
  { key: 'notifications', label: 'Notificaciones' },
  { key: 'security', label: 'Seguridad' },
]

export default function Profile({ user, onLogout }) {
  const [section, setSection] = useState('profile')
  const [toggles, setToggles] = useState({
    orders: true,
    promos: false,
    news: false,
    reminders: true,
  })

  const renderSection = () => {
    if (section === 'profile') {
      return (
        <div className="profile-section">
          <div className="profile-hero">
            <div className="avatar-big" aria-hidden="true">👤</div>
            <div>
              <h3>{user?.full_name || 'Cliente'}</h3>
              <p className="muted">{user?.email}</p>
              <p className="muted">Miembro desde {new Date(user?.created_at).toLocaleDateString('es-PE')}</p>
            </div>
          </div>
          <div className="profile-fields">
            <div className="field">
              <span className="field-label">Nombre completo</span>
              <span className="field-value">{user?.full_name || '-'}</span>
            </div>
            <div className="field">
              <span className="field-label">Correo</span>
              <span className="field-value">{user?.email || '-'}</span>
            </div>
            <div className="field">
              <span className="field-label">Teléfono</span>
              <span className="field-value">{user?.phone || '-'}</span>
            </div>
            <button className="btn" disabled>Editar información</button>
          </div>
        </div>
      )
    }

    if (section === 'addresses') {
      return (
        <div className="profile-section">
          <h3>Mis direcciones</h3>
          <div className="address-cards">
            <div className="address-card">
              <strong>Dirección principal</strong>
              <p>Av. Los Sabores 123, Lima - Perú</p>
              <button className="btn small secondary">Editar</button>
            </div>
            <div className="address-card">
              <strong>Dirección de trabajo</strong>
              <p>Jr. Delicias 456, Lima - Perú</p>
              <button className="btn small secondary">Editar</button>
            </div>
            <button className="btn small" disabled>+ Agregar nueva dirección</button>
          </div>
        </div>
      )
    }

    if (section === 'payments') {
      return (
        <div className="profile-section">
          <h3>Métodos de pago</h3>
          <div className="payment-methods">
            <div className="payment-method-card">
              <span className="payment-icon" aria-hidden="true">📱</span>
              <div>
                <strong>Yape</strong>
                <p>981 654 321 — Predeterminado</p>
              </div>
            </div>
            <div className="payment-method-card">
              <span className="payment-icon" aria-hidden="true">💳</span>
              <div>
                <strong>Tarjeta Visa</strong>
                <p>**** **** **** 1234</p>
              </div>
            </div>
            <button className="btn small" disabled>+ Agregar método de pago</button>
          </div>
        </div>
      )
    }

    if (section === 'notifications') {
      return (
        <div className="profile-section">
          <h3>Notificaciones</h3>
          <div className="toggle-list">
            {[
              { key: 'orders', label: 'Estado del pedido', desc: 'Recibe actualizaciones sobre tu pedido' },
              { key: 'promos', label: 'Promociones', desc: 'Recibe ofertas y descuentos' },
              { key: 'news', label: 'Novedades', desc: 'Entérate de nuevos productos' },
              { key: 'reminders', label: 'Recordatorios', desc: 'Te recordamos tu turno disponible' },
            ].map((n) => (
              <label key={n.key} className="toggle-row">
                <div>
                  <strong>{n.label}</strong>
                  <p>{n.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={toggles[n.key]}
                  onChange={(e) => setToggles({ ...toggles, [n.key]: e.target.checked })}
                />
              </label>
            ))}
          </div>
        </div>
      )
    }

    if (section === 'security') {
      return (
        <div className="profile-section">
          <h3>Seguridad</h3>
          <form className="form password-form" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="current-pass">Contraseña actual</label>
            <input id="current-pass" type="password" autoComplete="current-password" />
            <label htmlFor="new-pass">Nueva contraseña</label>
            <input id="new-pass" type="password" autoComplete="new-password" />
            <label htmlFor="confirm-pass">Confirmar nueva contraseña</label>
            <input id="confirm-pass" type="password" autoComplete="new-password" />
            <button className="btn" type="submit" disabled>Actualizar contraseña</button>
          </form>
        </div>
      )
    }

    return null
  }

  return (
    <main className="page profile-page">
      <h2 className="page-title">Mi cuenta</h2>
      <div className="profile-layout">
        <aside className="profile-sidebar" role="navigation" aria-label="Configuración de cuenta">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              className={`profile-link ${section === s.key ? 'active' : ''}`}
              onClick={() => setSection(s.key)}
              aria-current={section === s.key ? 'page' : undefined}
            >
              {s.label}
            </button>
          ))}
          <button className="profile-link" onClick={onLogout}>
            Cerrar sesión
          </button>
        </aside>
        <div className="profile-content card">{renderSection()}</div>
      </div>
    </main>
  )
}
