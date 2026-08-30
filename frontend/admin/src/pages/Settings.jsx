import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'

const TABS = [
  { key: 'general', label: 'Información general' },
  { key: 'payments', label: 'Métodos de pago' },
  { key: 'notifications', label: 'Notificaciones' },
  { key: 'security', label: 'Seguridad' },
]

export default function Settings() {
  const [tab, setTab] = useState('general')
  const [form, setForm] = useState({
    name: 'DeliTurnos',
    description: 'Tienda de comida fresca y saludable.',
    phone: '999 888 777',
    address: 'Av. Los Sabores 123, Lima - Perú',
  })
  const [toggles, setToggles] = useState({
    orders: true,
    payments: true,
    promotions: false,
    security: true,
  })

  const renderTab = () => {
    if (tab === 'general') {
      return (
        <form className="form settings-form" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="store-name">Nombre de la tienda</label>
          <input
            id="store-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <label htmlFor="store-desc">Descripción</label>
          <input
            id="store-desc"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <label htmlFor="store-phone">Teléfono</label>
          <input
            id="store-phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <label htmlFor="store-address">Dirección</label>
          <input
            id="store-address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <label>Logo</label>
          <div className="logo-preview">🍊</div>
          <button className="btn" disabled type="submit">Guardar cambios</button>
        </form>
      )
    }

    if (tab === 'payments') {
      return (
        <div className="settings-payments">
          <div className="payment-method-row">
            <div>
              <strong>Yape</strong>
              <p className="payment-method-detail">999 888 777</p>
            </div>
            <StatusBadge status="active" />
          </div>
          <button className="btn" disabled>+ Agregar método de pago</button>
        </div>
      )
    }

    if (tab === 'notifications') {
      return (
        <div className="settings-toggles">
          {[
            { key: 'orders', label: 'Nuevos pedidos', desc: 'Recibe alertas cuando llegue un pedido.' },
            { key: 'payments', label: 'Pagos recibidos', desc: 'Notificación al recibir un comprobante.' },
            { key: 'promotions', label: 'Promociones', desc: 'Avisos internos de ofertas.' },
            { key: 'security', label: 'Inicios de sesión', desc: 'Alerta de nuevos accesos al panel.' },
          ].map((n) => (
            <label key={n.key} className="settings-toggle-row">
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
      )
    }

    if (tab === 'security') {
      return (
        <div className="settings-security">
          <div className="settings-option">
            <strong>Cerrar sesión en todos los dispositivos</strong>
            <p>Finaliza todas las sesiones activas excepto la actual.</p>
            <button className="btn" disabled>Revocar sesiones</button>
          </div>
          <div className="settings-option">
            <strong>Autenticación de dos factores</strong>
            <p>Añade una capa extra de seguridad a tu cuenta.</p>
            <button className="btn" disabled>Configurar 2FA</button>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="dashboard">
      <PageHeader title="Configuración" subtitle="Administra la información y preferencias de tu tienda." />

      <div className="settings-tabs" role="tablist" aria-label="Configuración">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`settings-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
            role="tab"
            aria-selected={tab === t.key}
          >
            {t.label}
          </button>
        ))}
      </div>

      <section className="dashboard-section settings-panel">
        {renderTab()}
      </section>
    </div>
  )
}
