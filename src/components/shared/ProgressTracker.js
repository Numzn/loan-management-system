import { Box, Typography, LinearProgress } from '@mui/material';

export const ProgressTracker = ({ currentStep }) => {
  const steps = [
    'Calculate Loan',
    'Personal Details', 
    'Loan Details',
    'Documents',
    'Review'
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle1">
        Step {currentStep} of {steps.length}
      </Typography>
      <LinearProgress 
        variant="determinate" 
        value={(currentStep/steps.length) * 100} 
      />
    </Box>
  );
}; 