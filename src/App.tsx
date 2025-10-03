
import { Route, Routes, Navigate, Outlet, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import PartiesPage from './pages/PartiesPage';
import BookingsPage from './pages/BookingsPage';
import PipelinesPage from './pages/PipelinesPage';
import LoginPage from './pages/LoginPage';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './auth/AuthProvider';

function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/parties" replace />} />
            <Route path="/parties" element={<PartiesPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/pipelines" element={<PipelinesPage />} />
          </Route>
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
