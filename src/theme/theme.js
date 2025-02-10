import { createTheme } from '@mui/material/styles';
import { colors } from './colors';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.primary.main,
      light: colors.primary.light,
      dark: colors.primary.dark,
      contrastText: '#fff',
    },
    secondary: {
      main: colors.secondary.main,
      light: colors.secondary.light,
      dark: colors.secondary.dark,
      contrastText: '#fff',
    },
    error: {
      main: colors.error.main,
      light: colors.error.light,
      dark: colors.error.dark,
      contrastText: '#fff',
    },
    warning: {
      main: colors.warning.main,
      light: colors.warning.light,
      dark: colors.warning.dark,
      contrastText: '#fff',
    },
    info: {
      main: colors.info.main,
      light: colors.info.light,
      dark: colors.info.dark,
      contrastText: '#fff',
    },
    success: {
      main: colors.success.main,
      light: colors.success.light,
      dark: colors.success.dark,
      contrastText: '#fff',
    },
    background: {
      default: colors.background.default,
      paper: colors.background.paper,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
    },
  },
  typography: {
    fontFamily: [
      'Poppins',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
    h1: {
      fontWeight: 700,
      fontSize: '3.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '3rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '2.5rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '25px',
          padding: '8px 24px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0px 4px 20px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
        colorPrimary: {
          backgroundColor: `${colors.primary.main}20`,
          color: colors.primary.main,
        },
        colorSecondary: {
          backgroundColor: `${colors.secondary.main}20`,
          color: colors.secondary.main,
        },
        colorError: {
          backgroundColor: `${colors.error.main}20`,
          color: colors.error.main,
        },
        colorWarning: {
          backgroundColor: `${colors.warning.main}20`,
          color: colors.warning.main,
        },
        colorInfo: {
          backgroundColor: `${colors.info.main}20`,
          color: colors.info.main,
        },
        colorSuccess: {
          backgroundColor: `${colors.success.main}20`,
          color: colors.success.main,
        },
      },
    },
  },
});

export default theme; 