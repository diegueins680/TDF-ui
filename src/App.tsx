
import { Route, Routes, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PartiesPage from './pages/PartiesPage';
import BookingsPage from './pages/BookingsPage';
import PipelinesPage from './pages/PipelinesPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/parties" replace />} />
        <Route path="/parties" element={<PartiesPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/pipelines" element={<PipelinesPage />} />
      </Routes>
    </Layout>
  );
}
