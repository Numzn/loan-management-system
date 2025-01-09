import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import { LOAN_TYPES } from '../../constants/loanTypes';
import { formatCurrency } from '../../utils/formatters';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { userDataService } from '../../services/userDataService';

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
  const [selectedLoanType, setSelectedLoanType] = useState(location.state?.loanType || '');
  const [loanAmount, setLoanAmount] = useState('');
  const [duration, setDuration] = useState('');
  const [calculatedResults, setCalculatedResults] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const { loanType: urlLoanType } = useParams();
  const preselectedType = location.state?.preselectedType || urlLoanType?.toUpperCase();
  const [interestRate, setInterestRate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (preselectedType && LOAN_TYPES[preselectedType]) {
      setSelectedLoanType(preselectedType);
      const selectedLoan = LOAN_TYPES[preselectedType];
      setInterestRate(selectedLoan.monthlyInterestRate);
    }
  }, [preselectedType]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    if (numericValue.split('.').length > 2) return;
    const amount = parseFloat(numericValue);
    const maxAmount = LOAN_TYPES[selectedLoanType]?.maxAmount || Infinity;
    if (amount > maxAmount) {
      setError(`Maximum amount allowed is ${formatCurrency(maxAmount)}`);
      return;
    }
    
    setLoanAmount(numericValue);
    setError('');
  };

  const handleAmountBlur = () => {
    if (loanAmount) {
      const numericValue = parseFloat(loanAmount);
      if (!isNaN(numericValue)) {
        setLoanAmount(formatCurrency(numericValue).replace('ZMW', '').trim());
      }
    }
  };

  const calculateLoan = async () => {
    if (!selectedLoanType || !loanAmount || !duration) return;

    setCalculating(true);
    try {
      const amount = parseFloat(loanAmount.replace(/[^0-9.]/g, ''));
      
      const loanConfig = LOAN_TYPES[selectedLoanType];
      if (amount < loanConfig.minAmount || amount > loanConfig.maxAmount) {
        alert(`Amount must be between ${formatCurrency(loanConfig.minAmount)} and ${formatCurrency(loanConfig.maxAmount)}`);
        return;
      }

      const months = parseInt(duration);
      const interestRate = CALCULATOR_CONSTANTS.INTEREST_RATES[selectedLoanType];
      const serviceFee = amount * CALCULATOR_CONSTANTS.SERVICE_FEE_RATE;
      const amountAfterFee = amount - serviceFee;

      const monthlyPayment = (amount * interestRate * Math.pow(1 + interestRate, months)) / 
                            (Math.pow(1 + interestRate, months) - 1);
      
      const totalRepayment = monthlyPayment * months;

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
    } catch (error) {
      console.error('Calculation error:', error);
      alert('Error calculating loan details. Please try again.');
    } finally {
      setCalculating(false);
    }
  };

  const handleProceed = () => {
    const amount = parseFloat(loanAmount.replace(/[^0-9.]/g, ''));
    const calculatedData = {
      loanType: selectedLoanType,
      amount,
      duration,
      calculatedResults
    };

    navigate('/loan-details', { 
      state: calculatedData
    });
  };

  const handleLoanTypeChange = (e) => {
    const type = e.target.value;
    setSelectedLoanType(type);
    if (type) {
      const selectedLoan = LOAN_TYPES[type];
      setInterestRate(selectedLoan.monthlyInterestRate);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Step 1 of 4: Loan Calculation
        </Typography>
        <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
          <Box sx={{ width: '25%', height: '100%', bgcolor: 'primary.main', borderRadius: 1 }} />
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Loan Calculator
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Loan Type</InputLabel>
              <Select
                value={selectedLoanType}
                onChange={handleLoanTypeChange}
                label="Select Loan Type"
              >
                <MenuItem value="">--Select--</MenuItem>
                <MenuItem value="SALARY_ADVANCE">Salary Advance</MenuItem>
                <MenuItem value="GRZ">Civil Service</MenuItem>
                <MenuItem value="PERSONAL">Personal</MenuItem>
                <MenuItem value="BUSINESS">Business</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Loan Amount (ZMW)"
              value={loanAmount}
              onChange={handleAmountChange}
              onBlur={handleAmountBlur}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <InputAdornment position="start">K</InputAdornment>,
              }}
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Loan Duration</InputLabel>
              <Select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                label="Loan Duration"
              >
                {[1, 2, 3, 4, 5, 6, 12, 24, 36, 48, 60].map((months) => (
                  <MenuItem key={months} value={months}>
                    {months} {months === 1 ? 'Month' : 'Months'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              fullWidth
              onClick={calculateLoan}
              disabled={!selectedLoanType || !loanAmount || !duration}
            >
              Calculate Loan
            </Button>
          </Grid>

          {calculatedResults && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Loan Summary
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography color="textSecondary">Service Fee (5%):</Typography>
                      <Typography variant="h6">{formatCurrency(calculatedResults.serviceFee)}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography color="textSecondary">Amount to Receive:</Typography>
                      <Typography variant="h6">{formatCurrency(calculatedResults.amountReceived)}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography color="textSecondary">Monthly Payment:</Typography>
                      <Typography variant="h6">{formatCurrency(calculatedResults.monthlyPayment)}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography color="textSecondary">Total Repayment:</Typography>
                      <Typography variant="h6">{formatCurrency(calculatedResults.totalRepayment)}</Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleProceed}
                      startIcon={<ArrowForwardIcon />}
                    >
                      Proceed with Application
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

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
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
        </Grid>
      </Paper>
    </Container>
  );
} 