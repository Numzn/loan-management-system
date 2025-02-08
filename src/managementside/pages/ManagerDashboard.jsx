import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  AccountBalanceWallet,
  PriceCheck,
  Timeline,
  Speed,
  CheckCircle,
  ErrorOutline
} from '@mui/icons-material';
import { collection, query, orderBy, onSnapshot, where, Timestamp, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import NotificationSystem from '../components/notifications/NotificationSystem';
import { useNavigate } from 'react-router-dom';
import KanbanBoard from '../components/kanban/KanbanBoard';
import MetricCard from '../components/metrics/MetricCard';
import { colors } from '../../theme/colors';

const kanbanColumns = [
  {
    id: 'new_review',
    title: 'New Review',
    color: '#ff9800'
  },
  {
    id: 'approved',
    title: 'Approved',
    color: '#4caf50'
  },
  {
    id: 'disbursed',
    title: 'Disbursed',
    color: '#2196f3'
  },
  {
    id: 'rejected',
    title: 'Rejected',
    color: '#f44336'
  }
];

const ManagerDashboard = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    // Subscribe to loan applications assigned to manager
    const q = query(
      collection(db, 'loanApplications'),
      where('status', 'in', ['new_review', 'approved', 'disbursed', 'rejected']),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newLoans = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLoans(newLoans);

      // Calculate metrics
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const pendingReview = newLoans.filter(loan => loan.status === 'new_review').length;
      const approvedToday = newLoans.filter(loan => 
        loan.status === 'approved' && 
        loan.updatedAt?.toDate() >= today
      ).length;
      const totalAmount = newLoans
        .filter(loan => loan.status !== 'rejected')
        .reduce((sum, loan) => sum + (loan.amount || 0), 0);
      const totalProcessed = newLoans.filter(loan => 
        loan.status === 'approved' || loan.status === 'rejected'
      ).length;
      const totalApproved = newLoans.filter(loan => loan.status === 'approved').length;
      const approvalRate = totalProcessed ? (totalApproved / totalProcessed) * 100 : 0;

      setMetrics({
        pendingReview,
        approvedToday,
        totalAmount,
        approvalRate: Math.round(approvalRate)
      });

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLoanMove = async (loanId, sourceStatus, destinationStatus) => {
    if (destinationStatus === 'rejected') {
      setRejectionDialog({ open: true, loanId });
      return;
    }

    try {
      await updateDoc(doc(db, 'loanApplications', loanId), {
        status: destinationStatus,
        updatedAt: Timestamp.now()
      });

      // Add notification based on the status change
      let recipientRole = '';
      let title = '';
      let message = '';

      switch (destinationStatus) {
        case 'approved':
          recipientRole = 'director';
          title = 'New Loan for Review';
          message = `Loan application ${loanId} has been approved by manager and needs your review`;
          break;
        case 'rejected':
          recipientRole = 'loan_officer';
          title = 'Loan Application Rejected';
          message = `Loan application ${loanId} has been rejected by manager`;
          break;
      }

      if (recipientRole) {
        await addDoc(collection(db, 'notifications'), {
          type: 'loan_status_update',
          title,
          message,
          timestamp: Timestamp.now(),
          isRead: false,
          priority: 'high',
          loanId,
          recipientRole
        });
      }
    } catch (error) {
      console.error('Error updating loan status:', error);
    }
  };

  const handleLoanClick = (loan) => {
    // Navigate to loan details view
    navigate(`/management/manager/loans/${loan.id}`);
  };

  const handleReject = async () => {
    if (!rejectionDialog.loanId || !rejectionReason.trim()) return;

    try {
      await updateDoc(doc(db, 'loanApplications', rejectionDialog.loanId), {
        status: 'rejected',
        rejectionReason: rejectionReason.trim(),
        rejectedAt: Timestamp.now(),
        rejectedBy: 'manager'
      });

      // Notify loan officer
      await addDoc(collection(db, 'notifications'), {
        type: 'loan_rejected',
        title: 'Loan Application Rejected',
        message: `Loan application ${rejectionDialog.loanId} has been rejected. Reason: ${rejectionReason}`,
        timestamp: Timestamp.now(),
        isRead: false,
        priority: 'high',
        loanId: rejectionDialog.loanId,
        recipientRole: 'loan_officer'
      });

      setRejectionDialog({ open: false, loanId: null });
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting loan:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Metrics Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Pending Review"
            value={metrics.pendingReview}
            icon={<Timeline sx={{ fontSize: 24 }} />}
            color={colors.warning}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Approved Today"
            value={metrics.approvedToday}
            icon={<CheckCircle sx={{ fontSize: 24 }} />}
            color={colors.success}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Amount"
            value={metrics.totalAmount}
            icon={<AccountBalanceWallet sx={{ fontSize: 24 }} />}
            color={colors.primary}
            prefix="K"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Approval Rate"
            value={metrics.approvalRate}
            icon={<Speed sx={{ fontSize: 24 }} />}
            color={colors.info}
            suffix="%"
          />
        </Grid>
      </Grid>

      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Loan Review Dashboard</Typography>
        <NotificationSystem />
      </Box>

      {/* Kanban Board */}
      <KanbanBoard
        columns={kanbanColumns}
        loans={loans}
        onLoanMove={handleLoanMove}
        onLoanClick={handleLoanClick}
        role="manager"
        allowDrag={true}
      />

      {/* Rejection Dialog */}
      <Dialog 
        open={rejectionDialog.open} 
        onClose={() => setRejectionDialog({ open: false, loanId: null })}
      >
        <DialogTitle>Reject Loan Application</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Rejection"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDialog({ open: false, loanId: null })}>
            Cancel
          </Button>
          <Button onClick={handleReject} color="primary" variant="contained">
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManagerDashboard; 