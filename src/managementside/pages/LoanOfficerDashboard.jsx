import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  Fab,
  Zoom,
  Tooltip,
  alpha,
  styled
} from '@mui/material';
import {
  Add,
  Business,
  Person,
  AccountBalance,
  AttachMoney,
  TrendingUp,
  Assessment,
  AccountBalanceWallet,
  PriceCheck
} from '@mui/icons-material';
import NotificationSystem from '../components/notifications/NotificationSystem';
import { useNavigate } from 'react-router-dom';
import KanbanBoard from '../components/kanban/KanbanBoard';
import MetricCard from '../components/metrics/MetricCard';
import { colors } from '../../theme/colors';
import { supabase } from '../../utils/supabaseClient';

// Styled Components
const FloatingActionButton = styled(Fab)({
  position: 'fixed',
  bottom: 32,
  right: 32,
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  '&:hover': {
    background: 'linear-gradient(45deg, #1976D2 30%, #1CA7D2 90%)',
  }
});

const LoanTypeCard = styled(Box)(({ color = '#2196F3' }) => ({
  padding: '20px',
  background: `linear-gradient(45deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.2)} 100%)`,
  border: `1px solid ${alpha(color, 0.2)}`,
  borderRadius: '15px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    background: `linear-gradient(45deg, ${alpha(color, 0.2)} 0%, ${alpha(color, 0.3)} 100%)`,
  }
}));

const loanTypes = [
  {
    title: 'Business Loan',
    description: 'For business expansion and operations',
    icon: <Business sx={{ fontSize: 40 }} />,
    color: '#2196F3',
    type: 'BUSINESS_LOAN'
  },
  {
    title: 'Personal Loan',
    description: 'For personal expenses and needs',
    icon: <Person sx={{ fontSize: 40 }} />,
    color: '#4CAF50',
    type: 'PERSONAL_LOAN'
  },
  {
    title: 'GRZ Loan',
    description: 'For government employees',
    icon: <AccountBalance sx={{ fontSize: 40 }} />,
    color: '#9C27B0',
    type: 'GRZ_LOAN'
  },
  {
    title: 'Salary Advance',
    description: 'Short-term salary advances',
    icon: <AttachMoney sx={{ fontSize: 40 }} />,
    color: '#FF9800',
    type: 'SALARY_ADVANCE'
  }
];

const kanbanColumns = [
  {
    id: 'new',
    title: 'New Applications',
    color: colors.warning
  },
  {
    id: 'manager_approved',
    title: 'Manager Approved',
    color: colors.success
  },
  {
    id: 'director_approved',
    title: 'Director Approved',
    color: colors.purple
  },
  {
    id: 'disbursed',
    title: 'Disbursed',
    color: colors.primary
  }
];

const LoanOfficerDashboard = () => {
  const navigate = useNavigate();
  const [openLoanTypes, setOpenLoanTypes] = useState(false);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get metrics
        const { data: metricsData, error: metricsError } = await supabase
          .rpc('get_loan_officer_metrics');
        if (metricsError) throw metricsError;

        // Get loans
        const { data: loansData, error: loansError } = await supabase
          .from('loan_applications')
          .select('*')
          .order('created_at', { ascending: false });
        if (loansError) throw loansError;

        setMetrics(metricsData);
        setLoans(loansData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNewApplication = (loanType) => {
    setOpenLoanTypes(false);
    navigate('/calculator', { 
      state: { 
        isApplicationFlow: true,
        step: 1,
        totalSteps: 7,
        preselectedType: loanType,
        fromDashboard: true
      } 
    });
  };

  const handleLoanMove = async (loanId, sourceStatus, destinationStatus) => {
    try {
      const { error } = await supabase
        .from('loan_applications')
        .update({ status: destinationStatus, updated_at: new Date() })
        .eq('id', loanId);

      if (error) throw error;

      // Refresh loans after update
      const { data: updatedLoans, error: fetchError } = await supabase
        .from('loan_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setLoans(updatedLoans);
    } catch (error) {
      console.error('Error updating loan status:', error);
    }
  };

  const handleLoanClick = (loan) => {
    navigate(`/management/loan-officer/loans/${loan.id}`);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Metrics Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Loans"
            value={metrics?.totalLoans.value}
            icon={<Assessment sx={{ fontSize: 24 }} />}
            trend={metrics?.totalLoans.trend}
            color={colors.primary}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Applications"
            value={metrics?.activeApplications.value}
            icon={<TrendingUp sx={{ fontSize: 24 }} />}
            trend={metrics?.activeApplications.trend}
            color={colors.success}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Disbursed Amount"
            value={metrics?.disbursedAmount.value}
            icon={<AccountBalanceWallet sx={{ fontSize: 24 }} />}
            trend={metrics?.disbursedAmount.trend}
            color={colors.purple}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Approval Rate"
            value={metrics?.approvalRate.value}
            icon={<PriceCheck sx={{ fontSize: 24 }} />}
            trend={metrics?.approvalRate.trend}
            color={colors.warning}
          />
        </Grid>
      </Grid>

      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Loan Applications</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <NotificationSystem />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenLoanTypes(true)}
          >
            New Application
          </Button>
        </Stack>
      </Box>

      {/* Kanban Board */}
      <KanbanBoard
        columns={kanbanColumns}
        loans={loans}
        onLoanMove={handleLoanMove}
        onLoanClick={handleLoanClick}
        role="loan_officer"
        allowDrag={true}
      />

      {/* Floating Action Button */}
      <Zoom in={true}>
        <Tooltip title="New Loan Application" placement="left">
          <FloatingActionButton 
            color="primary" 
            onClick={() => setOpenLoanTypes(true)}
          >
            <Add />
          </FloatingActionButton>
        </Tooltip>
      </Zoom>

      {/* Loan Types Dialog */}
      <Dialog 
        open={openLoanTypes} 
        onClose={() => setOpenLoanTypes(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px'
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h5" sx={{ color: '#fff', mb: 1 }}>
            Select Loan Type
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Choose the type of loan to start a new application
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {loanTypes.map((loan) => (
              <Grid item xs={12} sm={6} key={loan.type}>
                <LoanTypeCard
                  color={loan.color}
                  onClick={() => handleNewApplication(loan.type)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}
                >
                  <Box sx={{ color: loan.color, mb: 2 }}>
                    {loan.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {loan.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {loan.description}
                  </Typography>
                </LoanTypeCard>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default LoanOfficerDashboard; 