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
import NotificationSystem from '../components/notifications/NotificationSystem';
import { useNavigate } from 'react-router-dom';
import KanbanBoard from '../components/kanban/KanbanBoard';
import { supabase } from '../../utils/supabaseClient';

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
    const fetchLoans = async () => {
      try {
        const { data, error } = await supabase
          .from('loan_applications')
          .select('*')
          .in('status', ['pending_funding', 'disbursed', 'awaiting_funds'])
          .order('created_at', { ascending: false });

        if (error) throw error;

        setLoans(data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching loans:', error);
        setLoading(false);
      }
    };

    fetchLoans();

    // Set up real-time subscription
    const subscription = supabase
      .channel('loan_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'loan_applications',
          filter: `status=in.(pending_funding,disbursed,awaiting_funds)`
        },
        (payload) => {
          // Handle real-time updates
          if (payload.eventType === 'INSERT') {
            setLoans(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setLoans(prev => prev.map(loan => 
              loan.id === payload.new.id ? payload.new : loan
            ));
          } else if (payload.eventType === 'DELETE') {
            setLoans(prev => prev.filter(loan => loan.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLoanMove = async (loanId, sourceStatus, destinationStatus) => {
    if (destinationStatus === 'awaiting_funds') {
      setDelayDialog({ open: true, loanId });
      return;
    }

    try {
      const updates = {
        status: destinationStatus,
        updated_at: new Date().toISOString()
      };

      if (destinationStatus === 'disbursed') {
        updates.disbursement_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('loan_applications')
        .update(updates)
        .eq('id', loanId);

      if (error) throw error;

      // Add notification
      if (destinationStatus === 'disbursed') {
        await supabase.from('notifications').insert([
          {
            type: 'loan_disbursed',
            title: 'Loan Disbursed',
            message: `Loan application ${loanId} has been successfully disbursed`,
            created_at: new Date().toISOString(),
            is_read: false,
            priority: 'high',
            loan_id: loanId,
            recipient_role: 'loan_officer'
          },
          {
            type: 'loan_disbursed',
            title: 'Loan Disbursed',
            message: `Loan application ${loanId} has been successfully disbursed`,
            created_at: new Date().toISOString(),
            is_read: false,
            priority: 'high',
            loan_id: loanId,
            recipient_role: 'manager'
          }
        ]);
      }
    } catch (error) {
      console.error('Error updating loan status:', error);
    }
  };

  const handleLoanClick = (loan) => {
    navigate(`/management/finance/loans/${loan.id}`);
  };

  const handleDelay = async () => {
    if (!delayDialog.loanId || !delayReason.trim()) return;

    try {
      const { error } = await supabase
        .from('loan_applications')
        .update({
          status: 'awaiting_funds',
          delay_reason: delayReason.trim(),
          delayed_at: new Date().toISOString()
        })
        .eq('id', delayDialog.loanId);

      if (error) throw error;

      // Add notifications
      await supabase.from('notifications').insert([
        {
          type: 'loan_delayed',
          title: 'Loan Disbursement Delayed',
          message: `Loan application ${delayDialog.loanId} disbursement has been delayed. Reason: ${delayReason}`,
          created_at: new Date().toISOString(),
          is_read: false,
          priority: 'high',
          loan_id: delayDialog.loanId,
          recipient_role: 'director'
        },
        {
          type: 'loan_delayed',
          title: 'Loan Disbursement Delayed',
          message: `Loan application ${delayDialog.loanId} disbursement has been delayed. Reason: ${delayReason}`,
          created_at: new Date().toISOString(),
          is_read: false,
          priority: 'high',
          loan_id: delayDialog.loanId,
          recipient_role: 'manager'
        }
      ]);

      setDelayDialog({ open: false, loanId: null });
      setDelayReason('');
    } catch (error) {
      console.error('Error marking loan as delayed:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

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