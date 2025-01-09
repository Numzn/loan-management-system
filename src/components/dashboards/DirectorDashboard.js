import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import DashboardLayout from '../layout/DashboardLayout';
import {
  Grid, Typography, Box, CircularProgress
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ErrorIcon from '@mui/icons-material/Error';
import StatsCard from '../shared/StatsCard';
import LoanDetailsCard from '../shared/LoanDetailsCard';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Paper from '@mui/material/Paper';

const menuItems = [
  {
    text: 'Dashboard',
    path: '/director-dashboard',
    icon: <DashboardIcon />
  },
  {
    text: 'Portfolio Overview',
    path: '/director/portfolio',
    icon: <AccountBalanceIcon />
  },
  {
    text: 'Performance Metrics',
    path: '/director/metrics',
    icon: <TrendingUpIcon />
  }
];

export default function DirectorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPortfolio: 0,
    monthlyDisbursement: 0,
    pendingApprovals: 0,
    defaultRate: 0
  });
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [highValueLoans, setHighValueLoans] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch high-value loans
        const loansQuery = query(
          collection(db, 'loanApplications'),
          where('amount', '>=', 100000),
          where('status', 'in', ['pending_director_approval', 'approved_by_director']),
          orderBy('amount', 'desc')
        );
        
        const loansSnapshot = await getDocs(loansQuery);
        const loans = loansSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setHighValueLoans(loans.slice(0, 5));

        // Fetch monthly trends (mock data - replace with actual data)
        const trends = [
          { month: 'Jan', disbursement: 1200000, approvals: 45 },
          { month: 'Feb', disbursement: 1500000, approvals: 52 },
          // Add more months...
        ];
        setMonthlyTrends(trends);

        // Calculate stats
        setStats({
          totalPortfolio: loans.reduce((acc, curr) => acc + curr.amount, 0),
          monthlyDisbursement: trends[trends.length - 1].disbursement,
          pendingApprovals: loans.filter(loan => loan.status === 'pending_director_approval').length,
          defaultRate: 2.5 // Mock data - replace with actual calculation
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
    <DashboardLayout title="Director Dashboard" menuItems={menuItems}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Portfolio"
              value={stats.totalPortfolio}
              previousValue={stats.lastMonthPortfolio}
              format="currency"
              icon={AccountBalanceWalletIcon}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Monthly Disbursement"
              value={stats.monthlyDisbursement}
              previousValue={stats.lastMonthDisbursement}
              format="currency"
              icon={TrendingUpIcon}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Default Rate"
              value={stats.defaultRate}
              format="percentage"
              icon={ErrorIcon}
              color={stats.defaultRate > 5 ? 'error' : 'warning'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Pending Approvals"
              value={stats.pendingApprovals}
              icon={AssessmentIcon}
              color="info"
            />
          </Grid>

          {/* Monthly Trends Chart */}
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Monthly Trends
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="disbursement" stroke="#8884d8" />
                <Line yAxisId="right" type="monotone" dataKey="approvals" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Grid>

          {/* High Value Loans */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              High Value Loans
            </Typography>
            <Grid container spacing={2}>
              {highValueLoans.map((loan) => (
                <Grid item xs={12} key={loan.id}>
                  <LoanDetailsCard
                    loan={loan}
                    onAction={(loan) => navigate(`/director/applications/${loan.id}`)}
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