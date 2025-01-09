import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Box,
  Button
} from '@mui/material';
import { LOAN_TYPES } from '../../constants/loanTypes';

export default function LoanDetailsCard({ loan, onAction, actionLabel }) {
  const getLoanTypeDetails = (typeId) => LOAN_TYPES[typeId.toUpperCase()] || {};
  const loanType = getLoanTypeDetails(loan.loanType);

  const getStatusColor = (status) => {
    const statusColors = {
      submitted: 'primary',
      under_review: 'warning',
      approved: 'success',
      rejected: 'error',
      disbursed: 'info',
      completed: 'success',
      defaulted: 'error'
    };
    return statusColors[status] || 'default';
  };

  return (
    <Card>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">
                Loan Application #{loan.id.slice(0, 8)}
              </Typography>
              <Chip
                label={loan.status.replace(/_/g, ' ').toUpperCase()}
                color={getStatusColor(loan.status)}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography color="textSecondary" gutterBottom>
              Applicant
            </Typography>
            <Typography variant="body1">
              {loan.clientName}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography color="textSecondary" gutterBottom>
              Loan Type
            </Typography>
            <Typography variant="body1">
              {loanType.name}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography color="textSecondary" gutterBottom>
              Amount Requested
            </Typography>
            <Typography variant="body1">
              ${loan.amount.toLocaleString()}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography color="textSecondary" gutterBottom>
              Duration
            </Typography>
            <Typography variant="body1">
              {loan.duration} months
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography color="textSecondary" gutterBottom>
              Interest Rate
            </Typography>
            <Typography variant="body1">
              {loanType.interestRate}%
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography color="textSecondary" gutterBottom>
              Monthly Payment
            </Typography>
            <Typography variant="body1">
              ${((loan.amount * (1 + loanType.interestRate/100)) / loan.duration).toFixed(2)}
            </Typography>
          </Grid>

          {onAction && actionLabel && (
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => onAction(loan)}
                >
                  {actionLabel}
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
} 