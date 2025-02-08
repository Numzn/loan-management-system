import { styled } from '@mui/material/styles';
import { Box, Button, Card, Paper, TextField } from '@mui/material';

// Shared styled components for the entire system
export const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(3),
}));

export const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '16px',
  boxShadow: '0px 4px 20px rgba(0,0,0,0.1)',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

export const PrimaryButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#fd7c07',
  color: '#ffffff',
  borderRadius: '25px',
  padding: '12px 32px',
  '&:hover': {
    backgroundColor: '#e66e06',
  },
}));

export const SecondaryButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#002044',
  color: '#ffffff',
  borderRadius: '25px',
  padding: '12px 32px',
  '&:hover': {
    backgroundColor: '#001830',
  },
}));

export const OutlinedButton = styled(Button)(({ theme }) => ({
  color: '#002044',
  borderColor: '#002044',
  borderRadius: '25px',
  padding: '12px 32px',
  '&:hover': {
    borderColor: '#001830',
    backgroundColor: 'rgba(0, 32, 68, 0.04)',
  },
}));

export const FormCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '16px',
  boxShadow: '0px 4px 20px rgba(0,0,0,0.1)',
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    '&.Mui-focused fieldset': {
      borderColor: '#fd7c07',
    },
  },
  '& label.Mui-focused': {
    color: '#fd7c07',
  },
}));

export const GradientBackground = styled(Box)(({ theme }) => ({
  background: `linear-gradient(45deg, #002044 30%, #fd7c07 90%)`,
  color: '#ffffff',
}));

export const DashboardCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: '16px',
  boxShadow: '0px 4px 20px rgba(0,0,0,0.1)',
  padding: theme.spacing(3),
}));

export const TableContainer = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0px 4px 20px rgba(0,0,0,0.1)',
  overflow: 'hidden',
  '& .MuiDataGrid-root': {
    border: 'none',
  },
}));

// Animation variants for framer-motion
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6
    }
  }
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
}; 