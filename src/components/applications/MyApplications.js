import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DashboardLayout from '../layout/DashboardLayout';
import {
  Box,
  Typography,
  CircularProgress,
  Paper
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';

const menuItems = [
  {
    text: 'My Applications',
    path: '/applications',
    icon: <DescriptionIcon />
  }
];

export default function MyApplications() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    // Fetch user's applications
    const fetchApplications = async () => {
      try {
        // TODO: Implement applications fetching
        setApplications([]);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  return (
    <DashboardLayout title="My Applications" menuItems={menuItems}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Your Loan Applications
          </Typography>
          {applications.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              No applications found
            </Typography>
          ) : (
            // TODO: Add applications list
            <Typography>Applications will be displayed here</Typography>
          )}
        </Paper>
      )}
    </DashboardLayout>
  );
} 