
import { Outlet } from 'react-router-dom'
import Header from './tdf/Header'
import Footer from './tdf/Footer'
import { useAuth } from '../auth/AuthProvider'

type ModuleKey = 'CRM' | 'Scheduling' | 'Packages' | 'Invoicing' | 'Admin'

const NAV_ITEMS: Array<{ to: string; label: string; module?: ModuleKey }> = [
  { to: '/parties', label: 'Parties', module: 'CRM' },
  { to: '/bookings', label: 'Bookings', module: 'Scheduling' },
  { to: '/pipelines', label: 'Pipelines', module: 'Packages' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const allowed = new Set(user?.modules ?? [])
  const items = NAV_ITEMS.filter(item => !item.module || allowed.has(item.module)).map(({ to, label }) => ({
    to,
    label,
  }))

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
