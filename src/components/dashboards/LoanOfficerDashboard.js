import { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import DashboardLayout from '../layout/DashboardLayout';
import {
  Grid, Paper, Typography, Box, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow,
  Button, Chip
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import StatsCard from '../shared/StatsCard';
import LoanDetailsCard from '../shared/LoanDetailsCard';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const menuItems = [
  {
    text: 'Dashboard',
    path: '/officer-dashboard',
    icon: <DashboardIcon />
  },
  {
    text: 'Applications',
    path: '/officer/applications',
    icon: <AssignmentIcon />
  },
  {
    text: 'Clients',
    path: '/officer/clients',
    icon: <PeopleIcon />
  }
];

export default function LoanOfficerDashboard() {
  const [loading, setLoading] = useState(true);
  const [recentApplications, setRecentApplications] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    underReview: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const applicationsQuery = query(
          collection(db, 'loanApplications'),
          orderBy('createdAt', 'desc'),
          where('status', 'in', ['submitted', 'under_review'])
        );
        
        const snapshot = await getDocs(applicationsQuery);
        const applications = [];
        let statsCount = {
          pending: 0,
          underReview: 0,
          approved: 0,
          rejected: 0
        };

        snapshot.forEach(doc => {
          const data = doc.data();
          applications.push({ id: doc.id, ...data });
          
          switch (data.status) {
            case 'submitted':
              statsCount.pending++;
              break;
            case 'under_review':
              statsCount.underReview++;
              break;
            case 'approved':
              statsCount.approved++;
              break;
            case 'rejected':
              statsCount.rejected++;
              break;
            default:
              break;
          }
        });

        setRecentApplications(applications.slice(0, 5));
        setStats(statsCount);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusChip = (status) => {
    const statusColors = {
      submitted: 'primary',
      under_review: 'warning',
      approved: 'success',
      rejected: 'error'
    };

    return (
      <Chip
        label={status.replace('_', ' ').toUpperCase()}
        color={statusColors[status] || 'default'}
        size="small"
      />
    );
  };

  return (
    <DashboardLayout title="Loan Officer Dashboard" menuItems={menuItems}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Pending Applications"
              value={stats.pending}
              icon={PendingActionsIcon}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Under Review"
              value={stats.underReview}
              icon={AssignmentIcon}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Approved"
              value={stats.approved}
              icon={CheckCircleIcon}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Rejected"
              value={stats.rejected}
              icon={CancelIcon}
              color="error"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Recent Applications
            </Typography>
            <Grid container spacing={2}>
              {recentApplications.map((application) => (
                <Grid item xs={12} key={application.id}>
                  <LoanDetailsCard
                    loan={application}
                    onAction={(loan) => navigate(`/officer/applications/${loan.id}`)}
                    actionLabel="Review Application"
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      )}
    </DashboardLayout>
  );
} 