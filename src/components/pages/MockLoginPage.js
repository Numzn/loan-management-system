import React, { useState } from 'react';
import { Box, Button, Container, Typography, Paper, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

const MockLoginPage = () => {
  const navigate = useNavigate();
  const { mockLogin } = useUser();
  const [error, setError] = useState('');

  const handleLogin = async (role) => {
    try {
      const result = await mockLogin(role);
      if (result.success) {
        // Map roles to their correct paths
        const rolePaths = {
          loan_officer: '/management/loan-officer',
          manager: '/management/manager',
          director: '/management/director',
          finance_officer: '/management/finance'
        };
        
        // Navigate to the appropriate dashboard
        navigate(rolePaths[role]);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper sx={{ p: 4, width: '100%' }}>
          <Typography variant="h4" align="center" gutterBottom>
            Mock Login
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 4 }}>
            Select a role to login as:
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button 
              variant="contained" 
              fullWidth
              onClick={() => handleLogin('loan_officer')}
              sx={{ bgcolor: '#2196f3', '&:hover': { bgcolor: '#1976d2' } }}
            >
              Login as Loan Officer
            </Button>
            
            <Button 
              variant="contained" 
              fullWidth
              onClick={() => handleLogin('manager')}
              sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
            >
              Login as Manager
            </Button>
            
            <Button 
              variant="contained" 
              fullWidth
              onClick={() => handleLogin('director')}
              sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}
            >
              Login as Director
            </Button>
            
            <Button 
              variant="contained" 
              fullWidth
              onClick={() => handleLogin('finance_officer')}
              sx={{ bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00' } }}
            >
              Login as Finance Officer
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default MockLoginPage; 