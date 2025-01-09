import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Box, CssBaseline, IconButton, Button, Stack } from '@mui/material';
import { Brightness4, Brightness7, Person } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { useState, useMemo, createContext } from 'react';
import { lightTheme, darkThemeWithCommon } from './theme';
import LandingPage from './components/pages/LandingPage';
import LoanCalculator from './components/loan/LoanCalculator';
import LoanDetailsForm from './components/loan/LoanDetailsForm';
import LoanSpecificDetailsForm from './components/loan/LoanSpecificDetailsForm';
import LoanDocuments from './components/loan/LoanDocuments';
import LoanReview from './components/loan/LoanReview';
import ClientDashboard from './components/dashboards/ClientDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

function App() {
  const [mode, setMode] = useState('light');
  
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = useMemo(
    () => mode === 'light' ? lightTheme : darkThemeWithCommon,
    [mode],
  );

  const handleLogin = () => {
    // Navigate to login page or open login modal
    console.log('Login clicked');
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary>
          <BrowserRouter>
            <Box sx={{ 
              bgcolor: 'background.default', 
              minHeight: '100vh',
              position: 'relative'
            }}>
              {/* Theme toggle and Login buttons */}
              <Stack 
                direction="row" 
                spacing={2} 
                sx={{ 
                  position: 'fixed', 
                  top: 16, 
                  right: 16, 
                  zIndex: 1100 
                }}
              >
                <IconButton
                  onClick={colorMode.toggleColorMode}
                  color="inherit"
                  sx={{ 
                    bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
                    '&:hover': {
                      bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
                    }
                  }}
                >
                  {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                </IconButton>
                <Button
                  variant="contained"
                  startIcon={<Person />}
                  onClick={handleLogin}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 500,
                    boxShadow: 2,
                    '&:hover': {
                      boxShadow: 4,
                    }
                  }}
                >
                  Login
                </Button>
              </Stack>
              
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/calculator" element={<LoanCalculator />} />
                <Route path="/calculator/:loanType" element={<LoanCalculator />} />
                <Route path="/loan-details" element={<LoanDetailsForm />} />
                <Route path="/loan-specific-details" element={<LoanSpecificDetailsForm />} />
                <Route path="/loan-documents" element={<LoanDocuments />} />
                <Route path="/loan-review" element={<LoanReview />} />
                <Route path="/dashboard" element={<ClientDashboard />} />
              </Routes>
            </Box>
          </BrowserRouter>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={mode}
          />
        </ErrorBoundary>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App; 