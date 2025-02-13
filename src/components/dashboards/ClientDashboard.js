import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container, Grid, Paper, Typography, Box, Alert,
  Card, CardContent, LinearProgress, Chip, Avatar,
  List, ListItem, ListItemIcon, ListItemText,
  Divider, IconButton, Tooltip
} from '@mui/material';
import {
  AccountBalance as LoanIcon,
  Schedule as ScheduleIcon,
  Payment as PaymentIcon,
  Notifications as NotificationIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  Description as DocumentIcon,
  AccessTime as TimeIcon
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
  const navigate = useNavigate();
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

        // Get application ID from various sources
        let applicationId = location.state?.applicationData?.id;
        if (!applicationId) {
          const urlParams = new URLSearchParams(window.location.search);
          applicationId = urlParams.get('application');
        }
        if (!applicationId) {
          const savedApp = sessionStorage.getItem('currentApplication');
          if (savedApp) {
            const parsedApp = JSON.parse(savedApp);
            applicationId = parsedApp.id;
          }
        }

        if (!applicationId) {
          throw new Error('No application ID found');
        }

        // Fetch application data with documents
        const { data: application, error: applicationError } = await supabase
          .from(TABLES.LOAN_APPLICATIONS)
          .select(`
            *,
            loan_documents (
              id,
              document_type,
              file_name,
              file_path,
              uploaded_at
            )
          `)
          .eq('id', applicationId)
          .single();

        if (applicationError) throw applicationError;

        // Fetch status history
        const { data: history, error: historyError } = await supabase
          .from(TABLES.LOAN_STATUS_HISTORY)
          .select(`
            id,
            status,
            notes,
            created_at
          `)
          .eq('loan_application_id', applicationId)
          .order('created_at', { ascending: true });

        if (historyError) throw historyError;

        setApplicationData(application);
        setStatusHistory(history || []);
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
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          Loading your application...
        </Typography>
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
      {/* Success Message */}
      {location.state?.message && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {location.state.message}
        </Alert>
      )}

      {/* Header Section */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LoanIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="h5" gutterBottom>
                  Loan Application #{applicationData?.application_id}
                </Typography>
                <Chip 
                  label={applicationData?.status?.replace('_', ' ').toUpperCase()}
                  color={STATUS_COLORS[applicationData?.status] || 'default'}
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={STATUS_PROGRESS[applicationData?.status] || 0}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Paper>
        </Grid>

        {/* Loan Details Card */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Loan Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Amount</Typography>
                  <Typography variant="h5">
                    {formatCurrency(applicationData?.loan_amount)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Duration</Typography>
                  <Typography variant="h5">
                    {applicationData?.duration_months} Months
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Monthly Payment</Typography>
                  <Typography variant="h5">
                    {formatCurrency(applicationData?.monthly_payment)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Interest Rate</Typography>
                  <Typography variant="h5">
                    {applicationData?.interest_rate}%
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Status Timeline Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Application Timeline
              </Typography>
              <List>
                {statusHistory.map((status, index) => (
                  <ListItem key={status.id} sx={{ py: 1 }}>
                    <ListItemIcon>
                      <TimeIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={status.status.replace('_', ' ').toUpperCase()}
                      secondary={new Date(status.created_at).toLocaleDateString()}
                    />
                    {index < statusHistory.length - 1 && (
                      <ArrowForwardIcon sx={{ color: 'action.disabled' }} />
                    )}
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Documents Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Submitted Documents
            </Typography>
            <Grid container spacing={2}>
              {applicationData?.loan_documents?.map((doc) => (
                <Grid item xs={12} sm={6} md={4} key={doc.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <DocumentIcon sx={{ mr: 1 }} />
                        <Typography variant="subtitle1">
                          {doc.document_type.replace('_', ' ')}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="textSecondary">
                        {doc.file_name}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Application Details Dialog */}
      <ApplicationDetails
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        applicationData={applicationData}
        statusHistory={statusHistory}
      />
    </Container>
  );
} 