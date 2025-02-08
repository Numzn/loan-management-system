import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Alert,
  Button,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { StyledCard } from '../../theme/components';

const ApplicationSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    applicationId, 
    applicationData, 
    accountCreated,
    email,
    tempPassword
  } = location.state || {};

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          textAlign="center"
          mb={4}
        >
          <CheckCircleIcon 
            sx={{ 
              fontSize: 80, 
              color: 'success.main',
              mb: 2 
            }} 
          />
          <Typography variant="h4" gutterBottom color="#002044">
            Application Submitted Successfully!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Your application ID is: {applicationId}
          </Typography>
        </Box>

        <StyledCard>
          <Box sx={{ p: 3 }}>
            {accountCreated && (
              <>
                <Alert 
                  severity="info" 
                  sx={{ mb: 3 }}
                >
                  An account has been automatically created for you to track your application
                </Alert>
                <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom color="#002044">
                    Your Account Details
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Email: {email}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Temporary Password: {tempPassword}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Please save these credentials and change your password when you log in
                  </Typography>
                </Box>
                <Divider sx={{ my: 3 }} />
              </>
            )}

            <Typography variant="h6" gutterBottom color="#002044">
              Next Steps
            </Typography>
            <Typography variant="body1" paragraph>
              Our team will review your application and you will be notified of any updates.
              You can track the status of your application in your dashboard.
            </Typography>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => navigate('/dashboard')}
                sx={{
                  bgcolor: '#002044',
                  '&:hover': {
                    bgcolor: '#001835',
                  },
                }}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/')}
                sx={{
                  color: '#002044',
                  borderColor: '#002044',
                  '&:hover': {
                    borderColor: '#001835',
                  },
                }}
              >
                Return Home
              </Button>
            </Box>
          </Box>
        </StyledCard>
      </motion.div>
    </Container>
  );
};

export default ApplicationSuccess; 