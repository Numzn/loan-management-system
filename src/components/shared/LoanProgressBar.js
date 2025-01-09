import { Box, Typography, LinearProgress } from '@mui/material';

const STEPS = [
  { step: 1, label: 'Calculate Loan', path: '/calculator' },
  { step: 2, label: 'Personal Details', path: '/loan-details' },
  { step: 3, label: 'Loan Details', path: '/loan-specific-details' },
  { step: 4, label: 'Documents', path: '/loan-documents' },
  { step: 5, label: 'Review & Submit', path: '/loan-review' }
];

export default function LoanProgressBar({ currentStep }) {
  const progress = (currentStep / STEPS.length) * 100;

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle1">
          Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1]?.label}
        </Typography>
        <Typography variant="subtitle1" color="primary">
          {progress}% Complete
        </Typography>
      </Box>
      <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8, position: 'relative' }}>
        <Box 
          sx={{ 
            width: `${progress}%`, 
            height: '100%', 
            bgcolor: 'primary.main', 
            borderRadius: 1,
            transition: 'width 0.5s ease-in-out'
          }} 
        />
      </Box>
    </Box>
  );
} 