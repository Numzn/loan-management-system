import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { useUser } from '../../contexts/UserContext';
import '../../styles/MockLoginPage.css';
import SupabaseTest from '../SupabaseTest';
import DatabaseInspector from '../DatabaseInspector';

const MockLoginPage = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setUser } = useUser();

  // Map of roles to their dashboard paths
  const roleDashboardPaths = {
    'loan_officer': '/management/loan-officer',
    'manager': '/management/manager',
    'director': '/management/director',
    'finance_officer': '/management/finance'
  };

  const handleLogin = async (email) => {
    try {
      const { user, error } = await authService.login(email, 'password123');
      
      if (error) {
        setError(error);
        return;
      }
      
      if (user) {
        setUser(user);
        // Navigate to the correct dashboard based on user role
        const dashboardPath = roleDashboardPaths[user.role];
        if (dashboardPath) {
          navigate(dashboardPath);
        } else {
          setError('Invalid user role');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className="mock-login-container">
      <h2>Mock Login</h2>
      <p>Select a role to login as:</p>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <SupabaseTest />
      <DatabaseInspector />

      <div className="button-container">
        <button 
          className="login-button loan-officer"
          onClick={() => handleLogin('loan.officer@example.com')}
        >
          LOGIN AS LOAN OFFICER
        </button>
        
        <button 
          className="login-button manager"
          onClick={() => handleLogin('manager@example.com')}
        >
          LOGIN AS MANAGER
        </button>
        
        <button 
          className="login-button director"
          onClick={() => handleLogin('director@example.com')}
        >
          LOGIN AS DIRECTOR
        </button>

        <button 
          className="login-button finance"
          onClick={() => handleLogin('finance.officer@example.com')}
        >
          LOGIN AS FINANCE OFFICER
        </button>
      </div>
    </div>
  );
};

export default MockLoginPage; 