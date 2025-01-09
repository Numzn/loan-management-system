import React from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import PropTypes from 'prop-types';

export const LoadingState = ({ 
  message = 'Loading...', 
  size = 40,
  height = '200px',
  variant = 'default',
  showBackground = false
}) => {
  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: height,
    ...(showBackground && {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000
    })
  };

  const content = (
    <>
      <CircularProgress size={size} />
      {message && (
        <Typography 
          variant="body1" 
          sx={{ mt: 2, color: 'text.secondary' }}
        >
          {message}
        </Typography>
      )}
    </>
  );

  if (variant === 'overlay') {
    return (
      <Box sx={containerStyles}>
        {content}
      </Box>
    );
  }

  return (
    <Paper 
      elevation={showBackground ? 1 : 0} 
      sx={{ 
        p: 3, 
        backgroundColor: showBackground ? 'background.paper' : 'transparent'
      }}
    >
      <Box sx={containerStyles}>
        {content}
      </Box>
    </Paper>
  );
};

LoadingState.propTypes = {
  message: PropTypes.string,
  size: PropTypes.number,
  height: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'overlay']),
  showBackground: PropTypes.bool
};

export default LoadingState; 