import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { authService } from '../services/authService';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';

export default function LoanReview({ formData, onSubmit }) {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authService.getSession();
        if (!session) {
          // Save current path and form data to redirect back after auth
          navigate('/auth', { 
            state: { 
              from: '/loan-review',
              formData 
            }
          });
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setError('Authentication error. Please try again.');
      }
    };

    if (!userLoading && !user) {
      checkAuth();
    }
  }, [user, userLoading, navigate, formData]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // Get fresh session before submission
      const session = await authService.getSession();
      if (!session) {
        throw new Error('Authentication session expired. Please log in again.');
      }

      await onSubmit(formData);
      navigate('/application-submitted', { 
        state: { applicationData: formData }
      });
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to submit application. Please try again.');
      
      // If session expired, redirect to auth
      if (err.message.includes('session')) {
        navigate('/auth', { 
          state: { 
            from: '/loan-review',
            formData 
          }
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (userLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Review Your Application
        </Typography>

        {/* Display form data summary */}
        <Box sx={{ my: 3 }}>
          {/* Add your form summary display here */}
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          sx={{ mt: 2 }}
        >
          {submitting ? <CircularProgress size={24} /> : 'Submit Application'}
        </Button>
      </Box>
    </motion.div>
  );
} 