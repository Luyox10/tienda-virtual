export default function StatCard({ value, label, accent = '#f97316' }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: accent }}>
      <div className="stat-value" style={{ color: accent }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}
