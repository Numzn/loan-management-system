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

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
];

export default function LoanDetailsForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loanType, calculatedResults } = location.state || {};

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dob: '',
    idNumber: '',
    phoneNumber: '',
    email: '',
    address: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const savedData = sessionStorage.getItem('personalDetails');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    
    // NRC validation
    const nrcPattern = /^\d{6}\/\d{2}\/\d{1}$/;
    if (!formData.idNumber) {
      newErrors.idNumber = 'NRC number is required';
    } else if (!nrcPattern.test(formData.idNumber)) {
      newErrors.idNumber = 'Invalid NRC format (e.g., 000000/00/0)';
    }

    // Phone validation
    const phonePattern = /^09[567]\d{7}$/;
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!phonePattern.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number format (e.g., 097XXXXXXX)';
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailPattern.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.address) newErrors.address = 'Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    sessionStorage.setItem('personalDetails', JSON.stringify(updatedData));
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const formatNRC = (value) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/[^\d]/g, '');
    
    // Format as per NRC pattern (000000/00/0)
    if (numbers.length <= 6) {
      return numbers;
    } else if (numbers.length <= 8) {
      return `${numbers.slice(0, 6)}/${numbers.slice(6)}`;
    } else {
      return `${numbers.slice(0, 6)}/${numbers.slice(6, 8)}/${numbers.slice(8, 9)}`;
    }
  };

  const handleNRCChange = (e) => {
    const { value } = e.target;
    const formattedValue = formatNRC(value);
    setFormData(prev => ({
      ...prev,
      idNumber: formattedValue
    }));
    
    // Clear error when field is modified
    if (errors.idNumber) {
      setErrors(prev => ({
        ...prev,
        idNumber: ''
      }));
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      navigate('/loan-specific-details', {
        state: {
          ...location.state,
          personalDetails: formData
        }
      });
    }
  };

  const validateAge = (dob) => {
    const age = new Date().getFullYear() - new Date(dob).getFullYear();
    return age >= 18 && age <= 65;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Progress Bar */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Step 2 of 4: Personal Details
        </Typography>
        <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
          <Box sx={{ width: '50%', height: '100%', bgcolor: 'primary.main', borderRadius: 1 }} />
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Personal Details
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  id="firstName"
                  name="firstName"
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  id="lastName"
                  name="lastName"
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!errors.gender}>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    label="Gender"
                  >
                    <MenuItem value="" disabled>Select Gender</MenuItem>
                    {genderOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  id="dob"
                  name="dob"
                  label="Date of Birth"
                  type="date"
                  value={formData.dob}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.dob}
                  helperText={errors.dob}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Contact Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  id="idNumber"
                  name="idNumber"
                  label="NRC Number"
                  placeholder="000000/00/0"
                  value={formData.idNumber}
                  onChange={handleNRCChange}
                  error={!!errors.idNumber}
                  helperText={errors.idNumber || 'Format: 000000/00/0'}
                  inputProps={{
                    maxLength: 11 // 6 digits + 2 digits + 1 digit + 2 slashes
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  id="phoneNumber"
                  name="phoneNumber"
                  label="Phone Number"
                  placeholder="097XXXXXXX"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  id="address"
                  name="address"
                  label="Physical Address"
                  placeholder="Enter your current address"
                  multiline
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  error={!!errors.address}
                  helperText={errors.address}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => navigate(-1)}>
                Back
              </Button>
              <Button variant="contained" onClick={handleSubmit}>
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