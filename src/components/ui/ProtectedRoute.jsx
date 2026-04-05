import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * JWT-aware route guard.
 * - Not authenticated → /login
 * - Wrong role       → correct dashboard for their actual role
 */
export default function ProtectedRoute({ element, requiredRole }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requiredRole && user?.role?.toUpperCase() !== requiredRole.toUpperCase()) {
    const fallback = user?.role?.toUpperCase() === 'ADMIN'
      ? '/admin/dashboard'
      : '/student/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return element;
}
