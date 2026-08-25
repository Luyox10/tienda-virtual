export default function ShiftCards({ shifts, current }) {
  const currentId = current?.current?.id
  const isCurrentOpen = current?.current?.is_open

  const statusFor = (shift) => {
    if (shift.id === currentId) {
      return isCurrentOpen
        ? { text: 'Disponible', class: 'accepted' }
        : { text: 'Cerrado', class: 'sold-out' }
    }
    if (!shift.is_enabled) {
      return { text: 'No habilitado', class: 'sold-out' }
    }
    return { text: 'Cerrado', class: 'sold-out' }
  }

  return (
    <section className="shifts-section">
      <h2 className="page-title">Turnos del día</h2>
      <div className="shifts-grid">
        {shifts.map((s) => {
          const status = statusFor(s)
          const isCurrent = s.id === currentId
          return (
            <div
              key={s.id}
              className={`card shift-card ${isCurrent ? 'shift-current' : ''}`}
            >
              <div className="shift-icon">
                {s.name === 'MAÑANA' && '☀️'}
                {s.name === 'TARDE' && '🌤️'}
                {s.name === 'NOCHE' && '🌙'}
              </div>
              <h3 className="shift-name">{s.name}</h3>
              <p className="shift-time">
                {s.start_time} - {s.end_time}
              </p>
              <span className={`badge ${status.class}`}>{status.text}</span>
              {isCurrent && <p className="shift-active">Turno actual</p>}
            </div>
          )
        })}
      </div>
    </section>
  )
}
