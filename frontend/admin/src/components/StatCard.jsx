export default function StatCard({ icon, value, label, trend, accent = '#f97316' }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: accent }}>
      <div className="stat-header">
        <span className="stat-icon" aria-hidden="true">{icon}</span>
        <span className="stat-trend">{trend}</span>
      </div>
      <div className="stat-value" style={{ color: accent }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}
