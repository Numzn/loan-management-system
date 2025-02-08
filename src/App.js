import { BrowserRouter as Router } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <UserProvider>
          <AppRoutes />
        </UserProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App; 