import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { collection, query, orderBy, onSnapshot, where, Timestamp, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import NotificationSystem from '../components/notifications/NotificationSystem';
import { useNavigate } from 'react-router-dom';
import KanbanBoard from '../components/kanban/KanbanBoard';

const kanbanColumns = [
  {
    id: 'pending_funding',
    title: 'Pending Funding',
    color: '#ff9800'
  },
  {
    id: 'disbursed',
    title: 'Disbursed',
    color: '#4caf50'
  },
  {
    id: 'awaiting_funds',
    title: 'Awaiting Funds',
    color: '#f44336'
  }
];

const FinanceOfficerDashboard = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [delayDialog, setDelayDialog] = useState({ open: false, loanId: null });
  const [delayReason, setDelayReason] = useState('');

  useEffect(() => {
    // Subscribe to loan applications ready for funding
    const q = query(
      collection(db, 'loanApplications'),
      where('status', 'in', ['pending_funding', 'disbursed', 'awaiting_funds']),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newLoans = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLoans(newLoans);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLoanMove = async (loanId, sourceStatus, destinationStatus) => {
    if (destinationStatus === 'awaiting_funds') {
      setDelayDialog({ open: true, loanId });
      return;
    }

    try {
      await updateDoc(doc(db, 'loanApplications', loanId), {
        status: destinationStatus,
        updatedAt: Timestamp.now()
      });

      // Add notification based on the status change
      let notifications = [];

      if (destinationStatus === 'disbursed') {
        // Notify all relevant parties
        notifications = [
          {
            type: 'loan_disbursed',
            title: 'Loan Disbursed',
            message: `Loan application ${loanId} has been successfully disbursed`,
            timestamp: Timestamp.now(),
            isRead: false,
            priority: 'high',
            loanId,
            recipientRole: 'loan_officer'
          },
          {
            type: 'loan_disbursed',
            title: 'Loan Disbursed',
            message: `Loan application ${loanId} has been successfully disbursed`,
            timestamp: Timestamp.now(),
            isRead: false,
            priority: 'high',
            loanId,
            recipientRole: 'manager'
          },
          {
            type: 'loan_disbursed',
            title: 'Loan Disbursed',
            message: `Loan application ${loanId} has been successfully disbursed`,
            timestamp: Timestamp.now(),
            isRead: false,
            priority: 'high',
            loanId,
            recipientRole: 'director'
          }
        ];

        // Add notifications
        await Promise.all(notifications.map(notification => 
          addDoc(collection(db, 'notifications'), notification)
        ));
      }
    } catch (error) {
      console.error('Error updating loan status:', error);
    }
  };

  const handleLoanClick = (loan) => {
    // Navigate to loan details view
    navigate(`/management/finance/loans/${loan.id}`);
  };

  const handleDelay = async () => {
    if (!delayDialog.loanId || !delayReason.trim()) return;

    try {
      await updateDoc(doc(db, 'loanApplications', delayDialog.loanId), {
        status: 'awaiting_funds',
        delayReason: delayReason.trim(),
        delayedAt: Timestamp.now()
      });

      // Notify relevant parties
      const notifications = [
        {
          type: 'loan_delayed',
          title: 'Loan Disbursement Delayed',
          message: `Loan application ${delayDialog.loanId} disbursement has been delayed. Reason: ${delayReason}`,
          timestamp: Timestamp.now(),
          isRead: false,
          priority: 'high',
          loanId: delayDialog.loanId,
          recipientRole: 'director'
        },
        {
          type: 'loan_delayed',
          title: 'Loan Disbursement Delayed',
          message: `Loan application ${delayDialog.loanId} disbursement has been delayed. Reason: ${delayReason}`,
          timestamp: Timestamp.now(),
          isRead: false,
          priority: 'high',
          loanId: delayDialog.loanId,
          recipientRole: 'manager'
        }
      ];

      // Add notifications
      await Promise.all(notifications.map(notification => 
        addDoc(collection(db, 'notifications'), notification)
      ));

      setDelayDialog({ open: false, loanId: null });
      setDelayReason('');
    } catch (error) {
      console.error('Error marking loan as delayed:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Finance Dashboard</Typography>
        <NotificationSystem />
      </Box>

      <KanbanBoard
        columns={kanbanColumns}
        loans={loans}
        onLoanMove={handleLoanMove}
        onLoanClick={handleLoanClick}
        role="finance_officer"
        allowDrag={true}
      />

      {/* Delay Dialog */}
      <Dialog 
        open={delayDialog.open} 
        onClose={() => setDelayDialog({ open: false, loanId: null })}
      >
        <DialogTitle>Delay Loan Disbursement</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Delay"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={delayReason}
            onChange={(e) => setDelayReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDelayDialog({ open: false, loanId: null })}>
            Cancel
          </Button>
          <Button onClick={handleDelay} color="primary" variant="contained">
            Confirm Delay
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FinanceOfficerDashboard; 