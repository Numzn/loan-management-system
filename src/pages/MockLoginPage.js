import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Button,
  Typography,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack
} from '@mui/material';
import { Dashboard } from '@mui/icons-material';

const DASHBOARD_OPTIONS = [
  {
    label: 'Loan Officer Dashboard',
    value: '/management/loan-officer',
    role: 'loan_officer'
  },
  {
    label: 'Manager Dashboard',
    value: '/management/manager',
    role: 'manager'
  },
  {
    label: 'Director Dashboard',
    value: '/management/director',
    role: 'director'
  },
  {
    label: 'Finance Officer Dashboard',
    value: '/management/finance',
    role: 'finance_officer'
  },
  {
    label: 'Client Dashboard',
    value: '/client/dashboard',
    role: 'client'
  }
];

const LoginPage = () => {
  const navigate = useNavigate();
  const [selectedDashboard, setSelectedDashboard] = useState('');

  const handleLogin = () => {
    if (!selectedDashboard) return;

    const dashboard = DASHBOARD_OPTIONS.find(opt => opt.value === selectedDashboard);
    if (dashboard) {
      // Store mock user data
      const userData = {
        email: `${dashboard.role}@example.com`,
        role: dashboard.role,
        name: `Mock ${dashboard.role.replace('_', ' ')}`.toUpperCase()
      };
      sessionStorage.setItem('managementUser', JSON.stringify(userData));
      
      // Navigate to selected dashboard
      navigate(selectedDashboard);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4,
          background: 'linear-gradient(to bottom right, #ffffff, #f5f5f5)'
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Dashboard sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Quick Access Login
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Select a dashboard to continue
          </Typography>
        </Box>

        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel>Select Dashboard</InputLabel>
            <Select
              value={selectedDashboard}
              onChange={(e) => setSelectedDashboard(e.target.value)}
              label="Select Dashboard"
            >
              {DASHBOARD_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleLogin}
            disabled={!selectedDashboard}
            sx={{ 
              py: 1.5,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #1CA7D2 90%)',
              }
            }}
          >
            Access Dashboard
          </Button>
        </Stack>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            This is a development environment with unrestricted access.
            <br />
            Security measures will be implemented in production.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage; 