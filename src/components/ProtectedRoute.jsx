import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './ui/LoadingSpinner';

export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner fullPage />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'owner' ? '/owner/dashboard' : '/'} replace />;
  }
  return <Outlet />;
}
