import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  Tooltip,
  styled,
  alpha
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  ExitToApp as LogoutIcon,
  AccountBalance as LoanIcon
} from '@mui/icons-material';
import { useUser } from '../../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;
const collapsedDrawerWidth = 0;
const hoverWidth = 60;

// Modern gradient background
const MainBackground = styled(Box)({
  background: 'linear-gradient(135deg, #1a1a1a 0%, #2d3436 100%)',
  minHeight: '100vh',
  width: '100%',
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: -1
});

const HoverArea = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: hoverWidth,
  height: '100%',
  zIndex: 1200,
  '&:hover + .MuiDrawer-root': {
    '& .MuiDrawer-paper': {
      width: hoverWidth,
      backgroundColor: alpha('#000000', 0.9),
      boxShadow: '4px 0 15px rgba(0,0,0,0.3)',
    }
  }
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: collapsedDrawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  '& .MuiDrawer-paper': {
    width: collapsedDrawerWidth,
    backgroundColor: 'transparent',
    color: '#ffffff',
    border: 'none',
    transition: theme.transitions.create('all', {
      easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
    '&:hover': {
      width: hoverWidth,
      backgroundColor: alpha('#000000', 0.9),
      boxShadow: '4px 0 15px rgba(0,0,0,0.3)',
    }
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  padding: theme.spacing(1.5),
  justifyContent: 'center',
  '&:hover': {
    backgroundColor: alpha('#ffffff', 0.1),
    borderRadius: '50%',
    transform: 'scale(1.1)',
    transition: 'all 0.3s ease',
  },
}));

const StyledListItemIcon = styled(ListItemIcon)({
  color: '#ffffff',
  minWidth: 'auto',
  justifyContent: 'center',
  '& svg': {
    fontSize: 24,
    transition: 'all 0.3s ease',
  },
  '&:hover svg': {
    transform: 'scale(1.1)',
  }
});

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: alpha('#000000', 0.6),
  backdropFilter: 'blur(8px)',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  boxShadow: 'none',
}));

const DashboardLayout = ({ children }) => {
  const { user, mockLogout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    mockLogout();
    navigate('/');
  };

  const getMenuItems = () => {
    const basePaths = {
      loan_officer: '/management/loan-officer',
      manager: '/management/manager',
      director: '/management/director',
      finance_officer: '/management/finance'
    };

    const commonItems = [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '' },
      { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
      { text: 'Reports', icon: <AssessmentIcon />, path: '/reports' },
      { text: 'Loans', icon: <LoanIcon />, path: '/loans' }
    ];

    return commonItems.map(item => ({
      ...item,
      path: `${basePaths[user?.role]}${item.path}`
    }));
  };

  const drawer = (
    <Box sx={{ mt: 8 }}>
      <List>
        {getMenuItems().map((item) => (
          <Tooltip 
            key={item.text} 
            title={item.text}
            placement="right"
            arrow
          >
            <StyledListItem
              onClick={() => navigate(item.path)}
            >
              <StyledListItemIcon>
                {item.icon}
              </StyledListItemIcon>
            </StyledListItem>
          </Tooltip>
        ))}
        <Tooltip title="Logout" placement="right" arrow>
          <StyledListItem onClick={handleLogout}>
            <StyledListItemIcon>
              <LogoutIcon />
            </StyledListItemIcon>
          </StyledListItem>
        </Tooltip>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <MainBackground />
      <StyledAppBar position="fixed">
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              color: '#fff',
              fontWeight: 500,
              letterSpacing: '0.5px'
            }}
          >
            {user?.role?.replace('_', ' ').toUpperCase()} Dashboard
          </Typography>
        </Toolbar>
      </StyledAppBar>

      <HoverArea />
      <StyledDrawer variant="permanent">
        {drawer}
      </StyledDrawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          minHeight: '100vh',
          mt: '64px',
          position: 'relative',
          zIndex: 1,
          '& .MuiPaper-root': {
            backgroundColor: alpha('#ffffff', 0.05),
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
          },
          '& .MuiTypography-root': {
            color: '#fff',
          },
          '& .MuiTypography-colorTextSecondary': {
            color: alpha('#fff', 0.7),
          },
          '& .MuiLinearProgress-root': {
            backgroundColor: alpha('#ffffff', 0.1),
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#4CAF50',
            }
          },
          '& .MuiChip-root': {
            backgroundColor: alpha('#ffffff', 0.1),
            color: '#fff',
            '&.MuiChip-colorWarning': {
              backgroundColor: alpha('#ff9800', 0.2),
              color: '#ff9800',
            },
            '&.MuiChip-colorInfo': {
              backgroundColor: alpha('#2196f3', 0.2),
              color: '#2196f3',
            },
          }
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout; 