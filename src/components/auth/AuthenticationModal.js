import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';

export default function AuthenticationModal({ 
  open, 
  onClose, 
  email, 
  onSuccess 
}) {
  const location = useLocation();
  const [step, setStep] = useState('SEND_OTP');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    let timer;
    if (step === 'VERIFY_OTP' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    if (countdown === 0) {
      setResendEnabled(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendOTP = async () => {
    setLoading(true);
    try {
      await authService.sendOTP(email);
      setStep('VERIFY_OTP');
      setCountdown(30);
      setResendEnabled(false);
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      const isValid = await authService.verifyOTP(otp);
      if (isValid) {
        // Get the redirect path and form data from location state
        const { from, formData } = location.state || {};
        onSuccess(formData);
        
        // Close the modal after successful verification
        onClose();
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Authentication Required
      </DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {step === 'SEND_OTP' ? (
            <>
              <Typography gutterBottom>
                We'll send a verification code to:
              </Typography>
              <Typography variant="h6" gutterBottom>
                {email}
              </Typography>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSendOTP}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Send OTP'}
              </Button>
            </>
          ) : (
            <>
              <TextField
                fullWidth
                label="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                fullWidth
                variant="contained"
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                sx={{ mb: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
              </Button>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  disabled={!resendEnabled}
                  onClick={handleSendOTP}
                >
                  {resendEnabled ? 'Resend OTP' : `Resend in ${countdown}s`}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
} 