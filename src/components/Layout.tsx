import { useId, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './tdf/Header';
import Footer from './tdf/Footer';
import SideNav from './SideNav';
import { useAuth } from '../auth/AuthProvider';

export default function Layout() {
  const { user, logout } = useAuth();
  const [isNavCollapsed, setNavCollapsed] = useState(true);
  const navId = useId();

  const shellClassName = [
    'app-shell',
    isNavCollapsed ? 'app-shell--nav-collapsed' : 'app-shell--nav-expanded',
  ].join(' ');

  return (
    <>
      <Header items={[]} username={user?.username} onLogout={logout} />
      <div className={shellClassName}>
        <button
          type="button"
          className="side-nav-toggle"
          onClick={() => setNavCollapsed(value => !value)}
          aria-expanded={!isNavCollapsed}
          aria-controls={navId}
          aria-label={isNavCollapsed ? 'Mostrar menú principal' : 'Ocultar menú principal'}
        >
          <span className="side-nav-toggle__icon" aria-hidden="true">
            {isNavCollapsed ? '☰' : '✕'}
          </span>
          <span className="side-nav-toggle__label">Menú</span>
        </button>
        <SideNav
          collapsed={isNavCollapsed}
          id={navId}
          onToggle={() => setNavCollapsed(value => !value)}
        />
        <main className="app-shell__content">
          <div className="container stack-lg">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
