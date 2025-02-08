import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Stack,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  Visibility,
  CheckCircle,
  Warning,
  TrendingUp,
} from '@mui/icons-material';

// Mock data - replace with actual data
const activeLoans = [
  {
    id: 'LOAN001',
    clientName: 'John Doe',
    loanType: 'Personal',
    amount: 22000,
    disbursementDate: '2024-01-01',
    status: 'on_track',
    progress: 75,
    nextPaymentDate: '2024-02-01',
    nextPaymentAmount: 2000,
  },
];

const statusChipProps = {
  on_track: { label: 'On Track', color: 'success', icon: <CheckCircle /> },
  at_risk: { label: 'At Risk', color: 'warning', icon: <Warning /> },
  defaulted: { label: 'Defaulted', color: 'error', icon: <Warning /> },
};

const ActiveLoans = () => {
  const [selectedLoan, setSelectedLoan] = useState(null);

  const handleViewLoan = (loanId) => {
    console.log('View loan:', loanId);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Active Loans
      </Typography>

      <Grid container spacing={3}>
        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Total Active Loans
            </Typography>
            <Typography variant="h4" color="primary">
              156
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Value: $3.2M
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Collection Rate
            </Typography>
            <Typography variant="h4" color="success.main">
              95%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              +2.5% from last month
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              At Risk Loans
            </Typography>
            <Typography variant="h4" color="warning.main">
              12
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Value: $245K
            </Typography>
          </Paper>
        </Grid>

        {/* Loans Table */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Loan ID</TableCell>
                  <TableCell>Client Name</TableCell>
                  <TableCell>Loan Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Next Payment</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeLoans.map((loan) => {
                  const statusProps = statusChipProps[loan.status];
                  return (
                    <TableRow key={loan.id}>
                      <TableCell>{loan.id}</TableCell>
                      <TableCell>{loan.clientName}</TableCell>
                      <TableCell>{loan.loanType}</TableCell>
                      <TableCell>${loan.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={loan.progress} 
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {loan.progress}% Complete
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={statusProps.icon}
                          label={statusProps.label}
                          color={statusProps.color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          ${loan.nextPaymentAmount.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Due: {loan.nextPaymentDate}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewLoan(loan.id)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ActiveLoans; 