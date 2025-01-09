import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  Box,
  Divider,
  FormControlLabel,
  Checkbox,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Card,
  CardContent
} from '@mui/material';
import {
  Person as PersonIcon,
  Work as WorkIcon,
  AccountBalance as BankIcon,
  Description as DocumentIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { LOAN_TYPES } from '../../constants/loanTypes';
import { formatCurrency } from '../../utils/formatters';
import { db, storage } from '../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function LoanReview() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    loanType,
    calculatedResults,
    personalDetails,
    loanSpecificDetails,
    documents
  } = location.state || {};

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const passportPhoto = Object.entries(documents || {}).find(
    ([name]) => name.toLowerCase().includes('passport')
  )?.[1];

  const handleSubmit = async () => {
    if (!termsAccepted) {
      setError('Please accept the terms and conditions');
      return;
    }

    setSubmitting(true);
    try {
      // Create application data without database submission
      const applicationData = {
        status: 'UNDER_REVIEW',
        applicationNumber: `LOAN-${Date.now().toString().slice(-4)}`,
        amount: calculatedResults?.loanAmount,
        progress: 25,
        stage: 'Document Verification',
        submittedAt: new Date(),
        loanType,
        calculatedResults,
        personalDetails,
        loanSpecificDetails,
        documents
      };

      // Navigate directly to dashboard
      navigate('/dashboard', {
        replace: true,
        state: {
          message: 'Application submitted successfully!',
          applicationData: applicationData
        }
      });
    } catch (err) {
      console.error('Submission error:', err);
      setError('Failed to proceed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Progress Bar */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Step 5 of 5: Review & Submit
        </Typography>
        <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
          <Box sx={{ width: '100%', height: '100%', bgcolor: 'primary.main', borderRadius: 1 }} />
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            {/* Profile Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={passportPhoto ? URL.createObjectURL(passportPhoto) : undefined}
                sx={{ width: 100, height: 100, mr: 2 }}
              />
              <Box>
                <Typography variant="h5">
                  {personalDetails?.firstName} {personalDetails?.lastName}
                </Typography>
                <Typography color="textSecondary">
                  {personalDetails?.email}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Loan Details & Summary */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Loan Details & Summary
              </Typography>
              <Grid container spacing={2}>
                {/* Basic Loan Details */}
                <Grid item xs={6}>
                  <Typography color="textSecondary">Loan Type:</Typography>
                  <Typography variant="body1">
                    {LOAN_TYPES[loanType]?.name}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Principal Amount:</Typography>
                  <Typography variant="body1">
                    {formatCurrency(calculatedResults?.loanAmount)}
                  </Typography>
                </Grid>

                {/* Service Fee & Net Amount */}
                <Grid item xs={6}>
                  <Typography color="textSecondary">Service Fee:</Typography>
                  <Typography variant="body1">
                    {formatCurrency(calculatedResults?.serviceFee)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Amount to Receive:</Typography>
                  <Typography variant="body1" color="success.main">
                    {formatCurrency(calculatedResults?.amountReceived)}
                  </Typography>
                </Grid>

                {/* Payment Details */}
                <Grid item xs={6}>
                  <Typography color="textSecondary">Duration:</Typography>
                  <Typography variant="body1">
                    {calculatedResults?.duration} months
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Interest Rate:</Typography>
                  <Typography variant="body1">
                    {Number(calculatedResults?.interestRate).toFixed(0)}% per month
                  </Typography>
                </Grid>

                {/* Monthly & Total Payments */}
                <Grid item xs={6}>
                  <Typography color="textSecondary">Monthly Payment:</Typography>
                  <Typography variant="body1" color="primary.main">
                    {formatCurrency(calculatedResults?.monthlyPayment)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Total Repayment:</Typography>
                  <Typography variant="body1" color="primary.main">
                    {formatCurrency(calculatedResults?.totalRepayment)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Personal Details */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon /> Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Full Name:</Typography>
                  <Typography variant="body1">
                    {personalDetails?.firstName} {personalDetails?.lastName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">NRC:</Typography>
                  <Typography variant="body1">{personalDetails?.idNumber}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Phone:</Typography>
                  <Typography variant="body1">{personalDetails?.phoneNumber}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Email:</Typography>
                  <Typography variant="body1">{personalDetails?.email}</Typography>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Employment Details */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WorkIcon /> Employment Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Employment Type:</Typography>
                  <Typography variant="body1">
                    {loanSpecificDetails?.employmentType}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Employer:</Typography>
                  <Typography variant="body1">
                    {loanSpecificDetails?.employerName}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Banking Details */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BankIcon /> Banking Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Bank:</Typography>
                  <Typography variant="body1">
                    {loanSpecificDetails?.bankName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Account Number:</Typography>
                  <Typography variant="body1">
                    {loanSpecificDetails?.accountNumber}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Documents */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Uploaded Documents
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(documents || {}).map(([name, file]) => (
                  <Grid item xs={12} sm={6} key={name}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <DocumentIcon sx={{ mr: 1 }} />
                          <Box>
                            <Typography variant="subtitle2">{name}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {file.name}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Terms and Conditions */}
            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    I confirm that all provided information is accurate and I agree to the terms and conditions
                  </Typography>
                }
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => navigate(-1)}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!termsAccepted || submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 