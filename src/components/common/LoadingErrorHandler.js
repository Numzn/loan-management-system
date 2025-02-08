import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Button,
} from '@mui/material';
import { motion } from 'framer-motion';
import { ErrorOutline, Refresh } from '@mui/icons-material';

const LoadingErrorHandler = ({ loading, error, onRetry, children }) => {
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CircularProgress
            sx={{
              color: '#FD7C07',
              mb: 2,
            }}
          />
          <Typography variant="body1" color="text.secondary">
            Loading...
          </Typography>
        </motion.div>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          p: 3,
          textAlign: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ErrorOutline
            sx={{
              fontSize: 48,
              color: 'error.main',
              mb: 2,
            }}
          />
          <Typography variant="h6" color="error" gutterBottom>
            Oops! Something went wrong
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {error.message || 'An error occurred while loading the data'}
          </Typography>
          {onRetry && (
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={onRetry}
              sx={{
                borderColor: '#FD7C07',
                color: '#FD7C07',
                '&:hover': {
                  borderColor: '#FD7C07',
                  backgroundColor: 'rgba(253, 124, 7, 0.04)',
                },
              }}
            >
              Try Again
            </Button>
          )}
        </motion.div>
      </Box>
    );
  }

  return children;
};

export default LoadingErrorHandler; 