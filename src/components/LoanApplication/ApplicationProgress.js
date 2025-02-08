import React from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
} from '@mui/material';
import { motion } from 'framer-motion';
import { StyledCard } from '../../theme/components';

const APPLICATION_STEPS = [
  {
    label: 'Application Submitted',
    description: 'Your loan application has been successfully submitted for review.',
    date: '2024-03-15',
    completed: true,
  },
  {
    label: 'Document Verification',
    description: 'Our team is reviewing your submitted documents.',
    date: '2024-03-16',
    completed: true,
  },
  {
    label: 'Credit Assessment',
    description: 'Credit check and risk assessment in progress.',
    date: '2024-03-17',
    completed: false,
    active: true,
  },
  {
    label: 'Final Review',
    description: 'Final review of your application by our loan committee.',
    date: null,
    completed: false,
  },
  {
    label: 'Loan Decision',
    description: 'Final decision on your loan application.',
    date: null,
    completed: false,
  },
];

const ApplicationProgress = () => {
  const activeStep = APPLICATION_STEPS.findIndex(step => step.active) || 0;

  return (
    <StyledCard>
      <Box sx={{ p: 3 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Typography variant="h6" color="#002044" gutterBottom>
            Application Progress
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {APPLICATION_STEPS.map((step, index) => (
                <Step key={step.label} completed={step.completed}>
                  <StepLabel
                    optional={
                      step.date && (
                        <Typography variant="caption" color="text.secondary">
                          {step.date}
                        </Typography>
                      )
                    }
                    sx={{
                      '& .MuiStepLabel-iconContainer': {
                        '& .MuiStepIcon-root': {
                          color: step.completed ? '#4CAF50' : 
                                 step.active ? '#FD7C07' : 
                                 'rgba(0, 0, 0, 0.38)',
                          '&.Mui-active': {
                            color: '#FD7C07',
                          },
                        },
                      },
                    }}
                  >
                    <Typography 
                      variant="subtitle1" 
                      color={step.active ? '#002044' : 'text.primary'}
                      fontWeight={step.active ? 500 : 400}
                    >
                      {step.label}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {step.description}
                      </Typography>
                    </Box>
                    {step.active && (
                      <Box sx={{ mb: 2 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            borderColor: '#FD7C07',
                            color: '#FD7C07',
                            '&:hover': {
                              borderColor: '#FD7C07',
                              backgroundColor: 'rgba(253, 124, 7, 0.04)',
                            },
                          }}
                        >
                          View Details
                        </Button>
                      </Box>
                    )}
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Box>
        </motion.div>
      </Box>
    </StyledCard>
  );
};

export default ApplicationProgress; 