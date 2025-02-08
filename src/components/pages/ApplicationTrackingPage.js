import React, { useEffect } from 'react';
import { Container, Grid, Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import ApplicationSummary from '../LoanApplication/ApplicationSummary';
import ApplicationProgress from '../LoanApplication/ApplicationProgress';
import DocumentUpload from '../LoanApplication/DocumentUpload';
import ApplicationNotifications from '../LoanApplication/ApplicationNotifications';
import LoadingErrorHandler from '../common/LoadingErrorHandler';
import { useLoanApplication } from '../../context/LoanApplicationContext';
import loanApplicationService from '../../services/loanApplicationService';

const ApplicationTrackingPage = () => {
  const { applicationId } = useParams();
  const { 
    state: { application, loading, error },
    updateApplicationStatus,
    updateDocuments,
    addNotification
  } = useLoanApplication();

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        const data = await loanApplicationService.getApplication(applicationId);
        updateApplicationStatus(data.currentStep, data.status);
        updateDocuments(data.documents);
        
        // Fetch notifications
        const notifications = await loanApplicationService.getNotifications(applicationId);
        notifications.forEach(notification => addNotification(notification));
      } catch (error) {
        console.error('Error fetching application data:', error);
      }
    };

    if (applicationId) {
      fetchApplicationData();
    }
  }, [applicationId]);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <LoadingErrorHandler
      loading={loading}
      error={error}
      onRetry={handleRetry}
    >
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 3 }}>
              <ApplicationSummary application={application} />
            </Box>
            <Box sx={{ mb: 3 }}>
              <DocumentUpload
                documents={application.documents}
                applicationId={applicationId}
                onUpdateDocuments={updateDocuments}
              />
            </Box>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <ApplicationProgress
                currentStep={application.currentStep}
                status={application.status}
              />
            </Box>
            <Box>
              <ApplicationNotifications
                notifications={application.notifications}
                applicationId={applicationId}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </LoadingErrorHandler>
  );
};

export default ApplicationTrackingPage; 