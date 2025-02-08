import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Container, Grid, Paper, Typography, Box, Alert,
  Card, CardContent, LinearProgress, Chip, Avatar, Button,
  List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import {
  AccountBalance as LoanIcon,
  Schedule as ScheduleIcon,
  Payment as PaymentIcon,
  Notifications as NotificationIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import ApplicationDetails from './ApplicationDetails';
import { supabase, TABLES, LOAN_STATUS } from '../../config/supabaseClient';
import { formatCurrency } from '../../utils/formatters';

// Map loan status to progress percentage
const STATUS_PROGRESS = {
  [LOAN_STATUS.DRAFT]: 20,
  [LOAN_STATUS.SUBMITTED]: 40,
  [LOAN_STATUS.UNDER_REVIEW]: 60,
  [LOAN_STATUS.APPROVED]: 80,
  [LOAN_STATUS.DISBURSED]: 100,
  [LOAN_STATUS.REJECTED]: 100,
  [LOAN_STATUS.CLOSED]: 100
};

// Map status to display color
const STATUS_COLORS = {
  [LOAN_STATUS.DRAFT]: 'default',
  [LOAN_STATUS.SUBMITTED]: 'primary',
  [LOAN_STATUS.UNDER_REVIEW]: 'warning',
  [LOAN_STATUS.APPROVED]: 'success',
  [LOAN_STATUS.DISBURSED]: 'success',
  [LOAN_STATUS.REJECTED]: 'error',
  [LOAN_STATUS.CLOSED]: 'default'
};

export default function ClientDashboard() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applicationData, setApplicationData] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get application ID from location state
        const applicationId = location.state?.applicationData?.id;
        
        if (!applicationId) {
          throw new Error('No application ID provided');
        }

        // Fetch application data
        const { data: application, error: applicationError } = await supabase
          .from(TABLES.LOAN_APPLICATIONS)
          .select(`
            *,
            loan_documents (
              document_type,
              file_name,
              uploaded_at
            )
          `)
          .eq('id', applicationId)
          .single();

        if (applicationError) throw applicationError;

        // Fetch status history
        const { data: history, error: historyError } = await supabase
          .from(TABLES.LOAN_STATUS_HISTORY)
          .select('*')
          .eq('loan_application_id', applicationId)
          .order('created_at', { ascending: true });

        if (historyError) throw historyError;

        setApplicationData(application);
        setStatusHistory(history || []);

        // Store in session storage for persistence
        sessionStorage.setItem('currentApplication', JSON.stringify(application));
      } catch (err) {
        console.error('Error fetching application data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationData();
  }, [location.state?.applicationData?.id]);

  const getNextSteps = () => {
    const currentStatus = applicationData?.status;
    
    switch (currentStatus) {
      case LOAN_STATUS.DRAFT:
        return 'Complete and submit your application.';
      case LOAN_STATUS.SUBMITTED:
        return 'Your application is being processed. Our team will review it shortly.';
      case LOAN_STATUS.UNDER_REVIEW:
        return 'Your application is under review. We may contact you for additional information.';
      case LOAN_STATUS.APPROVED:
        return 'Congratulations! Your loan has been approved. Disbursement is being processed.';
      case LOAN_STATUS.DISBURSED:
        return 'Your loan has been disbursed. Check your bank account for the funds.';
      case LOAN_STATUS.REJECTED:
        return 'Unfortunately, your application was not approved at this time.';
      default:
        return 'Status update pending.';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {location.state?.message && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {location.state.message}
        </Alert>
      )}

      {/* User Profile Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Avatar
          alt={applicationData?.applicant_name}
          sx={{ 
            width: 80, 
            height: 80, 
            mr: 2,
            border: '2px solid',
            borderColor: 'primary.main',
            bgcolor: 'primary.main'
          }}
        >
          {applicationData?.applicant_name?.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="h4" gutterBottom>
            Welcome Back, {applicationData?.applicant_name?.split(' ')[0]}
          </Typography>
          <Typography color="textSecondary">
            {applicationData?.email}
          </Typography>
        </Box>
      </Box>

      {/* Application Status Card */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LoanIcon sx={{ mr: 1 }} color="primary" />
              <Typography variant="h6">
                Application #{applicationData?.application_id}
              </Typography>
              <Chip 
                label={applicationData?.status?.replace('_', ' ')}
                color={STATUS_COLORS[applicationData?.status] || 'default'}
                size="small"
                sx={{ ml: 2 }}
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography color="textSecondary" gutterBottom>
                Current Stage: {applicationData?.status?.replace('_', ' ')}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={STATUS_PROGRESS[applicationData?.status] || 0}
                sx={{ 
                  height: 10, 
                  borderRadius: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: applicationData?.status === LOAN_STATUS.REJECTED ? '#f44336' : '#4caf50'
                  }
                }}
              />
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                {STATUS_PROGRESS[applicationData?.status] || 0}% Complete
              </Typography>
            </Box>

            {/* Status History */}
            <List sx={{ mt: 2 }}>
              {statusHistory.map((status, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={status.status.replace('_', ' ')}
                    secondary={new Date(status.created_at).toLocaleString()}
                  />
                  {index < statusHistory.length - 1 && (
                    <ArrowForwardIcon sx={{ color: 'action.disabled' }} />
                  )}
                </ListItem>
              ))}
            </List>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setDetailsOpen(true)}
              >
                View Complete Details
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Status Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ScheduleIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">Application Timeline</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Submitted: {new Date(applicationData?.submitted_at).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Last Updated: {new Date(applicationData?.updated_at || applicationData?.submitted_at).toLocaleDateString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaymentIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">Loan Amount</Typography>
              </Box>
              <Typography variant="h4">
                {formatCurrency(applicationData?.loan_amount)}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Purpose: {applicationData?.loan_purpose}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NotificationIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">Next Steps</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                {getNextSteps()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ApplicationDetails
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        applicationData={applicationData}
        statusHistory={statusHistory}
      />
    </Container>
  );
} 