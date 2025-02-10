import React, { useEffect, useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { testConnection } from '../utils/supabaseClient';

const SupabaseTest = () => {
  const [status, setStatus] = useState({ loading: true });

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await testConnection();
        setStatus({ loading: false, ...result });
      } catch (error) {
        setStatus({ 
          loading: false, 
          success: false, 
          error: error.message 
        });
      }
    };

    checkConnection();
  }, []);

  if (status.loading) {
    return (
      <Box p={3}>
        <Typography>Testing Supabase connection...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {status.success ? (
        <Alert severity="success">
          Connected to Supabase successfully!
          <pre>
            {JSON.stringify(status.details, null, 2)}
          </pre>
        </Alert>
      ) : (
        <Alert severity="error">
          Connection failed: {status.error}
          <pre>
            {JSON.stringify(status.details, null, 2)}
          </pre>
        </Alert>
      )}
    </Box>
  );
};

export default SupabaseTest; 