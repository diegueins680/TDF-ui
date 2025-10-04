import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

type HeaderNavItem = {
  to: string
  label: string
  disabled?: boolean
  tooltip?: string
}

type HeaderProps = {
  items: HeaderNavItem[]
  username?: string
  onLogout?: () => void
}

export default function Header({ items, username, onLogout }: HeaderProps) {
  const [logoReady, setLogoReady] = useState(false)
  const logoRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const node = logoRef.current
    if (node?.complete && node.naturalWidth > 0) {
      setLogoReady(true)
    }
  }, [])
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

  const brandClass = logoReady ? 'brand has-logo' : 'brand is-fallback'

  return (
    <header className="site-header">
      <div className="container navbar">
        <Link to="/" className={brandClass} aria-label="TDF HQ home">
          <img
            src="/assets/tdf-ui/tdf_logo_white.svg?v=3"
            alt=""
            className="brand-logo"
            ref={logoRef}
            onLoad={() => setLogoReady(true)}
            onError={() => setLogoReady(false)}
          />
          <span className="brand-title">TDF HQ</span>
        </Link>
        <nav className="nav-links" aria-label="Primary">
          {items.map(item => (
            item.disabled ? (
              <span key={item.to} className="nav-link is-disabled" title={item.tooltip} aria-disabled="true">
                {item.label}
              </span>
            ) : (
              <NavLink key={item.to} to={item.to} className={navClass} title={item.tooltip ?? undefined}>
                {item.label}
              </NavLink>
            )
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
