import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.profile?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}; 