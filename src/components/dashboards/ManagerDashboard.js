import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import DashboardLayout from '../layout/DashboardLayout';
import {
  Grid, Typography, Box, CircularProgress,
  List, ListItem
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupIcon from '@mui/icons-material/Group';
import TimelineIcon from '@mui/icons-material/Timeline';
import StatsCard from '../shared/StatsCard';
import LoanDetailsCard from '../shared/LoanDetailsCard';

const menuItems = [
  {
    text: 'Dashboard',
    path: '/manager-dashboard',
    icon: <DashboardIcon />
  },
  {
    text: 'Team Performance',
    path: '/manager/team',
    icon: <SupervisorAccountIcon />
  },
  {
    text: 'Reports',
    path: '/manager/reports',
    icon: <AssessmentIcon />
  }
];

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApproval: 0,
    approvedToday: 0,
    totalAmount: 0
  });
  const [teamPerformance, setTeamPerformance] = useState([]);
  const [recentEscalations, setRecentEscalations] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch team performance
        const performanceQuery = query(
          collection(db, 'loanOfficers'),
          orderBy('approvalRate', 'desc')
        );
        
        const performanceSnapshot = await getDocs(performanceQuery);
        const performance = performanceSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setTeamPerformance(performance);

        // Fetch recent escalations
        const escalationsQuery = query(
          collection(db, 'loanApplications'),
          where('status', '==', 'escalated'),
          orderBy('updatedAt', 'desc')
        );
        
        const escalationsSnapshot = await getDocs(escalationsQuery);
        const escalations = escalationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setRecentEscalations(escalations.slice(0, 5));

        // Calculate stats
        setStats({
          totalApplications: performance.reduce((acc, curr) => acc + curr.totalApplications, 0),
          pendingApproval: escalations.length,
          approvedToday: performance.reduce((acc, curr) => acc + curr.approvedToday, 0),
          totalAmount: performance.reduce((acc, curr) => acc + curr.totalAmount, 0)
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout title="Manager Dashboard" menuItems={menuItems}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Applications"
              value={stats.totalApplications}
              previousValue={stats.lastMonthApplications}
              icon={AssessmentIcon}
              color="primary"
              format="number"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Pending Approval"
              value={stats.pendingApproval}
              icon={TimelineIcon}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Approved Today"
              value={stats.approvedToday}
              icon={SupervisorAccountIcon}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Team Performance"
              value={stats.teamPerformance}
              format="percentage"
              icon={GroupIcon}
              color="info"
            />
          </Grid>

          {/* Team Performance Chart */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Team Performance
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="approvalRate" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Recent Escalations */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Recent Escalations
            </Typography>
            <Grid container spacing={2}>
              {recentEscalations.map((escalation) => (
                <Grid item xs={12} key={escalation.id}>
                  <LoanDetailsCard
                    loan={escalation}
                    onAction={(loan) => navigate(`/manager/applications/${loan.id}`)}
                    actionLabel="Review Escalation"
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