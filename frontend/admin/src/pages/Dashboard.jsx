import { useEffect, useMemo, useState } from 'react'
import { getDashboard, getShifts, getProducts, getOrders } from '../api'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import DataTable from '../components/DataTable'
import { productImage } from '../utils/productImage'

function formatDayLabel(d) {
  return d.toLocaleDateString('es-PE', { weekday: 'narrow' })
}

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
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      getDashboard(token).catch(() => null),
      getShifts().catch(() => []),
      getProducts().catch(() => []),
      getOrders(token).catch(() => []),
    ])
      .then(([d, s, p, o]) => {
        setDashboard(d)
        setShifts(s)
        setProducts(p)
        setOrders(o)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [token])

  const stats = dashboard || {
    sales_today: 0,
    orders_today: 0,
    pending_payments: 0,
    accepted_orders: 0,
    rejected_orders: 0,
  }

  const recentOrders = orders.slice(0, 5)

  const { sales7Days, salesByShift, topProducts } = useMemo(() => {
    const accepted = orders.filter((o) => ['ACCEPTED', 'COMPLETED'].includes(o.status))

    const today = new Date()
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (6 - i))
      d.setHours(0, 0, 0, 0)
      return d
    })

    const sales7 = last7.map((d) => {
      const dayTotal = accepted
        .filter((o) => {
          const od = new Date(o.created_at)
          od.setHours(0, 0, 0, 0)
          return od.getTime() === d.getTime()
        })
        .reduce((sum, o) => sum + Number(o.total), 0)
      return { day: formatDayLabel(d), amount: dayTotal }
    })

    const shiftMap = new Map(shifts.map((s) => [s.id, s.name]))
    const salesShift = shifts.map((s) => ({
      name: s.name,
      amount: accepted
        .filter((o) => (o.shift_id ?? o.shift_name) === s.id)
        .reduce((sum, o) => sum + Number(o.total), 0),
    }))

    const productTotals = new Map()
    accepted.forEach((o) => {
      (o.items || []).forEach((i) => {
        const id = i.product_id || i.id
        const current = productTotals.get(id) || {
          id,
          name: i.product_name,
          quantity: 0,
          total: 0,
          image_url: i.image_url,
        }
        current.quantity += Number(i.quantity)
        current.total += Number(i.subtotal)
        productTotals.set(id, current)
      })
    })
    const top = Array.from(productTotals.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 3)

    return { sales7Days: sales7, salesByShift: salesShift, topProducts: top }
  }, [orders, shifts])

  const maxSales = Math.max(...sales7Days.map((d) => d.amount), 1)
  const maxShift = Math.max(...salesByShift.map((d) => d.amount), 1)

  if (loading) return <p className="loading-message">Cargando dashboard...</p>
  if (error) return <p className="error">{error}</p>

  return (
    <div className="dashboard">
      <PageHeader
        title="Hola, Administrador 👋"
        subtitle="Bienvenido al panel de administración de tu tienda."
      />
      {dashboard === null && (
        <p className="warning">
          Datos del backend aún no disponibles. Se muestran mocks.
        </p>
      )}

      <section className="dashboard-section">
        <div className="stats-grid">
          <StatCard icon="🛍" value={formatCurrency(stats.sales_today)} label="Ventas del día" trend="↑ 12.5% vs ayer" />
          <StatCard icon="🧾" value={stats.orders_today} label="Pedidos del día" trend="5 pedidos nuevos" />
          <StatCard icon="⏳" value={stats.pending_payments} label="Pagos pendientes" trend="Requieren revisión" accent="#f59e0b" />
          <StatCard icon="✅" value={stats.accepted_orders} label="Pedidos aceptados" trend="Listos para entrega" accent="#22c55e" />
          <StatCard icon="❌" value={stats.rejected_orders} label="Pedidos rechazados" trend="Revisar causas" accent="#ef4444" />
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
          <button className="quick-action" onClick={() => onNavigate('availability')}>
            <span className="quick-action-icon">✓</span>
            <span>Disponibilidad</span>
          </button>
          <button className="quick-action" onClick={() => onNavigate('orders')}>
            <span className="quick-action-icon">🧾</span>
            <span>Ver pedidos</span>
          </button>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="dashboard-section chart-card">
          <h2 className="section-title">Ventas últimos 7 días</h2>
          <div className="line-chart">
            <div className="line-chart-plot">
              {sales7Days.map((d, i) => {
                const height = (d.amount / maxSales) * 100
                return (
                  <div key={i} className="line-chart-point" style={{ left: `${(i / (sales7Days.length - 1)) * 100}%`, bottom: `${height}%` }}>
                    <div className="line-chart-dot" />
                    <span className="line-chart-label">{d.day}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

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
      </div>

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
          <h2 className="section-title">Productos más vendidos</h2>
          <ul className="top-products">
            {topProducts.map((p, i) => (
              <li key={p.id || i} className="top-product">
                <img src={productImage(p)} alt={p.name} className="top-product-img" />
                <div className="top-product-info">
                  <strong>{p.name}</strong>
                  <p>{p.quantity} vendidos — {formatCurrency(p.total)}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
