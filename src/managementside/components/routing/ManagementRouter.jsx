import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '../../../contexts/UserContext';
import { Box, CircularProgress, Button, Typography, Paper } from '@mui/material';
import LoanOfficerDashboard from '../../pages/LoanOfficerDashboard';
import ManagerDashboard from '../../pages/ManagerDashboard';
import DirectorDashboard from '../../pages/DirectorDashboard';
import FinanceOfficerDashboard from '../../pages/FinanceOfficerDashboard';
import DashboardLayout from '../layout/DashboardLayout';

// Mock Login Component
const MockLoginPage = () => {
  const { mockLogin } = useUser();

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default'
      }}
    >
      <Paper 
        elevation={3}
        sx={{ 
          p: 4,
          maxWidth: 400,
          width: '100%',
          mx: 2,
          textAlign: 'center'
        }}
      >
        <Typography variant="h5" gutterBottom>
          Mock Login
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
          Select a role to login as:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button 
            variant="contained" 
            onClick={() => mockLogin('loan_officer')}
            sx={{ bgcolor: '#1976d2' }}
          >
            Login as Loan Officer
          </Button>
          <Button 
            variant="contained" 
            onClick={() => mockLogin('manager')}
            sx={{ bgcolor: '#2e7d32' }}
          >
            Login as Manager
          </Button>
          <Button 
            variant="contained" 
            onClick={() => mockLogin('director')}
            sx={{ bgcolor: '#d32f2f' }}
          >
            Login as Director
          </Button>
          <Button 
            variant="contained" 
            onClick={() => mockLogin('finance_officer')}
            sx={{ bgcolor: '#ed6c02' }}
          >
            Login as Finance Officer
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

// Protected Route Component for Management
const ProtectedManagementRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useUser();

  // Show loading state within the layout
  if (loading) {
    return (
      <DashboardLayout>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: 'calc(100vh - 64px)', // Account for navbar height
            backgroundColor: 'background.default'
          }}
        >
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  // If no user, show mock login
  if (!user) {
    return <MockLoginPage />;
  }

  // If wrong role, redirect to home
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

const ManagementRouter = () => {
  return (
    <Routes>
      {/* Protected Management Routes */}
      <Route
        path="/loan-officer/*"
        element={
          <ProtectedManagementRoute allowedRoles={['loan_officer']}>
            <LoanOfficerDashboard />
          </ProtectedManagementRoute>
        }
      />

      <Route
        path="/manager/*"
        element={
          <ProtectedManagementRoute allowedRoles={['manager']}>
            <ManagerDashboard />
          </ProtectedManagementRoute>
        }
      />

      <Route
        path="/director/*"
        element={
          <ProtectedManagementRoute allowedRoles={['director']}>
            <DirectorDashboard />
          </ProtectedManagementRoute>
        }
      />

      <Route
        path="/finance/*"
        element={
          <ProtectedManagementRoute allowedRoles={['finance_officer']}>
            <FinanceOfficerDashboard />
          </ProtectedManagementRoute>
        }
      />

      {/* Show mock login for /login route */}
      <Route path="/login" element={<MockLoginPage />} />

      {/* Redirect all unmatched management routes to landing page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default ManagementRouter; 