import { Outlet } from 'react-router-dom'
import Header from './tdf/Header'
import Footer from './tdf/Footer'
import { useAuth } from '../auth/AuthProvider'
import type { ModuleKey } from '../constants/modules'

const NAV_ITEMS: Array<{ to: string; label: string; module?: ModuleKey; description?: string }> = [
  { to: '/parties', label: 'Parties', module: 'CRM', description: 'CRM: contactos, roles y relaciones' },
  { to: '/bookings', label: 'Bookings', module: 'Scheduling', description: 'Agenda y reservas' },
  { to: '/sessions', label: 'Sessions', module: 'Scheduling', description: 'Sesiones de estudio con salas y equipo' },
  { to: '/teachers', label: 'Teachers', module: 'Scheduling', description: 'Roster docente y asignaciones' },
  { to: '/lessons', label: 'Lessons', module: 'Scheduling', description: 'Clases recurrentes y seguimiento docente' },
  { to: '/trials', label: 'Trial Lessons', module: 'Scheduling', description: 'Solicitudes y primeras clases' },
  { to: '/trials/queue', label: 'Trial Queue', module: 'Scheduling', description: 'Cola de asignación y seguimiento' },
  { to: '/rooms', label: 'Rooms', module: 'Scheduling', description: 'Administración de salas' },
  { to: '/pipelines', label: 'Pipelines', module: 'Packages', description: 'Entregables y flujos de mezcla/mastering' },
  { to: '/packages', label: 'Packages', module: 'Packages', description: 'Catálogo y compras de paquetes' },
  { to: '/invoices', label: 'Invoices', module: 'Invoicing', description: 'Facturación y pagos' },
  { to: '/inventory', label: 'Inventory', module: 'Admin', description: 'Activos físicos, QR y mantenimientos' },
  { to: '/admin', label: 'Admin', module: 'Admin', description: 'Consola de administración y auditorías' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const allowed = new Set(user?.modules ?? [])
  const items = NAV_ITEMS.map(({ to, label, module, description }) => {
    const hasModule = !module || allowed.has(module)
    return {
      to,
      label,
      disabled: !hasModule,
      tooltip: !hasModule ? `Solicita acceso al módulo ${module ?? ''}. ${description ?? ''}`.trim() : description,
    }
  })

  return (
    <>
      <Header items={items} username={user?.username} onLogout={logout} />
      <main className="site-main">
        <div className="container stack-lg">
          <Outlet />
        </div>
      </main>
      <Footer />
    </>
  )
}
