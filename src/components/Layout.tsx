import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './tdf/Header';
import Footer from './tdf/Footer';
import SideNav from './SideNav';
import { useAuth } from '../auth/AuthProvider';

export default function Layout() {
  const { user, logout } = useAuth();
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  const toggleNav = () => {
    setIsNavCollapsed(prev => !prev);
  };

  const shellClassName = `app-shell${isNavCollapsed ? ' app-shell--nav-collapsed' : ' app-shell--nav-expanded'}`;

  return (
    <>
      <Header items={[]} username={user?.username} onLogout={logout} />
      <div className={shellClassName}>
        <SideNav collapsed={isNavCollapsed} onToggle={toggleNav} />
        <main className="app-shell__content">
          <button
            type="button"
            className="side-nav-toggle"
            onClick={toggleNav}
            aria-expanded={!isNavCollapsed}
            aria-controls="app-side-nav"
          >
            <span className="side-nav-toggle__icon" aria-hidden="true">
              {isNavCollapsed ? '☰' : '✕'}
            </span>
            <span className="side-nav-toggle__label">
              {isNavCollapsed ? 'Abrir menú' : 'Cerrar menú'}
            </span>
          </button>
          <div className="container stack-lg">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
