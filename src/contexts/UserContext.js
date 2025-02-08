import { createContext, useContext, useState } from 'react';
import { supabase } from '../config/supabaseClient';

const UserContext = createContext();

// Mock user data with roles and permissions
const MOCK_USERS = {
  loan_officer: {
    id: '1',
    email: 'loan.officer@example.com',
    role: 'loan_officer',
    name: 'John Wilson',
    permissions: ['view_applications', 'review_applications']
  },
  manager: {
    id: '2',
    email: 'manager@example.com',
    role: 'manager',
    name: 'Jane Smith',
    permissions: ['approve_loans', 'view_reports', 'manage_officers']
  },
  director: {
    id: '3',
    email: 'director@example.com',
    role: 'director',
    name: 'Robert Johnson',
    permissions: ['view_all', 'approve_high_value', 'manage_all']
  },
  finance_officer: {
    id: '4',
    email: 'finance@example.com',
    role: 'finance_officer',
    name: 'Mary Wilson',
    permissions: ['manage_disbursements', 'view_collections']
  }
};

export function UserProvider({ children }) {
  // Try to get stored user from localStorage
  const storedUser = localStorage.getItem('mock_user');
  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);
  const [loading, setLoading] = useState(false);

  const mockLogin = async (role) => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockUser = MOCK_USERS[role];
      if (!mockUser) {
        throw new Error('Invalid role');
      }
      
      setUser(mockUser);
      // Store user in localStorage
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      
      return { success: true };
    } catch (error) {
      console.error('Mock login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const mockLogout = async () => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUser(null);
      // Clear stored user
      localStorage.removeItem('mock_user');
      
      // Simulate Supabase signout
      await supabase.auth.signOut?.();
    } catch (error) {
      console.error('Mock logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) || false;
  };

  // Check if user has any of the specified roles
  const hasRole = (roles) => {
    if (!user) return false;
    if (typeof roles === 'string') return user.role === roles;
    return roles.includes(user.role);
  };

  const value = {
    user,
    loading,
    mockLogin,
    mockLogout,
    hasPermission,
    hasRole
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};