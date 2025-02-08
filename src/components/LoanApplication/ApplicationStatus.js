import React from 'react';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  FormCard,
  PrimaryButton,
  StyledCard,
  fadeInUp,
} from '../../theme/components';

const APPLICATION_STEPS = [
  {
    label: 'Application Submitted',
    description: 'Your loan application has been successfully submitted.',
  },
  {
    label: 'Document Verification',
    description: 'Our team is reviewing your submitted documents.',
  },
  {
    label: 'Credit Assessment',
    description: 'We are assessing your credit worthiness.',
  },
  {
    label: 'Final Review',
    description: 'Final review of your application by our loan committee.',
  },
  {
    label: 'Approval & Disbursement',
    description: 'Loan approval and fund disbursement.',
  },
];

const ApplicationStatus = () => {
  // This would come from your backend/context
  const applicationData = {
    applicationId: 'LOAN-2024-001',
    currentStep: 2,
    loanType: 'Personal Loan',
    amount: 25000,
    duration: 12,
    submissionDate: new Date().toLocaleDateString(),
    estimatedCompletionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    status: 'In Progress',
    nextAction: 'Document verification in progress',
    documents: [
      { name: 'ID Document', status: 'Verified' },
      { name: 'Proof of Income', status: 'Under Review' },
      { name: 'Bank Statements', status: 'Under Review' },
    ],
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <FormCard>
          <Typography variant="h4" gutterBottom color="#002044">
            Application Status
          </Typography>
          
          <Grid container spacing={4}>
            {/* Application Summary */}
            <Grid item xs={12}>
              <StyledCard>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" color="#002044" gutterBottom>
                    Application Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography color="textSecondary">Application ID</Typography>
                      <Typography variant="body1">{applicationData.applicationId}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography color="textSecondary">Loan Type</Typography>
                      <Typography variant="body1">{applicationData.loanType}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography color="textSecondary">Amount</Typography>
                      <Typography variant="body1">K{applicationData.amount.toLocaleString()}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography color="textSecondary">Duration</Typography>
                      <Typography variant="body1">{applicationData.duration} months</Typography>
                    </Grid>
                  </Grid>
                </Box>
              </StyledCard>
            </Grid>

            {/* Progress Stepper */}
            <Grid item xs={12}>
              <StyledCard>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" color="#002044" gutterBottom>
                    Application Progress
                  </Typography>
                  <Stepper activeStep={applicationData.currentStep} alternativeLabel>
                    {APPLICATION_STEPS.map((step, index) => (
                      <Step key={step.label}>
                        <StepLabel>
                          <Typography variant="body2">{step.label}</Typography>
                          {index === applicationData.currentStep && (
                            <Typography variant="caption" color="textSecondary">
                              {step.description}
                            </Typography>
                          )}
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Box>
              </StyledCard>
            </Grid>

            {/* Document Status */}
            <Grid item xs={12} md={6}>
              <StyledCard>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" color="#002044" gutterBottom>
                    Document Status
                  </Typography>
                  {applicationData.documents.map((doc, index) => (
                    <Box key={doc.name} sx={{ mb: 2 }}>
                      <Grid container justifyContent="space-between" alignItems="center">
                        <Grid item>
                          <Typography variant="body1">{doc.name}</Typography>
                        </Grid>
                        <Grid item>
                          <Typography
                            variant="body2"
                            color={doc.status === 'Verified' ? 'success.main' : 'warning.main'}
                          >
                            {doc.status}
                          </Typography>
                        </Grid>
                      </Grid>
                      {index < applicationData.documents.length - 1 && <Divider sx={{ my: 1 }} />}
                    </Box>
                  ))}
                </Box>
              </StyledCard>
            </Grid>

            {/* Timeline */}
            <Grid item xs={12} md={6}>
              <StyledCard>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" color="#002044" gutterBottom>
                    Application Timeline
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography color="textSecondary">Submission Date</Typography>
                      <Typography variant="body1">{applicationData.submissionDate}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography color="textSecondary">Estimated Completion</Typography>
                      <Typography variant="body1">{applicationData.estimatedCompletionDate}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography color="textSecondary">Current Status</Typography>
                      <Typography variant="body1">{applicationData.status}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography color="textSecondary">Next Action</Typography>
                      <Typography variant="body1">{applicationData.nextAction}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              </StyledCard>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <PrimaryButton
                  component={motion.button}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Contact Support
                </PrimaryButton>
                <PrimaryButton
                  component={motion.button}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Upload Additional Documents
                </PrimaryButton>
              </Box>
            </Grid>
          </Grid>
        </FormCard>
      </motion.div>
    </Container>
  );
};

export default ApplicationStatus; 