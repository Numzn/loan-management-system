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
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  AccountBalance as BankIcon,
  Description as DocumentIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { formatCurrency } from '../../utils/formatters';
import { LOAN_TYPES } from '../../constants/loanTypes';
import { LOAN_STATUS } from '../../config/supabaseClient';

export default function ApplicationDetails({ open, onClose, applicationData, statusHistory }) {
  if (!applicationData) return null;

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
        {/* Header with Basic Info */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            alt={applicationData.applicant_name}
            sx={{ 
              width: 100, 
              height: 100,
              bgcolor: 'primary.main'
            }}
          >
            {applicationData.applicant_name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h5">
              {applicationData.applicant_name}
            </Typography>
            <Typography color="textSecondary" gutterBottom>
              {applicationData.email}
            </Typography>
            <Chip 
              label={applicationData.status?.replace('_', ' ')} 
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
                <Typography color="textSecondary">Application ID:</Typography>
                <Typography variant="body1">{applicationData.application_id}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="textSecondary">Submitted Date:</Typography>
                <Typography variant="body1">
                  {new Date(applicationData.submitted_at).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="textSecondary">Current Status:</Typography>
                <Typography variant="body1">{applicationData.status?.replace('_', ' ')}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="textSecondary">Last Updated:</Typography>
                <Typography variant="body1">
                  {new Date(applicationData.updated_at || applicationData.submitted_at).toLocaleDateString()}
                </Typography>
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
                <Typography color="textSecondary">Loan Purpose:</Typography>
                <Typography variant="body1">
                  {applicationData.loan_purpose}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="textSecondary">Amount:</Typography>
                <Typography variant="body1">
                  {formatCurrency(applicationData.loan_amount)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="textSecondary">Monthly Income:</Typography>
                <Typography variant="body1">
                  {formatCurrency(applicationData.monthly_income)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography color="textSecondary">Employment Type:</Typography>
                <Typography variant="body1">
                  {applicationData.employment_type}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          {/* Status History */}
          <Grid item xs={12}>
            <Typography variant="h6" color="primary" gutterBottom>
              Application Timeline
            </Typography>
            <List>
              {statusHistory?.map((status, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={status.status.replace('_', ' ')}
                    secondary={
                      <>
                        {new Date(status.created_at).toLocaleString()}
                        {status.notes && (
                          <Typography variant="body2" color="textSecondary">
                            {status.notes}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Grid>

          {/* Documents */}
          <Grid item xs={12}>
            <Typography variant="h6" color="primary" gutterBottom>
              Submitted Documents
            </Typography>
            <Grid container spacing={2}>
              {applicationData.loan_documents?.map((doc, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DocumentIcon sx={{ mr: 1 }} color="primary" />
                        <Box>
                          <Typography variant="subtitle2">
                            {doc.document_type.replace('_', ' ')}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {doc.file_name}
                          </Typography>
                          <Typography variant="caption" display="block" color="textSecondary">
                            Uploaded: {new Date(doc.uploaded_at).toLocaleString()}
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
            {applicationData.status === LOAN_STATUS.DRAFT && 
              'Your application is currently in draft. Please complete and submit it.'}
            {applicationData.status === LOAN_STATUS.SUBMITTED && 
              'Your application has been submitted and is awaiting review.'}
            {applicationData.status === LOAN_STATUS.UNDER_REVIEW && 
              'Your application is currently under review by our team.'}
            {applicationData.status === LOAN_STATUS.APPROVED && 
              'Congratulations! Your loan application has been approved.'}
            {applicationData.status === LOAN_STATUS.REJECTED && 
              'Unfortunately, your loan application was not approved at this time.'}
            {applicationData.status === LOAN_STATUS.DISBURSED && 
              'Your loan has been disbursed. Please check your bank account.'}
            {applicationData.status === LOAN_STATUS.CLOSED && 
              'This loan application has been closed.'}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
} 