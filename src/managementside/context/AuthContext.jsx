import React, { createContext, useContext, useState } from 'react';
import { toast } from 'react-toastify';

const ManagementAuthContext = createContext(null);

const roles = {
  LOAN_OFFICER: 'LOAN_OFFICER',
  MANAGER: 'MANAGER',
  DIRECTOR: 'DIRECTOR',
  FINANCE_OFFICER: 'FINANCE_OFFICER',
};

export const ManagementAuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual Firebase authentication
      // Mock authentication for now
      const mockUsers = {
        'loanofficer@example.com': { role: roles.LOAN_OFFICER, name: 'John Loan' },
        'manager@example.com': { role: roles.MANAGER, name: 'Jane Manager' },
        'director@example.com': { role: roles.DIRECTOR, name: 'Bob Director' },
        'finance@example.com': { role: roles.FINANCE_OFFICER, name: 'Alice Finance' },
      };

      if (mockUsers[email] && password === 'password') {
        const user = {
          email,
          ...mockUsers[email],
        };
        setCurrentUser(user);
        toast.success(`Welcome back, ${user.name}!`);
        return user;
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // TODO: Replace with actual Firebase logout
      setCurrentUser(null);
      toast.success('Logged out successfully');
    } catch (err) {
      toast.error('Failed to logout');
      throw err;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    roles,
  };

  return (
    <ManagementAuthContext.Provider value={value}>
      {children}
    </ManagementAuthContext.Provider>
  );
};

export const useManagementAuth = () => {
  const context = useContext(ManagementAuthContext);
  if (!context) {
    throw new Error('useManagementAuth must be used within a ManagementAuthProvider');
  }
  return context;
};

export default ManagementAuthContext; 