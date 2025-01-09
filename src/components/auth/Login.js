import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { auth, db } from '../../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { setUser, setError } from '../../store/slices/authSlice';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setLocalError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLocalError(''); // Clear any previous errors
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Add retry logic for getting user document
      let retries = 3;
      let userDoc = null;
      
      while (retries > 0 && !userDoc) {
        try {
          const docRef = doc(db, 'users', userCredential.user.uid);
          userDoc = await getDoc(docRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Convert Timestamp to Date
        const userDataWithDate = {
          ...userData,
          createdAt: userData.createdAt?.toDate(),
          updatedAt: userData.updatedAt?.toDate()
        };
        
        dispatch(setUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          ...userDataWithDate
        }));
        
        // Redirect based on user role
        const role = userDataWithDate.role;
        switch (role) {
          case 'CLIENT':
            navigate('/dashboard');
            break;
          case 'LOAN_OFFICER':
            navigate('/officer-dashboard');
            break;
          default:
            navigate('/dashboard');
            }
          } else {
            // If user document doesn't exist, create one
            await setDoc(doc(db, 'users', userCredential.user.uid), {
              email: userCredential.user.email,
              role: 'CLIENT',
              createdAt: new Date()
            });
            navigate('/dashboard');
          }
          break;
        } catch (err) {
          console.warn(`Attempt ${4 - retries}/3 failed:`, err);
          retries--;
          if (retries === 0) {
            throw new Error('Failed to fetch user data after multiple attempts');
          }
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setLocalError(err.message);
      dispatch(setError(err.message));
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography component="h1" variant="h5" align="center">
          Sign In
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => navigate('/register')}
          >
            Don't have an account? Sign Up
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 