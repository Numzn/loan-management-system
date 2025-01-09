import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { auth, db } from '../../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { setUser, setError } from '../../store/slices/authSlice';
import { UserRoles } from '../../constants/roles';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const defaultRole = location.state?.role || UserRoles.CLIENT;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: defaultRole,
    companyName: '',
    companyRegistration: ''
  });
  const [error, setLocalError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setLocalError("Passwords don't match");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        createdAt: new Date(),
        ...(formData.role === UserRoles.BUSINESS && {
          companyName: formData.companyName,
          companyRegistration: formData.companyRegistration
        })
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);

      dispatch(setUser({
        uid: userCredential.user.uid,
        ...userData
      }));

      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.message);
      dispatch(setError(err.message));
    }
  };

  const isBusinessAccount = formData.role === UserRoles.BUSINESS;

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography component="h1" variant="h5" align="center">
          Sign Up
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleRegister} sx={{ mt: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="firstName"
            label="First Name"
            autoComplete="given-name"
            autoFocus
            value={formData.firstName}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="lastName"
            label="Last Name"
            autoComplete="family-name"
            value={formData.lastName}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="email"
            label="Email Address"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="phone"
            label="Phone Number"
            autoComplete="tel"
            value={formData.phone}
            onChange={handleChange}
          />

          {isBusinessAccount && (
            <>
              <TextField
                margin="normal"
                required
                fullWidth
                name="companyName"
                label="Company Name"
                value={formData.companyName}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="companyRegistration"
                label="Company Registration Number"
                value={formData.companyRegistration}
                onChange={handleChange}
              />
            </>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => navigate('/login')}
          >
            Already have an account? Sign In
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 