import { useEffect, useState } from 'react'
import { getShifts, updateShift } from '../api'
import PageHeader from '../components/PageHeader'
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

  const handleShift = async (s, value) => {
    try {
      await updateShift(s.id, { is_enabled: value }, token)
      setMessage(`Turno ${value ? 'habilitado' : 'deshabilitado'}`)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <p className="loading-message">Cargando turnos...</p>

  return (
    <div className="dashboard">
      <PageHeader title="Turnos" subtitle="Gestiona los horarios de atención de la tienda." />
      {error && <p className="error">{error}</p>}
      {message && <p className="message">{message}</p>}

      <section className="dashboard-section">
        <h2 className="section-title">Turnos de hoy</h2>
        <DataTable headers={['Turno', 'Horario', 'Estado']}>
          {shifts.length === 0 ? (
            <tr>
              <td colSpan="3" className="empty-cell">No hay turnos registrados.</td>
            </tr>
          ) : (
            shifts.map((s) => (
              <tr key={s.id}>
                <td><strong>{s.name}</strong></td>
                <td>{s.start_time} - {s.end_time}</td>
                <td>
                  <button
                    className={`btn small ${s.is_enabled ? 'success' : 'danger'}`}
                    onClick={() => handleShift(s, !s.is_enabled)}
                  >
                    {s.is_enabled ? 'Habilitado' : 'Deshabilitado'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </DataTable>

        <div className="shift-legend">
          <p>Haz clic en el estado del turno para cambiarlo entre habilitado y deshabilitado.</p>
        </div>
      </section>
    </div>
  )
}
