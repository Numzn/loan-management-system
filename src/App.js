import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { UserProvider } from './contexts/UserContext';
import { theme } from './theme/theme';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <UserProvider>
        <Router>
          <AppRoutes />
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App; 