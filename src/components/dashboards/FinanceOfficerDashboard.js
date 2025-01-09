import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import DashboardLayout from '../layout/DashboardLayout';
import {
  Grid, Typography, Box, CircularProgress
} from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import WarningIcon from '@mui/icons-material/Warning';
import StatsCard from '../shared/StatsCard';
import LoanDetailsCard from '../shared/LoanDetailsCard';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Paper from '@mui/material/Paper';

const menuItems = [
  {
    text: 'Dashboard',
    path: '/finance-dashboard',
    icon: <DashboardIcon />
  },
  {
    text: 'Disbursements',
    path: '/finance/disbursements',
    icon: <PaymentsIcon />
  },
  {
    text: 'Repayments',
    path: '/finance/repayments',
    icon: <ReceiptIcon />
  },
  {
    text: 'Reports',
    path: '/finance/reports',
    icon: <AssessmentIcon />
  }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function FinanceOfficerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingDisbursements: 0,
    totalDisbursed: 0,
    expectedRepayments: 0,
    overduePayments: 0
  });
  const [recentDisbursements, setRecentDisbursements] = useState([]);
  const [upcomingRepayments, setUpcomingRepayments] = useState([]);
  const [portfolioDistribution, setPortfolioDistribution] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch pending disbursements
        const disbursementsQuery = query(
          collection(db, 'loanApplications'),
          where('status', '==', 'approved_for_disbursement'),
          orderBy('approvalDate', 'desc')
        );
        
        const disbursementsSnapshot = await getDocs(disbursementsQuery);
        const disbursements = disbursementsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setRecentDisbursements(disbursements.slice(0, 5));

        // Fetch upcoming repayments
        const repaymentsQuery = query(
          collection(db, 'repayments'),
          where('dueDate', '>=', new Date()),
          orderBy('dueDate', 'asc')
        );
        
        const repaymentsSnapshot = await getDocs(repaymentsQuery);
        const repayments = repaymentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setUpcomingRepayments(repayments.slice(0, 5));

        // Mock portfolio distribution data
        const distribution = [
          { name: 'Personal Loans', value: 4000000 },
          { name: 'Business Loans', value: 3000000 },
          { name: 'Education Loans', value: 2000000 },
          { name: 'Other Loans', value: 1000000 }
        ];
        setPortfolioDistribution(distribution);

        // Calculate stats
        setStats({
          pendingDisbursements: disbursements.length,
          totalDisbursed: disbursements.reduce((acc, curr) => acc + curr.amount, 0),
          expectedRepayments: repayments.reduce((acc, curr) => acc + curr.amount, 0),
          overduePayments: repayments.filter(r => r.status === 'overdue').length
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
    <DashboardLayout title="Finance Officer Dashboard" menuItems={menuItems}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Pending Disbursements"
              value={stats.pendingDisbursements}
              icon={PaymentsIcon}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Total Disbursed (Month)"
              value={stats.totalDisbursed}
              previousValue={stats.lastMonthDisbursed}
              format="currency"
              icon={AccountBalanceIcon}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Expected Repayments"
              value={stats.expectedRepayments}
              format="currency"
              icon={PaymentsIcon}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Overdue Payments"
              value={stats.overduePayments}
              icon={WarningIcon}
              color="error"
            />
          </Grid>

          {/* Portfolio Distribution Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Portfolio Distribution
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label
                  >
                    {portfolioDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Recent Disbursements */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Pending Disbursements
            </Typography>
            <Grid container spacing={2}>
              {recentDisbursements.map((disbursement) => (
                <Grid item xs={12} key={disbursement.id}>
                  <LoanDetailsCard
                    loan={disbursement}
                    onAction={(loan) => navigate(`/finance/disbursements/${loan.id}`)}
                    actionLabel="Process Disbursement"
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Upcoming Repayments */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Upcoming Repayments
            </Typography>
            <Grid container spacing={2}>
              {upcomingRepayments.map((repayment) => (
                <Grid item xs={12} key={repayment.id}>
                  <LoanDetailsCard
                    loan={repayment}
                    onAction={(loan) => navigate(`/finance/repayments/${loan.id}`)}
                    actionLabel="Process Repayment"
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