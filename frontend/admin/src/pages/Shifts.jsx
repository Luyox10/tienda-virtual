import { useEffect, useState } from 'react'
import { getShifts, updateShift } from '../api'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import DataTable from '../components/DataTable'

export default function Shifts({ token }) {
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const load = () => {
    setLoading(true)
    setError(null)
    getShifts()
      .then(setShifts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const nextOverride = (manualOverride) => {
    if (manualOverride === null) return 0
    if (manualOverride === 0) return 1
    return null
  }

  const overrideLabel = (manualOverride) => {
    if (manualOverride === null) return 'Automático'
    if (manualOverride === 0) return 'Forzar cerrado'
    return 'Forzar abierto'
  }

  const handleShift = async (s, field, value) => {
    try {
      await updateShift(s.id, { [field]: value }, token)
      setMessage('Turno actualizado')
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleOverride = (s) => {
    const next = nextOverride(s.manual_override)
    handleShift(s, 'manual_override', next)
  }

  if (loading) return <p className="loading-message">Cargando turnos...</p>

  return (
    <div className="dashboard">
      <PageHeader title="Turnos" subtitle="Gestiona los horarios de atención de la tienda." />
      {error && <p className="error">{error}</p>}
      {message && <p className="message">{message}</p>}

      <section className="dashboard-section">
        <h2 className="section-title">Turnos de hoy</h2>
        <DataTable headers={['Turno', 'Horario', 'Habilitado', 'Override manual']}>
          {shifts.length === 0 ? (
            <tr>
              <td colSpan="4" className="empty-cell">No hay turnos registrados.</td>
            </tr>
          ) : (
            shifts.map((s) => (
              <tr key={s.id}>
                <td><strong>{s.name}</strong></td>
                <td>{s.start_time} - {s.end_time}</td>
                <td>
                  <button
                    className="btn small"
                    onClick={() => handleShift(s, 'is_enabled', !s.is_enabled)}
                  >
                    {s.is_enabled ? 'Sí' : 'No'}
                  </button>
                </td>
                <td>
                  <button
                    className="btn small"
                    onClick={() => toggleOverride(s)}
                  >
                    {overrideLabel(s.manual_override)}
                  </button>
                </td>
              </tr>
            ))
          )}
        </DataTable>

        <div className="shift-legend">
          <p><strong>Estados de override:</strong></p>
          <ul>
            <li><StatusBadge status="active" /> <strong>Automático:</strong> el sistema decide si el turno está abierto.</li>
            <li><StatusBadge status="rejected" /> <strong>Forzar cerrado:</strong> siempre aparece como cerrado.</li>
            <li><StatusBadge status="accepted" /> <strong>Forzar abierto:</strong> siempre aparece como abierto.</li>
          </ul>
        </div>
      </section>
    </div>
  )
}
