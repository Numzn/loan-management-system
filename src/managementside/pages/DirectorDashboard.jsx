import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress
} from '@mui/material';

// Mock data
const highValueLoans = [
  { 
    id: 1, 
    name: 'Tech Solutions Ltd', 
    amount: 500000, 
    status: 'pending_approval', 
    type: 'Business Loan',
    risk: 'medium'
  },
  { 
    id: 2, 
    name: 'Green Energy Corp', 
    amount: 750000, 
    status: 'under_review', 
    type: 'Corporate Loan',
    risk: 'low'
  },
  { 
    id: 3, 
    name: 'Construction Plus', 
    amount: 1000000, 
    status: 'pending_approval',
    type: 'Project Finance',
    risk: 'high'
  },
];

const statistics = {
  totalPortfolio: 25000000,
  activeLoans: 487,
  defaultRate: 2.3,
  profitMargin: 15.7
};

const departmentMetrics = {
  loanOfficers: {
    performance: 92,
    applications: 156,
    approvalRate: 85
  },
  managers: {
    performance: 88,
    reviewTime: 1.8,
    accuracy: 95
  },
  finance: {
    performance: 94,
    disbursementTime: 1.2,
    collections: 98
  }
};

const DirectorDashboard = () => {
  return (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">K{statistics.totalPortfolio.toLocaleString()}</Typography>
            <Typography color="textSecondary">Total Portfolio</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">{statistics.activeLoans}</Typography>
            <Typography color="textSecondary">Active Loans</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">{statistics.defaultRate}%</Typography>
            <Typography color="textSecondary">Default Rate</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">{statistics.profitMargin}%</Typography>
            <Typography color="textSecondary">Profit Margin</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Department Performance */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Department Performance
      </Typography>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Loan Officers
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Performance Score
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={departmentMetrics.loanOfficers.performance} 
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2">
                  {departmentMetrics.loanOfficers.performance}%
                </Typography>
              </Box>
              <Typography variant="body2">
                Applications: {departmentMetrics.loanOfficers.applications}
                <br />
                Approval Rate: {departmentMetrics.loanOfficers.approvalRate}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Managers
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Performance Score
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={departmentMetrics.managers.performance} 
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2">
                  {departmentMetrics.managers.performance}%
                </Typography>
              </Box>
              <Typography variant="body2">
                Avg. Review Time: {departmentMetrics.managers.reviewTime} days
                <br />
                Decision Accuracy: {departmentMetrics.managers.accuracy}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Finance Department
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Performance Score
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={departmentMetrics.finance.performance} 
                  sx={{ mb: 1 }}
                />
                        <Typography variant="body2">
                  {departmentMetrics.finance.performance}%
                        </Typography>
              </Box>
              <Typography variant="body2">
                Disbursement Time: {departmentMetrics.finance.disbursementTime} days
                <br />
                Collection Rate: {departmentMetrics.finance.collections}%
                        </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* High Value Loans */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            High Value Loans Pending Approval
          </Typography>
          <List>
            {highValueLoans.map((loan) => (
              <ListItem
                key={loan.id}
                divider
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <ListItemText
                  primary={loan.name}
                  secondary={
                    <>
                      {`${loan.type} - K${loan.amount.toLocaleString()}`}
                      <br />
                      {`Risk Level: ${loan.risk.toUpperCase()}`}
                    </>
                  }
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={loan.status.replace('_', ' ').toUpperCase()}
                    color={loan.status === 'pending_approval' ? 'warning' : 'info'}
                    size="small"
                  />
                  <Chip
                    label={loan.risk.toUpperCase()}
                    color={
                      loan.risk === 'high' ? 'error' : 
                      loan.risk === 'medium' ? 'warning' : 
                      'success'
                    }
                    size="small"
                  />
                </Box>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DirectorDashboard; 