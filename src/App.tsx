import { Route, Routes, Navigate, Outlet, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import PartiesPage from './pages/PartiesPage';
import BookingsPage from './pages/BookingsPage';
import PipelinesPage from './pages/PipelinesPage';
import SessionsPage from './pages/SessionsPage';
import TeachersPage from './pages/TeachersPage';
import LessonsPage from './pages/LessonsPage';
import TrialLessonsPage from './pages/TrialLessonsPage';
import RoomsPage from './pages/RoomsPage';
import PackagesPage from './pages/PackagesPage';
import InvoicesPage from './pages/InvoicesPage';
import InventoryPage from './pages/InventoryPage';
import AdminConsolePage from './pages/AdminConsolePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/public/SignupPage';
import TrialRequestPage from './pages/public/TrialRequestPage';
import TrialQueuePage from './pages/trials/TrialQueuePage';
import StudentProfilePage from './pages/students/StudentProfilePage';
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
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/trial" element={<TrialRequestPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/parties" replace />} />
            <Route path="/parties" element={<PartiesPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/sessions" element={<SessionsPage />} />
            <Route path="/teachers" element={<TeachersPage />} />
            <Route path="/lessons" element={<LessonsPage />} />
            <Route path="/trials" element={<TrialLessonsPage />} />
            <Route path="/trials/queue" element={<TrialQueuePage />} />
            <Route path="/students/:id" element={<StudentProfilePage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/pipelines" element={<PipelinesPage />} />
            <Route path="/packages" element={<PackagesPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/admin" element={<AdminConsolePage />} />
            <Route path="*" element={<Navigate to="/parties" replace />} />
          </Route>
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}
