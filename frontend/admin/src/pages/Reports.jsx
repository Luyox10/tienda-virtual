import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'

const salesByDay = [
  { day: 'Lun', amount: 450 },
  { day: 'Mar', amount: 620 },
  { day: 'Mié', amount: 510 },
  { day: 'Jue', amount: 780 },
  { day: 'Vie', amount: 920 },
  { day: 'Sáb', amount: 850 },
  { day: 'Dom', amount: 410 },
]

const salesByShift = [
  { name: 'Mañana', amount: 1250, color: '#f97316' },
  { name: 'Tarde', amount: 1890, color: '#facc15' },
  { name: 'Noche', amount: 420, color: '#ef4444' },
]

const topProducts = [
  { name: 'Causa de pollo', sold: 45, total: 540 },
  { name: 'Papa rellena', sold: 32, total: 384 },
  { name: 'Bebida natural', sold: 28, total: 112 },
  { name: 'Ensalada fresca', sold: 19, total: 228 },
]

function formatCurrency(value) {
  return `S/ ${Number(value || 0).toFixed(2)}`
}

export default function Reports() {
  const [range, setRange] = useState('week')

  const maxDay = Math.max(...salesByDay.map((d) => d.amount), 1)
  const maxShift = Math.max(...salesByShift.map((s) => s.amount), 1)

  return (
    <div className="dashboard">
      <PageHeader title="Reportes" subtitle="Consulta el rendimiento de tu tienda." />

      <section className="dashboard-section">
        <div className="reports-filter">
          <span className="section-title">Periodo</span>
          <select value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="week">Últimos 7 días</option>
            <option value="month">Este mes</option>
            <option value="year">Este año</option>
          </select>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="stats-grid">
          <StatCard icon="💰" value="S/ 4,560.00" label="Ventas totales" trend="↑ 8.2%" accent="#f97316" />
          <StatCard icon="🧾" value="142" label="Pedidos" trend="↑ 12 vs ayer" accent="#f97316" />
          <StatCard icon="👥" value="38" label="Clientes" trend="↑ 4 nuevos" accent="#f97316" />
          <StatCard icon="🎫" value="S/ 32.11" label="Ticket promedio" trend="Estable" accent="#f97316" />
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="dashboard-section chart-card">
          <h2 className="section-title">Ventas por día</h2>
          <div className="bar-chart">
            {salesByDay.map((d) => (
              <div key={d.day} className="bar-chart-item">
                <div className="bar-chart-bar" style={{ height: `${(d.amount / maxDay) * 100}%` }} />
                <div className="bar-chart-name">{d.day}</div>
                <div className="bar-chart-value">{formatCurrency(d.amount)}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-section chart-card">
          <h2 className="section-title">Ventas por turno</h2>
          <div className="bar-chart shift-chart">
            {salesByShift.map((s) => (
              <div key={s.name} className="bar-chart-item">
                <div
                  className="bar-chart-bar"
                  style={{ height: `${(s.amount / maxShift) * 100}%`, background: s.color }}
                />
                <div className="bar-chart-name">{s.name}</div>
                <div className="bar-chart-value">{formatCurrency(s.amount)}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="dashboard-section">
        <h2 className="section-title">Productos más vendidos</h2>
        <ul className="top-products">
          {topProducts.map((p) => (
            <li key={p.name} className="top-product">
              <div className="top-product-info">
                <strong>{p.name}</strong>
                <p>{p.sold} vendidos — {formatCurrency(p.total)}</p>
              </div>
              <span className="top-product-rank">{p.sold}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
