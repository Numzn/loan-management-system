import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { motion } from 'framer-motion';
import { LOAN_TYPES } from '../../constants/loanTypes';
import { formatCurrency } from '../../utils/formatters';
import {
  FormCard,
  StyledTextField,
  PrimaryButton,
  SecondaryButton,
  StyledCard,
  fadeInUp,
} from '../../theme/components';

const CALCULATOR_CONSTANTS = {
  SERVICE_FEE_RATE: 0.05,
  INTEREST_RATES: {
    SALARY_ADVANCE: 0.20,
    GRZ: 0.04,
    PERSONAL: 0.07,
    BUSINESS: 0.07
  }
};

export default function LoanCalculator() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loanType: urlLoanType } = useParams();
  
  // Initialize state with default values or from session storage
  const [formData, setFormData] = useState(() => {
    const savedData = sessionStorage.getItem('loanApplication');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      return {
        loanType: parsed.loanType || '',
        amount: parsed.amount?.toString() || '',
        duration: parsed.duration?.toString() || '',
        interestRate: parsed.interestRate || ''
      };
    }
    return {
      loanType: '',
      amount: '',
      duration: '',
      interestRate: ''
    };
  });
  
  const [calculatedResults, setCalculatedResults] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');

  // Set default values for application flow
  const isApplicationFlow = true; // Remove dependency on location.state
  const currentStep = 1;
  const totalSteps = 7;

  // Initialize loan type from URL or state
  useEffect(() => {
    const preselectedType = location.state?.preselectedType || urlLoanType?.toUpperCase();
    if (preselectedType && LOAN_TYPES[preselectedType] && !formData.loanType) {
      setFormData(prev => ({
        ...prev,
        loanType: preselectedType,
        interestRate: LOAN_TYPES[preselectedType].monthlyInterestRate
      }));
    }
  }, [urlLoanType, location.state?.preselectedType]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      const numericValue = value.replace(/[^0-9.]/g, '');
    if (numericValue.split('.').length > 2) return;
      
    const amount = parseFloat(numericValue);
      const maxAmount = LOAN_TYPES[formData.loanType]?.maxAmount || Infinity;
      
    if (amount > maxAmount) {
      setError(`Maximum amount allowed is ${formatCurrency(maxAmount)}`);
      return;
    }
    
      setError('');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else if (name === 'loanType') {
      const selectedLoan = LOAN_TYPES[value];
      setFormData(prev => ({
        ...prev,
        loanType: value,
        interestRate: selectedLoan?.monthlyInterestRate || ''
      }));
    setError('');
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, [formData.loanType]);

  const handleAmountBlur = useCallback(() => {
    if (formData.amount) {
      const numericValue = parseFloat(formData.amount);
      if (!isNaN(numericValue)) {
        setFormData(prev => ({
          ...prev,
          amount: formatCurrency(numericValue).replace('ZMW', '').trim()
        }));
      }
    }
  }, [formData.amount]);

  const calculateLoan = useCallback(() => {
    if (!formData.loanType || !formData.amount || !formData.duration) return;

    setCalculating(true);
    try {
      // Remove any non-numeric characters except decimal point
      const amount = parseFloat(formData.amount.replace(/[^0-9.]/g, ''));
      if (isNaN(amount)) {
        setError('Please enter a valid amount');
        setCalculating(false);
        return;
      }
      
      const loanConfig = LOAN_TYPES[formData.loanType];
      if (!loanConfig) {
        setError('Invalid loan type selected');
        setCalculating(false);
        return;
      }

      if (amount < loanConfig.minAmount || amount > loanConfig.maxAmount) {
        setError(`Amount must be between ${formatCurrency(loanConfig.minAmount)} and ${formatCurrency(loanConfig.maxAmount)}`);
        setCalculating(false);
        return;
      }

      const months = parseInt(formData.duration);
      if (isNaN(months)) {
        setError('Please select a valid duration');
        setCalculating(false);
        return;
      }

      const interestRate = CALCULATOR_CONSTANTS.INTEREST_RATES[formData.loanType];
      if (typeof interestRate !== 'number') {
        setError('Invalid interest rate for selected loan type');
        setCalculating(false);
        return;
      }

      const serviceFee = amount * CALCULATOR_CONSTANTS.SERVICE_FEE_RATE;
      const amountAfterFee = amount - serviceFee;

      // Calculate monthly payment using the formula: PMT = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
      // where P = principal, r = monthly interest rate, n = number of months
      const monthlyPayment = (amount * interestRate * Math.pow(1 + interestRate, months)) / 
                            (Math.pow(1 + interestRate, months) - 1);
      
      const totalRepayment = monthlyPayment * months;

      // Validate results
      if (isNaN(monthlyPayment) || isNaN(totalRepayment)) {
        setError('Error in calculation. Please check your inputs.');
        setCalculating(false);
        return;
      }

      setCalculatedResults({
        loanAmount: amount,
        serviceFee,
        amountReceived: amountAfterFee,
        monthlyPayment,
        totalRepayment,
        interestRate: interestRate * 100,
        duration: months,
        nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      setError('');
    } catch (err) {
      console.error('Calculation error:', err);
      setError('Error calculating loan details. Please try again.');
    } finally {
      setCalculating(false);
    }
  }, [formData]);

  const handleProceed = useCallback(() => {
    if (!calculatedResults) {
      setError('Please calculate loan details first');
      return;
    }

    const amount = parseFloat(formData.amount.replace(/[^0-9.]/g, ''));
    if (isNaN(amount)) {
      setError('Invalid loan amount');
      return;
    }

    const calculatedData = {
      loanType: formData.loanType,
      amount,
      duration: parseInt(formData.duration),
      calculatedResults: {
        ...calculatedResults,
        loanAmount: amount,
        monthlyPayment: calculatedResults.monthlyPayment,
        totalRepayment: calculatedResults.totalRepayment
      }
    };

    // Save to session storage
    sessionStorage.setItem('loanApplication', JSON.stringify(calculatedData));

    // Navigate to loan details form (first step after calculator)
      navigate('/loan-details', { 
        state: { 
          ...calculatedData,
          step: currentStep + 1,
        totalSteps,
        isApplicationFlow: true
      },
      replace: true
    });
  }, [calculatedResults, formData, navigate]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {isApplicationFlow && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Step {currentStep} of {totalSteps}: Loan Calculation
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

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <FormCard>
          <Typography variant="h4" gutterBottom color="#002044">
          Loan Calculator
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControl fullWidth>
                  <InputLabel id="loan-type-label">Select Loan Type</InputLabel>
              <Select
                    labelId="loan-type-label"
                    id="loan-type"
                    name="loanType"
                    value={formData.loanType}
                    onChange={handleInputChange}
                label="Select Loan Type"
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#E0E0E0',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#FD7C07',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#FD7C07',
                      },
                    }}
                  >
                    {Object.entries(LOAN_TYPES).map(([key, loan]) => (
                      <MenuItem key={key} value={key}>
                        {loan.name}
                      </MenuItem>
                    ))}
              </Select>
            </FormControl>

                <StyledTextField
              fullWidth
              label="Loan Amount (ZMW)"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
              onBlur={handleAmountBlur}
              InputProps={{
                    startAdornment: 'K',
                  }}
                />

                <StyledTextField
                  select
                  fullWidth
                label="Loan Duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                        },
                      },
                    },
                  }}
              >
                {[1, 2, 3, 4, 5, 6, 12, 24, 36, 48, 60].map((months) => (
                  <MenuItem key={months} value={months}>
                    {months} {months === 1 ? 'Month' : 'Months'}
                  </MenuItem>
                ))}
                </StyledTextField>

                <PrimaryButton
              onClick={calculateLoan}
                  disabled={!formData.loanType || !formData.amount || !formData.duration}
                  component={motion.button}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
            >
              Calculate Loan
                </PrimaryButton>
              </Box>
          </Grid>

          {calculatedResults && (
            <Grid item xs={12} md={6}>
                <StyledCard>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom color="#002044">
                    Loan Summary
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography color="textSecondary">Service Fee (5%):</Typography>
                        <Typography variant="h6" color="#002044">
                          {formatCurrency(calculatedResults.serviceFee)}
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography color="textSecondary">Amount to Receive:</Typography>
                        <Typography variant="h6" color="#002044">
                          {formatCurrency(calculatedResults.amountReceived)}
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography color="textSecondary">Monthly Payment:</Typography>
                        <Typography variant="h6" color="#002044">
                          {formatCurrency(calculatedResults.monthlyPayment)}
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography color="textSecondary">Total Repayment:</Typography>
                        <Typography variant="h6" color="#002044">
                          {formatCurrency(calculatedResults.totalRepayment)}
                        </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3 }}>
                      <PrimaryButton
                      fullWidth
                      onClick={handleProceed}
                      startIcon={<ArrowForwardIcon />}
                        component={motion.button}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                      {isApplicationFlow ? 'Continue Application' : 'Proceed with Application'}
                      </PrimaryButton>
                    </Box>
                  </Box>
                </StyledCard>
            </Grid>
          )}
          </Grid>

          {calculating && (
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.8)' 
            }}>
              <CircularProgress sx={{ color: '#fd7c07' }} />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </FormCard>
      </motion.div>
    </Container>
  );
} 