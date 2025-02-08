import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoanOfficerDashboard from '../../pages/LoanOfficerDashboard';
import ManagerDashboard from '../../pages/ManagerDashboard';
import DirectorDashboard from '../../pages/DirectorDashboard';
import FinanceOfficerDashboard from '../../pages/FinanceOfficerDashboard';
import ActiveLoans from '../../pages/ActiveLoans';
import DashboardLayout from '../layout/DashboardLayout';
import { useManagementAuth } from '../../context/AuthContext';

const roleRoutes = {
  LOAN_OFFICER: [
    { path: 'applications', element: <LoanOfficerDashboard /> },
    { path: 'active-loans', element: <ActiveLoans /> },
  ],
  MANAGER: [
    { path: 'review', element: <ManagerDashboard /> },
    { path: 'active-loans', element: <ActiveLoans /> },
  ],
  DIRECTOR: [
    { path: 'approval', element: <DirectorDashboard /> },
    { path: 'active-loans', element: <ActiveLoans /> },
  ],
  FINANCE_OFFICER: [
    { path: 'disbursement', element: <FinanceOfficerDashboard /> },
    { path: 'active-loans', element: <ActiveLoans /> },
  ],
};

const DashboardRouter = () => {
  const { currentUser } = useManagementAuth();
  const routes = currentUser ? roleRoutes[currentUser.role] || [] : [];

  // Redirect to home if not authenticated
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <DashboardLayout>
      <Routes>
        {routes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
        <Route
          path="*"
          element={<Navigate to={routes[0]?.path || '/'} replace />}
        />
      </Routes>
    </DashboardLayout>
  );
};

export default DashboardRouter; 