import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useUser } from '../../contexts/UserContext';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: '#002044',
  boxShadow: 'none',
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: '#ffffff',
  marginLeft: theme.spacing(2),
  borderRadius: '25px',
  padding: '8px 20px',
  '&:hover': {
    backgroundColor: 'rgba(253, 124, 7, 0.1)',
  },
}));

const ApplyNowButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#fd7c07',
  color: '#ffffff',
  marginLeft: theme.spacing(2),
  borderRadius: '25px',
  padding: '8px 20px',
  '&:hover': {
    backgroundColor: '#e66e06',
  },
}));

const Navbar = () => {
  const navigate = useNavigate();
  const { user, signOut } = useUser();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path, state = null) => {
    navigate(path, { state });
    handleClose();
  };

  const handleApplyNow = () => {
    handleNavigation('/calculator', {
      isApplicationFlow: true,
      step: 1,
      totalSteps: 7
    });
  };

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'Loan Calculator', path: '/calculator' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <StyledAppBar position="fixed">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={motion.div}
            whileHover={{ scale: 1.05 }}
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => handleNavigation('/')}
          >
            LOAN SYSTEM
          </Typography>

          {isMobile ? (
            <>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMenu}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {[
                  ...menuItems.map((item) => (
                    <MenuItem
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                    >
                      {item.label}
                    </MenuItem>
                  )),
                  ...(user ? [
                    <MenuItem key="dashboard" onClick={() => handleNavigation('/dashboard')}>
                      Dashboard
                    </MenuItem>,
                    <MenuItem key="logout" onClick={signOut}>
                      Logout
                    </MenuItem>
                  ] : [
                    <MenuItem key="login" onClick={() => handleNavigation('/login')}>
                      Login
                    </MenuItem>,
                    <MenuItem key="apply" onClick={handleApplyNow}>
                      Apply Now
                    </MenuItem>
                  ])
                ]}
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {menuItems.map((item) => (
                <NavButton
                  key={item.path}
                  component={motion.button}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavigation(item.path)}
                >
                  {item.label}
                </NavButton>
              ))}
              {user ? (
                <>
                  <NavButton
                    component={motion.button}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleNavigation('/dashboard')}
                  >
                    Dashboard
                  </NavButton>
                  <NavButton
                    component={motion.button}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={signOut}
                  >
                    Logout
                  </NavButton>
                </>
              ) : (
                <>
                  <NavButton
                    component={motion.button}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleNavigation('/login')}
                  >
                    Login
                  </NavButton>
                  <ApplyNowButton
                    component={motion.button}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleApplyNow}
                  >
                    Apply Now
                  </ApplyNowButton>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </Container>
    </StyledAppBar>
  );
};

export default Navbar;