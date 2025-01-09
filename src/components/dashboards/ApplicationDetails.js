import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Typography,
  Box,
  Chip,
  Divider,
  IconButton,
  Card,
  CardContent,
  Avatar,
  Button
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  AccountBalance as BankIcon,
  Description as DocumentIcon
} from '@mui/icons-material';
import { formatCurrency } from '../../utils/formatters';
import { LOAN_TYPES } from '../../constants/loanTypes';

export default function ApplicationDetails({ open, onClose, applicationData }) {
  const {
    applicationNumber,
    status,
    stage,
    progress,
    submittedAt,
    loanType,
    calculatedResults,
    personalDetails,
    loanSpecificDetails,
    documents,
    passportPhotoUrl
  } = applicationData || {};

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Application Details</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Header with Photo and Basic Info */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={passportPhotoUrl}
            sx={{ width: 100, height: 100 }}
          />
          <Box>
            <Typography variant="h5">
              {personalDetails?.firstName} {personalDetails?.lastName}
            </Typography>
            <Typography color="textSecondary" gutterBottom>
              {personalDetails?.email}
            </Typography>
            <Chip 
              label={status?.replace('_', ' ')} 
              color="primary" 
              variant="outlined"
            />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Application Summary */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" color="primary" gutterBottom>
              Application Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography color="textSecondary">Application Number:</Typography>
                <Typography variant="body1">{applicationNumber}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="textSecondary">Submitted Date:</Typography>
                <Typography variant="body1">
                  {new Date(submittedAt).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="textSecondary">Current Stage:</Typography>
                <Typography variant="body1">{stage}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="textSecondary">Progress:</Typography>
                <Typography variant="body1">{progress}% Complete</Typography>
              </Grid>
            </Grid>
          </Grid>

          {/* Loan Details */}
          <Grid item xs={12}>
            <Typography variant="h6" color="primary" gutterBottom>
              Loan Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography color="textSecondary">Loan Type:</Typography>
                <Typography variant="body1">
                  {LOAN_TYPES[loanType]?.name}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="textSecondary">Amount:</Typography>
                <Typography variant="body1">
                  {formatCurrency(calculatedResults?.loanAmount)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="textSecondary">Monthly Payment:</Typography>
                <Typography variant="body1">
                  {formatCurrency(calculatedResults?.monthlyPayment)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="textSecondary">Duration:</Typography>
                <Typography variant="body1">
                  {calculatedResults?.duration} months
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          {/* Documents */}
          <Grid item xs={12}>
            <Typography variant="h6" color="primary" gutterBottom>
              Submitted Documents
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(documents || {}).map(([name, file]) => (
                <Grid item xs={12} sm={6} key={name}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DocumentIcon sx={{ mr: 1 }} color="primary" />
                        <Box>
                          <Typography variant="subtitle2">{name}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {file.name}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        {/* Status Footer */}
        <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Current Status
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Your application is currently {status?.toLowerCase()?.replace('_', ' ')}. 
            Our team will review your application and update you on any progress.
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
} 