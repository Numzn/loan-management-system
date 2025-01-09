import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { LOAN_TYPES } from '../../constants/loanTypes';
import { formatCurrency } from '../../utils/formatters';

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

export default function LoanSpecificDetailsForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loanType, calculatedResults, personalDetails } = location.state || {};

  const [formData, setFormData] = useState({
    // Employment Details
    employmentType: '',
    employerName: '',
    employmentDuration: '',
    monthlyNetSalary: '',
    jobTitle: '',
    employerAddress: '',
    supervisorName: '',
    supervisorContact: '',

    // GRZ Specific
    employeeNumber: '',
    department: '',
    gradeLevel: '',
    yearsInService: '',

    // Business Specific
    businessName: '',
    businessType: '',
    businessRegistrationNumber: '',
    tradingLicenseNumber: '',
    annualTurnover: '',
    yearsInBusiness: '',

    // Banking Details
    bankName: '',
    bankBranch: '',
    accountNumber: '',
    accountType: '',
    accountDuration: '',

    // Next of Kin
    nextOfKinName: '',
    nextOfKinRelation: '',
    nextOfKinPhone: '',
    nextOfKinAddress: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Common validations
    if (!formData.employmentType) newErrors.employmentType = 'Employment type is required';
    if (!formData.employerName) newErrors.employerName = 'Employer name is required';

    // Banking details validation
    if (!formData.bankName) newErrors.bankName = 'Bank name is required';
    if (!formData.accountNumber) newErrors.accountNumber = 'Account number is required';

    // Next of kin validation
    if (!formData.nextOfKinName) newErrors.nextOfKinName = 'Next of kin name is required';
    if (!formData.nextOfKinPhone) newErrors.nextOfKinPhone = 'Next of kin phone is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
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
  };

  const handleNext = () => {
    // Log for debugging
    console.log('Next button clicked');
    console.log('Form data:', formData);

    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    try {
      const applicationData = {
        ...location.state,
        loanSpecificDetails: formData
      };

      // Log the data being saved
      console.log('Saving application data:', applicationData);

      // Save to session storage
      sessionStorage.setItem('loanApplication', JSON.stringify(applicationData));

      // Navigate to documents page
      navigate('/loan-documents', { 
        state: applicationData,
        replace: true // Add this to ensure proper navigation
      });
    } catch (error) {
      console.error('Navigation error:', error);
      setErrors(prev => ({
        ...prev,
        general: 'Failed to proceed. Please try again.'
      }));
    }
  };

  const renderLoanSpecificFields = () => {
    switch (loanType) {
      case 'GRZ':
        return (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Employee Number"
                name="employeeNumber"
                value={formData.employeeNumber}
                onChange={handleChange}
                error={!!errors.employeeNumber}
                helperText={errors.employeeNumber}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                error={!!errors.department}
                helperText={errors.department}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Grade Level"
                name="gradeLevel"
                value={formData.gradeLevel}
                onChange={handleChange}
                error={!!errors.gradeLevel}
                helperText={errors.gradeLevel}
              />
            </Grid>
          </>
        );

      case 'BUSINESS':
        return (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Business Name"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                error={!!errors.businessName}
                helperText={errors.businessName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Business Registration Number"
                name="businessRegistrationNumber"
                value={formData.businessRegistrationNumber}
                onChange={handleChange}
                error={!!errors.businessRegistrationNumber}
                helperText={errors.businessRegistrationNumber}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Trading License Number"
                name="tradingLicenseNumber"
                value={formData.tradingLicenseNumber}
                onChange={handleChange}
                error={!!errors.tradingLicenseNumber}
                helperText={errors.tradingLicenseNumber}
              />
            </Grid>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Progress Bar */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Step 3 of 4: Additional Details
        </Typography>
        <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
          <Box sx={{ width: '75%', height: '100%', bgcolor: 'primary.main', borderRadius: 1 }} />
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Employment Details
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!errors.employmentType}>
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

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Employer Name"
                  name="employerName"
                  value={formData.employerName}
                  onChange={handleChange}
                  error={!!errors.employerName}
                  helperText={errors.employerName}
                />
              </Grid>

              {renderLoanSpecificFields()}

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Banking Details
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!errors.bankName}>
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

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Account Number"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  error={!!errors.accountNumber}
                  helperText={errors.accountNumber}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Next of Kin Details
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Next of Kin Name"
                  name="nextOfKinName"
                  value={formData.nextOfKinName}
                  onChange={handleChange}
                  error={!!errors.nextOfKinName}
                  helperText={errors.nextOfKinName}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Relationship"
                  name="nextOfKinRelation"
                  value={formData.nextOfKinRelation}
                  onChange={handleChange}
                  error={!!errors.nextOfKinRelation}
                  helperText={errors.nextOfKinRelation}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Next of Kin Phone"
                  name="nextOfKinPhone"
                  value={formData.nextOfKinPhone}
                  onChange={handleChange}
                  error={!!errors.nextOfKinPhone}
                  helperText={errors.nextOfKinPhone}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => navigate(-1)}>
                Back
              </Button>
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Loan Summary
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography color="textSecondary">Amount:</Typography>
              <Typography variant="h6">
                {formatCurrency(calculatedResults?.loanAmount)}
              </Typography>
              <Typography color="textSecondary" sx={{ mt: 2 }}>
                Monthly Payment:
              </Typography>
              <Typography variant="h6">
                {formatCurrency(calculatedResults?.monthlyPayment)}
              </Typography>
              <Typography color="textSecondary" sx={{ mt: 2 }}>
                Duration:
              </Typography>
              <Typography variant="h6">
                {calculatedResults?.duration} months
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 