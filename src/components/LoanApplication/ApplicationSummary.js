import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import { StyledCard } from '../../theme/components';

const SummaryItem = ({ label, value }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="body2" color="text.secondary" gutterBottom>
      {label}
    </Typography>
    <Typography variant="body1" color="#002044" fontWeight={500}>
      {value}
    </Typography>
  </Box>
);

const ApplicationSummary = ({ application }) => {
  // This would come from your application context/props
  const applicationData = application || {
    applicationId: 'LA-2024-001',
    applicantName: 'John Doe',
    loanType: 'Personal Loan',
    loanAmount: '$25,000',
    loanTerm: '36 months',
    interestRate: '8.5%',
    monthlyPayment: '$789.45',
    applicationDate: '2024-03-15',
    status: 'Under Review',
    purpose: 'Home Renovation',
    employmentStatus: 'Full-time employed',
    annualIncome: '$75,000',
  };

  return (
    <StyledCard>
      <Box sx={{ p: 3 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Typography variant="h6" color="#002044" gutterBottom>
            Application Summary
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" color="#002044" gutterBottom>
                    Application Details
                  </Typography>
                  <SummaryItem label="Application ID" value={applicationData.applicationId} />
                  <SummaryItem label="Application Date" value={applicationData.applicationDate} />
                  <SummaryItem label="Status" value={applicationData.status} />
                  <SummaryItem label="Purpose" value={applicationData.purpose} />
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box>
                  <Typography variant="subtitle1" color="#002044" gutterBottom>
                    Personal Information
                  </Typography>
                  <SummaryItem label="Applicant Name" value={applicationData.applicantName} />
                  <SummaryItem label="Employment Status" value={applicationData.employmentStatus} />
                  <SummaryItem label="Annual Income" value={applicationData.annualIncome} />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" color="#002044" gutterBottom>
                    Loan Details
                  </Typography>
                  <SummaryItem label="Loan Type" value={applicationData.loanType} />
                  <SummaryItem label="Loan Amount" value={applicationData.loanAmount} />
                  <SummaryItem label="Loan Term" value={applicationData.loanTerm} />
                  <SummaryItem label="Interest Rate" value={applicationData.interestRate} />
                  <SummaryItem label="Monthly Payment" value={applicationData.monthlyPayment} />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </motion.div>
      </Box>
    </StyledCard>
  );
};

export default ApplicationSummary; 