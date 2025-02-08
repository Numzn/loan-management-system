import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { testConnection } from '../utils/supabaseClient';

const ConnectionTest = () => {
  const [status, setStatus] = useState({ loading: false, result: null });

  const runTest = async () => {
    setStatus({ loading: true, result: null });
    try {
      const result = await testConnection();
      setStatus({ loading: false, result });
      
      if (result.success) {
        console.log('Connection successful:', result);
      } else {
        console.warn('Connection failed:', result);
      }
    } catch (error) {
      console.error('Test error:', error);
      setStatus({ 
        loading: false, 
        result: { 
          success: false, 
          error: error.message 
        } 
      });
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Database Connection Test
      </Typography>
      
      {status.loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={20} />
          <Typography>Testing connection...</Typography>
        </Box>
      )}

      {status.result && (
        <Box sx={{ mt: 2 }}>
          <Alert severity={status.result.success ? "success" : "error"}>
            {status.result.success ? (
              <>
                <Typography variant="body1">
                  {status.result.message}
                </Typography>
                {status.result.details && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Tables found: {status.result.details.tables?.join(', ')}
                  </Typography>
                )}
              </>
            ) : (
              <>
                <Typography variant="body1">
                  {status.result.error}
                </Typography>
                {status.result.details && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {status.result.details.action}
                  </Typography>
                )}
              </>
            )}
          </Alert>
        </Box>
      )}

      <Button 
        variant="contained" 
        onClick={runTest} 
        disabled={status.loading}
        sx={{ mt: 2 }}
      >
        Test Connection Again
      </Button>
    </Box>
  );
};

export default ConnectionTest; 