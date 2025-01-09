import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Container, Grid, Paper, Typography, Box, Alert,
  Card, CardContent, LinearProgress, Chip, Avatar, Button
} from '@mui/material';
import {
  AccountBalance as LoanIcon,
  Schedule as ScheduleIcon,
  Payment as PaymentIcon,
  Notifications as NotificationIcon
} from '@mui/icons-material';
import ApplicationDetails from './ApplicationDetails';

export default function ClientDashboard() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [applicationData, setApplicationData] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    // Get data from URL state or sessionStorage
    const data = location.state?.applicationData || 
                 JSON.parse(sessionStorage.getItem('loanApplication'));
    
    if (data) {
      setApplicationData(data);
    }
    setLoading(false);
  }, [location]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
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
          src={applicationData?.personalDetails?.passportPhotoUrl || '/default-avatar.png'}
          alt={`${applicationData?.personalDetails?.firstName} ${applicationData?.personalDetails?.lastName}`}
          sx={{ 
            width: 80, 
            height: 80, 
            mr: 2,
            border: '2px solid',
            borderColor: 'primary.main'
          }}
        />
        <Box>
          <Typography variant="h4" gutterBottom>
            Welcome Back, {applicationData?.personalDetails?.firstName}
          </Typography>
          <Typography color="textSecondary">
            {applicationData?.personalDetails?.email}
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
                Application #{applicationData?.applicationNumber}
              </Typography>
              <Chip 
                label={applicationData?.status.replace('_', ' ')}
                color="primary"
                size="small"
                sx={{ ml: 2 }}
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography color="textSecondary" gutterBottom>
                Current Stage: {applicationData?.stage}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={applicationData?.progress} 
                sx={{ height: 10, borderRadius: 1 }}
              />
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                {applicationData?.progress}% Complete
              </Typography>
            </Box>
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
                  Submitted: {applicationData?.submittedAt?.toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Estimated Completion: {new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString()}
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
                K{applicationData?.amount?.toLocaleString()}
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
                Our team is reviewing your application. You will be notified of any updates.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ApplicationDetails
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        applicationData={applicationData}
      />
    </Container>
  );
} 