import React, { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
} from '@mui/material';
import { LOAN_TYPES } from '../../constants/loanTypes';
import { formatCurrency } from '../../utils/formatters';
import { StyledCard, PrimaryButton } from '../../theme/components';

const ZAMBIAN_BANKS = [
  'AB Bank Zambia',
  'Absa Bank Zambia Plc',
  'Access Bank Zambia Limited',
  'Atlas Mara Bank Zambia Limited',
  'Bank of China Zambia Limited',
  'Citibank Zambia Limited',
  'Ecobank Zambia Limited',
  'First Alliance Bank Zambia Limited',
  'First Capital Bank Zambia Limited',
  'First National Bank (FNB) Zambia Limited',
  'Indo-Zambia Bank Limited',
  'Investrust Bank Zambia Limited',
  'Stanbic Bank Zambia Limited',
  'Standard Chartered Bank Zambia Plc',
  'United Bank for Africa (UBA) Zambia Limited',
  'Zambia Industrial Commercial Bank Limited',
  'Zambia National Commercial Bank (Zanaco) Plc'
];

const employmentTypes = [
  'Full Time',
  'Part Time',
  'Contract',
  'Self Employed',
  'Civil Servant',
  'Other'
];

const LoanSpecificDetailsForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  // Get application data from location state or session storage once on mount
  const [applicationData] = useState(() => {
    return location.state || JSON.parse(sessionStorage.getItem('loanApplication') || '{}');
  });

  // Extract step information from location state
  const { 
    loanType, 
    amount, 
    duration, 
    calculatedResults,
    step: currentStep = 3,
    totalSteps = 7,
    isApplicationFlow = true 
  } = applicationData;

  const [formData, setFormData] = useState({
    employmentType: '',
    employerName: '',
    monthlyIncome: '',
    bankName: '',
    accountNumber: '',
    nextOfKinName: '',
    nextOfKinPhone: '',
    nextOfKinRelation: '',
  });

  // Check for required data once on mount
  useEffect(() => {
    if (!loanType || !calculatedResults) {
      navigate('/calculator');
    }
  }, [loanType, calculatedResults, navigate]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    // Common validations
    if (!formData.employmentType) newErrors.employmentType = 'Employment type is required';
    if (!formData.employerName) newErrors.employerName = 'Employer name is required';
    if (!formData.monthlyIncome) newErrors.monthlyIncome = 'Monthly income is required';

    // Banking details validation
    if (!formData.bankName) newErrors.bankName = 'Bank name is required';
    if (!formData.accountNumber) newErrors.accountNumber = 'Account number is required';

    // Next of kin validation
    if (!formData.nextOfKinName) newErrors.nextOfKinName = 'Next of kin name is required';
    if (!formData.nextOfKinPhone) newErrors.nextOfKinPhone = 'Next of kin phone is required';
    if (!formData.nextOfKinRelation) newErrors.nextOfKinRelation = 'Relationship is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  const handleSubmit = useCallback(() => {
    if (!validateForm()) {
      return;
    }

    // Get existing loan application data
    const existingData = JSON.parse(sessionStorage.getItem('loanApplication') || '{}');
    
    // Merge form data with existing loan application data
    const updatedData = {
      ...existingData,
      loanSpecificDetails: formData
    };

    // Save updated data to session storage
    sessionStorage.setItem('loanApplication', JSON.stringify(updatedData));

    // Navigate to document upload
    navigate('/document-upload', { 
      state: {
        ...updatedData,
        step: currentStep + 1,
        totalSteps,
        isApplicationFlow
      },
      replace: true
    });
  }, [navigate, formData, currentStep, totalSteps, isApplicationFlow, validateForm]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Progress Bar */}
      {isApplicationFlow && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Step {currentStep} of {totalSteps}: Employment & Banking Details
          </Typography>
          <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
            <Box 
              sx={{ 
                width: `${(currentStep / totalSteps) * 100}%`, 
                height: '100%', 
                bgcolor: '#fd7c07', 
                borderRadius: 1 
              }} 
            />
          </Box>
        </Box>
      )}

      <Grid container spacing={3}>
        {/* Form Section */}
        <Grid item xs={12} md={8}>
          <StyledCard>
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom color="#002044">
                Additional Details
              </Typography>

              <Grid container spacing={3}>
                {/* Employment Details */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom color="#002044">
                    Employment Information
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.employmentType}>
                    <InputLabel>Employment Type</InputLabel>
                    <Select
                      name="employmentType"
                      value={formData.employmentType}
                      onChange={handleChange}
                      label="Employment Type"
                    >
                      {employmentTypes.map(type => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Employer Name"
                    name="employerName"
                    value={formData.employerName}
                    onChange={handleChange}
                    error={!!errors.employerName}
                    helperText={errors.employerName}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Monthly Income"
                    name="monthlyIncome"
                    value={formData.monthlyIncome}
                    onChange={handleChange}
                    error={!!errors.monthlyIncome}
                    helperText={errors.monthlyIncome}
                    InputProps={{
                      startAdornment: 'K',
                    }}
                  />
                </Grid>

                {/* Banking Details */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom color="#002044">
                    Banking Information
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.bankName}>
                    <InputLabel>Bank Name</InputLabel>
                    <Select
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      label="Bank Name"
                    >
                      {ZAMBIAN_BANKS.map(bank => (
                        <MenuItem key={bank} value={bank}>{bank}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Account Number"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    error={!!errors.accountNumber}
                    helperText={errors.accountNumber}
                  />
                </Grid>

                {/* Next of Kin Details */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom color="#002044">
                    Next of Kin Information
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Next of Kin Name"
                    name="nextOfKinName"
                    value={formData.nextOfKinName}
                    onChange={handleChange}
                    error={!!errors.nextOfKinName}
                    helperText={errors.nextOfKinName}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Next of Kin Phone"
                    name="nextOfKinPhone"
                    value={formData.nextOfKinPhone}
                    onChange={handleChange}
                    error={!!errors.nextOfKinPhone}
                    helperText={errors.nextOfKinPhone}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Relationship"
                    name="nextOfKinRelation"
                    value={formData.nextOfKinRelation}
                    onChange={handleChange}
                    error={!!errors.nextOfKinRelation}
                    helperText={errors.nextOfKinRelation}
                  />
                </Grid>
              </Grid>

              {errors.general && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {errors.general}
                </Alert>
              )}

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                <PrimaryButton onClick={() => navigate(-1)}>
                  Back
                </PrimaryButton>
                <PrimaryButton onClick={handleSubmit}>
                  Continue
                </PrimaryButton>
              </Box>
            </Box>
          </StyledCard>
        </Grid>

        {/* Summary Section */}
        <Grid item xs={12} md={4}>
          <StyledCard>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom color="#002044">
                Loan Summary
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography color="textSecondary">Loan Type:</Typography>
                <Typography variant="h6" color="#002044">
                  {LOAN_TYPES[loanType]?.name || 'N/A'}
                </Typography>

                <Typography color="textSecondary" sx={{ mt: 2 }}>
                  Amount:
                </Typography>
                <Typography variant="h6" color="#002044">
                  {formatCurrency(amount)}
                </Typography>

                <Typography color="textSecondary" sx={{ mt: 2 }}>
                  Monthly Payment:
                </Typography>
                <Typography variant="h6" color="#002044">
                  {formatCurrency(calculatedResults?.monthlyPayment)}
                </Typography>

                <Typography color="textSecondary" sx={{ mt: 2 }}>
                  Duration:
                </Typography>
                <Typography variant="h6" color="#002044">
                  {duration} months
                </Typography>

                <Typography color="textSecondary" sx={{ mt: 2 }}>
                  Total Repayment:
                </Typography>
                <Typography variant="h6" color="#002044">
                  {formatCurrency(calculatedResults?.totalRepayment)}
                </Typography>
              </Box>
            </Box>
          </StyledCard>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LoanSpecificDetailsForm; 