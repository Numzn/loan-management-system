import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from '../components/layout/Navbar';
import LandingPage from '../components/pages/LandingPage';
import LoanCalculator from '../components/loan/LoanCalculator';
import LoanDetailsForm from '../components/loan/LoanDetailsForm';
import LoanSpecificDetailsForm from '../components/loan/LoanSpecificDetailsForm';
import DocumentUpload from '../components/loan/DocumentUpload';
import LoanReview from '../components/loan/LoanReview';
import ApplicationSuccess from '../components/pages/ApplicationSuccess';
import ClientDashboard from '../components/dashboards/ClientDashboard';
import ManagementRouter from '../managementside/components/routing/ManagementRouter';
import MockLoginPage from '../components/pages/MockLoginPage';

// Public Route with Navbar
const PublicRoute = ({ children }) => {
  return (
    <>
      <Navbar />
      <Box sx={{ pt: '64px' }}>
        {children}
      </Box>
    </>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Management Routes */}
      <Route path="/management/*" element={<ManagementRouter />} />

      {/* Mock Login Route */}
      <Route path="/login" element={<MockLoginPage />} />

      {/* Public routes */}
      <Route 
        path="/" 
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        } 
      />
      
      {/* Loan Application Flow Routes */}
      <Route 
        path="/calculator/:loanType?" 
        element={
          <PublicRoute>
            <LoanCalculator />
          </PublicRoute>
        } 
      />

      <Route
        path="/loan-details"
        element={
          <PublicRoute>
            <LoanDetailsForm />
          </PublicRoute>
        }
      />

      <Route
        path="/loan-specific-details"
        element={
          <PublicRoute>
            <LoanSpecificDetailsForm />
          </PublicRoute>
        }
      />

      <Route
        path="/document-upload"
        element={
          <PublicRoute>
            <DocumentUpload />
          </PublicRoute>
        }
      />

      <Route
        path="/loan-review"
        element={
          <PublicRoute>
            <LoanReview />
          </PublicRoute>
        }
      />

      <Route
        path="/application-success"
        element={
          <PublicRoute>
            <ApplicationSuccess />
          </PublicRoute>
        }
      />

      {/* Client Dashboard Route */}
      <Route
        path="/client-dashboard"
        element={
          <PublicRoute>
            <ClientDashboard />
          </PublicRoute>
        }
      />

      {/* Catch all unmatched routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes; 