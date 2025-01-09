import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DashboardLayout from '../layout/DashboardLayout';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';

const menuItems = [
  {
    text: 'Dashboard',
    path: '/admin',
    icon: <AdminPanelSettingsIcon />
  },
  {
    text: 'Users',
    path: '/admin/users',
    icon: <PeopleIcon />
  },
  {
    text: 'Reports',
    path: '/admin/reports',
    icon: <AssessmentIcon />
  }
];

export default function AdminPanel() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLoans: 0,
    activeLoans: 0
  });

  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    // Fetch admin stats here
    const fetchStats = async () => {
      try {
        // TODO: Implement stats fetching
        setStats({
          totalUsers: 0,
          totalLoans: 0,
          activeLoans: 0
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (!user || user.role !== 'ADMIN') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Access Denied</Typography>
      </Box>
    );
  }

  return (
    <DashboardLayout title="Admin Dashboard" menuItems={menuItems}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
              <Typography color="textSecondary" gutterBottom>
                Total Users
              </Typography>
              <Typography component="p" variant="h4">
                {stats.totalUsers}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
              <Typography color="textSecondary" gutterBottom>
                Total Loans
              </Typography>
              <Typography component="p" variant="h4">
                {stats.totalLoans}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
              <Typography color="textSecondary" gutterBottom>
                Active Loans
              </Typography>
              <Typography component="p" variant="h4">
                {stats.activeLoans}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Typography variant="body2" color="textSecondary">
                No recent activity to display
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </DashboardLayout>
  );
} 