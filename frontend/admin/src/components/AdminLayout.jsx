import { useState } from 'react'
import Sidebar from './Sidebar'
import AdminHeader from './AdminHeader'

const TITLES = {
  dashboard: 'Dashboard',
  orders: 'Pedidos',
  products: 'Productos',
  shifts: 'Turnos',
  availability: 'Disponibilidad',
  payments: 'Pagos',
  users: 'Usuarios',
  reports: 'Reportes',
  settings: 'Ajustes',
}

export default function AdminLayout({ user, onLogout, page, onNavigate, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="admin-layout">
      <Sidebar
        active={page}
        onNavigate={onNavigate}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onToggle={setSidebarOpen}
      />

      <div className="admin-main">
        <AdminHeader
          title={TITLES[page] || 'Panel de control'}
          user={user}
          onLogout={onLogout}
          onMenuToggle={() => setSidebarOpen((o) => !o)}
        />
        <main className="admin-content" role="main">
          {children}
        </main>
      </div>
    </div>
  )
}
