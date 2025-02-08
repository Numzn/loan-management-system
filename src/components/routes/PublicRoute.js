import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

export default function PublicRoute({ children }) {
  const { user, loading } = useUser();
  const location = useLocation();

  // Check if this is a protected route in the loan application flow
  const isLoanApplicationRoute = location.pathname.includes('loan-') || location.pathname === '/calculator';
  const requiresAuth = isLoanApplicationRoute && location.pathname !== '/calculator';

  if (loading) {
    return null;
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (user && location.pathname === '/auth') {
    // If there's a redirect path in the state, use it
    const { from } = location.state || {};
    return <Navigate to={from || '/dashboard'} state={location.state} replace />;
  }

  // If route requires auth and user is not authenticated, redirect to auth
  if (requiresAuth && !user) {
    return (
      <Navigate 
        to="/auth" 
        state={{ 
          from: location.pathname,
          formData: location.state?.formData 
        }} 
        replace 
      />
    );
  }

  return children;
} 