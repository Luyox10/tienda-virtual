import { useEffect, useMemo, useState } from 'react'
import { getDashboard, getShifts, getOrders } from '../api'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import DataTable from '../components/DataTable'
import { productImage } from '../utils/productImage'

function formatCurrency(value) {
  return `S/ ${Number(value || 0).toFixed(2)}`
}

function formatDate(date) {
  const d = new Date(date)
  return d.toLocaleDateString('es-PE')
}

export default function Dashboard({ token, onNavigate }) {
  const [dashboard, setDashboard] = useState(null)
  const [shifts, setShifts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      getDashboard(token).catch(() => null),
      getShifts().catch(() => []),
      getOrders(token).catch(() => []),
    ])
      .then(([d, s, o]) => {
        setDashboard(d)
        setShifts(s)
        setOrders(o)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [token])

  const computedStats = useMemo(() => {
    const today = new Date().toLocaleDateString('es-PE', { timeZone: 'America/Lima' })
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const accepted = orders.filter((o) => o.status === 'ACCEPTED')
    const rejected = orders.filter((o) => o.status === 'REJECTED')
    const sent = orders.filter((o) => o.status === 'PENDING_PAYMENT')

    const salesToday = accepted
      .filter((o) => new Date(o.created_at).toLocaleDateString('es-PE', { timeZone: 'America/Lima' }) === today)
      .reduce((sum, o) => sum + Number(o.total), 0)
    const salesMonth = accepted
      .filter((o) => {
        const d = new Date(o.created_at)
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth
      })
      .reduce((sum, o) => sum + Number(o.total), 0)

    return {
      sales_today: salesToday,
      sales_month: salesMonth,
      accepted_orders: accepted.length,
      rejected_orders: rejected.length,
      pending_payment_orders: sent.length,
      top_product_today: null,
    }
  }, [orders])

  const stats = dashboard || computedStats

  const recentOrders = orders.slice(0, 5)

  const { salesByShift, acceptedByShift } = useMemo(() => {
    const accepted = orders.filter((o) => ['ACCEPTED', 'COMPLETED'].includes(o.status))

    const salesShift = shifts.map((s) => ({
      name: s.name,
      amount: accepted
        .filter((o) => o.shift_id === s.id)
        .reduce((sum, o) => sum + Number(o.total), 0),
    }))

    const acceptedShift = shifts.map((s) => ({
      name: s.name,
      count: accepted.filter((o) => o.shift_id === s.id).length,
    }))

    return { salesByShift: salesShift, acceptedByShift: acceptedShift }
  }, [orders, shifts])

  const maxShift = Math.max(...salesByShift.map((d) => d.amount), 1)
  const maxAccepted = Math.max(...acceptedByShift.map((d) => d.count), 1)

  if (loading) return <p className="loading-message">Cargando dashboard...</p>
  if (error) return <p className="error">{error}</p>

  return (
    <div className="dashboard">
      <PageHeader
        title="Hola, Administrador 👋"
        subtitle="Bienvenido al panel de administración de tu tienda."
      />

      <section className="dashboard-section">
        <div className="stats-grid">
          <StatCard icon="🛍" value={formatCurrency(stats.sales_today)} label="Ventas del día" trend="Ganancias de hoy" />
          <StatCard icon="💰" value={formatCurrency(stats.sales_month)} label="Ventas del mes" trend="Total del mes" />
          <StatCard icon="✅" value={stats.accepted_orders} label="Pedidos aceptados" accent="#22c55e" />
          <StatCard icon="❌" value={stats.rejected_orders} label="Pedidos rechazados" accent="#ef4444" />
          <StatCard icon="📤" value={stats.pending_payment_orders} label="Pedidos enviados" accent="#f59e0b" />
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="section-title">Acciones rápidas</h2>
        <div className="quick-actions">
          <button className="quick-action" onClick={() => onNavigate('products')}>
            <span className="quick-action-icon">+</span>
            <span>Nuevo producto</span>
          </button>
          <button className="quick-action" onClick={() => onNavigate('shifts')}>
            <span className="quick-action-icon">🕐</span>
            <span>Gestionar turnos</span>
          </button>
          <button className="quick-action" onClick={() => onNavigate('orders')}>
            <span className="quick-action-icon">🧾</span>
            <span>Ver pedidos</span>
          </button>
          <button className="quick-action" onClick={() => onNavigate('payments')}>
            <span className="quick-action-icon">💳</span>
            <span>Ver pagos</span>
          </button>
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="section-title">Pedidos recientes</h2>
        <DataTable headers={['#', 'Cliente', 'Turno', 'Total', 'Estado', 'Fecha']}>
          {recentOrders.length === 0 ? (
            <tr>
              <td colSpan="6" className="empty-cell">No hay pedidos recientes.</td>
            </tr>
          ) : (
            recentOrders.map((o) => (
              <tr key={o.id}>
                <td>#ORD-{o.id}</td>
                <td>{o.user_email || o.user_id}</td>
                <td>{o.shift_name || o.shift_id}</td>
                <td>{formatCurrency(o.total)}</td>
                <td><StatusBadge status={o.status} /></td>
                <td>{formatDate(o.created_at)}</td>
              </tr>
            ))
          )}
        </DataTable>
      </section>

      <div className="dashboard-grid">
        <section className="dashboard-section chart-card">
          <h2 className="section-title">Ventas por turno</h2>
          <div className="bar-chart">
            {salesByShift.map((s) => (
              <div key={s.name} className="bar-chart-item">
                <div className="bar-chart-bar" style={{ height: `${(s.amount / maxShift) * 100}%` }} />
                <div className="bar-chart-name">{s.name}</div>
                <div className="bar-chart-value">{formatCurrency(s.amount)}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-section chart-card">
          <h2 className="section-title">Pedidos aceptados por turno</h2>
          <div className="bar-chart">
            {acceptedByShift.map((s) => (
              <div key={s.name} className="bar-chart-item">
                <div className="bar-chart-bar" style={{ height: `${(s.count / maxAccepted) * 100}%` }} />
                <div className="bar-chart-name">{s.name}</div>
                <div className="bar-chart-value">{s.count} pedidos</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-section">
          <h2 className="section-title">Turnos de hoy</h2>
          <ul className="shift-list">
            {shifts.length === 0 ? (
              <li className="empty-cell">No hay turnos registrados.</li>
            ) : (
              shifts.map((s) => (
                <li key={s.id} className="shift-item">
                  <div>
                    <strong>{s.name}</strong>
                    <p className="shift-time">{s.start_time} - {s.end_time}</p>
                  </div>
                  <StatusBadge status={s.is_enabled ? 'active' : 'inactive'} />
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="dashboard-section">
          <h2 className="section-title">Producto más vendido del día</h2>
          {dashboard?.top_product_today ? (
            <div className="top-product-of-day">
              <img
                src={productImage(dashboard.top_product_today)}
                alt={dashboard.top_product_today.product_name}
                className="top-product-img"
              />
              <div className="top-product-info">
                <strong>{dashboard.top_product_today.product_name}</strong>
                <p>{dashboard.top_product_today.quantity} vendidos — {formatCurrency(dashboard.top_product_today.total)}</p>
              </div>
            </div>
          ) : (
            <p className="empty-cell">Aún no hay ventas hoy.</p>
          )}
        </section>
      </div>
    </div>
  )
}
