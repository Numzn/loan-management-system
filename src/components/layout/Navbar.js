import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <AppBar position="fixed" color="primary">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Loan Management System
        </Typography>
        <Box>
          <Button 
            color="inherit" 
            startIcon={<LoginIcon />}
            onClick={() => navigate('/login')}
          >
            Existing User Login
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}