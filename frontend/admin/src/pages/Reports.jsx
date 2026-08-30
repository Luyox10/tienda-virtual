import { useEffect, useState, useMemo } from 'react'
import { getPaidProducts, getShifts } from '../api'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'

function formatDate(date) {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('es-PE')
}

function formatTime(date) {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

function formatCurrency(value) {
  return `S/ ${Number(value || 0).toFixed(2)}`
}

function withinRange(date, range) {
  if (range === 'all') return true
  const now = new Date()
  const d = new Date(date)
  const diff = now - d
  const days = diff / (1000 * 60 * 60 * 24)
  if (range === 'week') return days <= 7
  if (range === 'month') return days <= 30
  if (range === 'year') return days <= 365
  return true
}

export default function Reports({ token }) {
  const [items, setItems] = useState([])
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [range, setRange] = useState('week')
  const [shiftFilter, setShiftFilter] = useState('all')

  useEffect(() => {
    setLoading(true)
    Promise.all([getPaidProducts(token), getShifts()])
      .then(([data, shiftData]) => {
        setItems(data)
        setShifts(shiftData)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })
  }, [token])

  const shiftOptions = useMemo(
    () => shifts.map((s) => s.name).sort(),
    [shifts]
  )

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const okRange = withinRange(i.order_date, range)
      const okShift = shiftFilter === 'all' || i.shift_name === shiftFilter
      return okRange && okShift
    })
  }, [items, range, shiftFilter])

  const total = useMemo(
    () => filtered.reduce((a, i) => a + Number(i.subtotal), 0),
    [filtered]
  )

  if (loading) return <p className="loading-message">Cargando reporte...</p>

  return (
    <div className="dashboard">
      <PageHeader title="Reportes" subtitle="Kardex de productos pagados y aceptados." />
      {error && <p className="error">{error}</p>}

      <section className="dashboard-section">
        <div className="reports-filter">
          <span className="section-title">Periodo</span>
          <select value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="week">Últimos 7 días</option>
            <option value="month">Este mes</option>
            <option value="year">Este año</option>
            <option value="all">Todo</option>
          </select>
          <span className="section-title">Turno</span>
          <select value={shiftFilter} onChange={(e) => setShiftFilter(e.target.value)}>
            <option value="all">Todos</option>
            {shiftOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="report-total">
            <strong>Total: {formatCurrency(total)}</strong>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <h2 className="section-title">Movimiento de productos vendidos</h2>
        <DataTable headers={['Fecha', 'Hora', 'Usuario', 'Email', 'Turno', 'Producto', 'Cant.', 'P. unit.', 'Subtotal']}>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="9" className="empty-cell">No hay productos pagados en este periodo.</td>
            </tr>
          ) : (
            filtered.map((i) => (
              <tr key={i.id}>
                <td>{formatDate(i.order_date)}</td>
                <td>{formatTime(i.order_date)}</td>
                <td>{i.user_name || `Usuario #${i.order_id}`}</td>
                <td>{i.user_email || '—'}</td>
                <td>{i.shift_name}</td>
                <td>{i.product_name}</td>
                <td>{i.quantity}</td>
                <td>{formatCurrency(i.unit_price)}</td>
                <td>{formatCurrency(i.subtotal)}</td>
              </tr>
            ))
          )}
        </DataTable>
      </section>
    </div>
  )
}
