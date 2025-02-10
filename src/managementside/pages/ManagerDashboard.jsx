import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import NotificationSystem from '../components/notifications/NotificationSystem';
import KanbanBoard from '../components/kanban/KanbanBoard';
import DashboardMetrics from '../../components/dashboard/DashboardMetrics';
import RejectionDialog from '../components/dialogs/RejectionDialog';
import { dashboardColumns, dashboardMetrics } from '../../theme/dashboardStyles';
import { supabase } from '../../utils/supabaseClient';
import { useTheme } from '@mui/material/styles';

const ManagerDashboard = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionDialog, setRejectionDialog] = useState({ open: false, loanId: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [metrics, setMetrics] = useState({
    pendingReview: 0,
    approvedToday: 0,
    totalAmount: 0,
    approvalRate: 0
  });

  const theme = useTheme();

  // Mock loan data
  const mockLoans = [
    {
      id: '1',
      clientName: 'John Doe',
      amount: 50000,
      status: 'new_review',
      loanType: 'Personal Loan',
      submissionDate: '2024-01-15'
    },
    {
      id: '2',
      clientName: 'Jane Smith',
      amount: 75000,
      status: 'approved',
      loanType: 'Business Loan',
      submissionDate: '2024-01-16'
    },
    {
      id: '3',
      clientName: 'Bob Johnson',
      amount: 100000,
      status: 'disbursed',
      loanType: 'Home Loan',
      submissionDate: '2024-01-17'
    }
  ];

  useEffect(() => {
    // Set mock data
    setLoans(mockLoans);
    setLoading(false);

    // Calculate metrics
    const pendingReview = mockLoans.filter(loan => loan.status === 'new_review').length;
    const approvedToday = mockLoans.filter(loan => loan.status === 'approved').length;
    const totalAmount = mockLoans.reduce((sum, loan) => sum + loan.amount, 0);
    const approvalRate = (approvedToday / mockLoans.length) * 100;

    setMetrics({
      pendingReview,
      approvedToday,
      totalAmount,
      approvalRate: Math.round(approvalRate)
    });
  }, []);

  const handleLoanMove = async (loanId, sourceStatus, targetStatus) => {
    try {
      setLoans(prevLoans => 
        prevLoans.map(loan => 
          loan.id === loanId 
            ? { ...loan, status: targetStatus }
            : loan
        )
      );

      // In real implementation, update Supabase
      // const { error } = await supabase
      //   .from('loans')
      //   .update({ status: targetStatus })
      //   .eq('id', loanId);

      // if (error) throw error;
    } catch (error) {
      console.error('Error moving loan:', error);
    }
  };

  const handleLoanClick = (loan) => {
    console.log('Loan clicked:', loan);
    // Add loan detail view logic here
  };

  const handleReject = async () => {
    if (!rejectionDialog.loanId || !rejectionReason.trim()) return;

    try {
      // Update loan status in state
      setLoans(prevLoans =>
        prevLoans.map(loan =>
          loan.id === rejectionDialog.loanId
            ? { ...loan, status: 'rejected', rejectionReason: rejectionReason.trim() }
            : loan
        )
      );

      // In real implementation, update Supabase
      // const { error } = await supabase
      //   .from('loans')
      //   .update({
      //     status: 'rejected',
      //     rejection_reason: rejectionReason.trim(),
      //     rejected_at: new Date().toISOString(),
      //     rejected_by: 'manager'
      //   })
      //   .eq('id', rejectionDialog.loanId);

      // if (error) throw error;

      setRejectionDialog({ open: false, loanId: null });
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting loan:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Metrics Section */}
      <DashboardMetrics 
        metrics={metrics} 
        metricTypes={dashboardMetrics.manager}
      />

      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Loan Review Dashboard</Typography>
        <NotificationSystem />
      </Box>

      {/* Kanban Board */}
      <KanbanBoard
        columns={dashboardColumns.manager}
        loans={loans}
        onLoanMove={handleLoanMove}
        onLoanClick={handleLoanClick}
        role="manager"
        allowDrag={true}
      />

      {/* Rejection Dialog */}
      <RejectionDialog
        open={rejectionDialog.open}
        onClose={() => setRejectionDialog({ open: false, loanId: null })}
        onReject={handleReject}
        reason={rejectionReason}
        onReasonChange={(e) => setRejectionReason(e.target.value)}
      />
    </Box>
  );
};

export default ManagerDashboard; 