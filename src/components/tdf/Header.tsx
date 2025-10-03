import { useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'

type HeaderProps = {
  items: Array<{ to: string; label: string }>
  username?: string
  onLogout?: () => void
}

export default function Header({ items, username, onLogout }: HeaderProps) {
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('tdf-theme') : null
    const root = document.documentElement
    if (stored === 'dark') {
      root.classList.add('theme-dark')
      root.classList.remove('theme-light')
    } else if (stored === 'light') {
      root.classList.add('theme-light')
      root.classList.remove('theme-dark')
    }
  }, [])

  const onToggle = () => {
    const root = document.documentElement
    const isDark = root.classList.toggle('theme-dark')
    root.classList.toggle('theme-light', !isDark)
    try {
      localStorage.setItem('tdf-theme', isDark ? 'dark' : 'light')
    } catch {}
  }

  const navClass = ({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' is-active' : ''}`

  return (
    <header className="site-header">
      <div className="container navbar">
        <Link to="/" className="brand" aria-label="TDF HQ home">
          <img src="/assets/tdf-ui/tdf_logo.svg" alt="" className="brand-logo" />
          <span className="brand-title">TDF HQ</span>
        </Link>
        <nav className="nav-links" aria-label="Primary">
          {items.map(item => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-actions">
          <button className="btn btn-outline" onClick={onToggle} aria-label="Toggle theme">
            Theme
          </button>
          {username && <span className="user-id" aria-label="Signed in user">{username}</span>}
          {onLogout && (
            <button className="btn" onClick={onLogout} type="button">
              Salir
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
