import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './tdf/Header';
import Footer from './tdf/Footer';
import SideNav from './SideNav';
import { useAuth } from '../auth/AuthProvider';

export default function Layout() {
  const { user, logout } = useAuth();
  const [isNavCollapsed, setNavCollapsed] = useState(true);

  return (
    <>
      <Header items={[]} username={user?.username} onLogout={logout} />
      <div className={`app-shell${isNavCollapsed ? ' app-shell--nav-collapsed' : ''}`}>
        <SideNav
          collapsed={isNavCollapsed}
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
