import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import KanbanBoard from '../components/kanban/KanbanBoard';
import DashboardMetrics from '../../components/dashboard/DashboardMetrics';
import { dashboardColumns, dashboardMetrics } from '../../theme/dashboardStyles';
import { supabase } from '../../utils/supabaseClient';
import FinanceNotifications from '../components/notifications/FinanceNotifications';

const FinanceDashboard = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    pendingDisbursement: 0,
    disbursedToday: 0,
    totalAmount: 0,
    approvalRate: 0
  });

  // Mock loan data for finance
  const mockLoans = [
    {
      id: '1',
      clientName: 'John Doe',
      amount: 50000,
      status: 'approved',
      loanType: 'Personal Loan',
      submissionDate: '2024-01-15',
      disbursementDetails: {
        accountNumber: '1234567890',
        bankName: 'First National Bank',
        branchCode: '250655'
      }
    },
    {
      id: '2',
      clientName: 'Jane Smith',
      amount: 75000,
      status: 'pending_funding',
      loanType: 'Business Loan',
      submissionDate: '2024-01-16',
      disbursementDetails: {
        accountNumber: '0987654321',
        bankName: 'Standard Bank',
        branchCode: '051001'
      }
    },
    {
      id: '3',
      clientName: 'Bob Johnson',
      amount: 100000,
      status: 'disbursed',
      loanType: 'Home Loan',
      submissionDate: '2024-01-17',
      disbursementDate: '2024-01-18',
      disbursementDetails: {
        accountNumber: '5432109876',
        bankName: 'Nedbank',
        branchCode: '198765'
      }
    }
  ];

  useEffect(() => {
    // Set mock data
    setLoans(mockLoans);
    setLoading(false);

    // Calculate finance-specific metrics
    const pendingDisbursement = mockLoans.filter(loan => loan.status === 'pending_funding').length;
    const disbursedToday = mockLoans.filter(loan => loan.status === 'disbursed').length;
    const totalAmount = mockLoans.reduce((sum, loan) => sum + loan.amount, 0);
    const approvalRate = (disbursedToday / mockLoans.length) * 100;

    setMetrics({
      pendingDisbursement,
      disbursedToday,
      totalAmount,
      approvalRate: Math.round(approvalRate)
    });
  }, []);

  const handleLoanMove = async (loanId, sourceStatus, targetStatus) => {
    try {
      // Update local state
      setLoans(prevLoans => 
        prevLoans.map(loan => 
          loan.id === loanId 
            ? { 
                ...loan, 
                status: targetStatus,
                ...(targetStatus === 'disbursed' ? { disbursementDate: new Date().toISOString() } : {})
              }
            : loan
        )
      );

      // In real implementation, update Supabase
      // const { error } = await supabase
      //   .from('loans')
      //   .update({ 
      //     status: targetStatus,
      //     ...(targetStatus === 'disbursed' ? { disbursement_date: new Date().toISOString() } : {})
      //   })
      //   .eq('id', loanId);

      // if (error) throw error;
    } catch (error) {
      console.error('Error moving loan:', error);
    }
  };

  const handleLoanClick = (loan) => {
    console.log('Loan clicked:', loan);
    // Add loan disbursement detail view logic here
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Metrics Section */}
      <DashboardMetrics 
        metrics={metrics} 
        metricTypes={dashboardMetrics.finance}
      />

      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Loan Disbursement Dashboard</Typography>
        <FinanceNotifications />
      </Box>

      {/* Kanban Board */}
      <KanbanBoard
        columns={dashboardColumns.finance}
        loans={loans}
        onLoanMove={handleLoanMove}
        onLoanClick={handleLoanClick}
        role="finance"
        allowDrag={true}
      />
    </Box>
  );
};

export default FinanceDashboard; 