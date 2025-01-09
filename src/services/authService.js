import { auth } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendEmailVerification
} from 'firebase/auth';

export const authService = {
  // Send OTP via email
  async sendOTP(email) {
    try {
      // Simulate OTP sending
      const otp = Math.floor(100000 + Math.random() * 900000);
      sessionStorage.setItem('currentOTP', otp);
      console.log('OTP:', otp); // In production, this would be sent via email
      return true;
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  },

  // Verify OTP
  verifyOTP(enteredOTP) {
    const storedOTP = sessionStorage.getItem('currentOTP');
    return String(enteredOTP) === String(storedOTP);
  },

  // Check if user exists
  async checkUserExists(email) {
    try {
      const methods = await auth.fetchSignInMethodsForEmail(email);
      return methods.length > 0;
    } catch (error) {
      console.error('Error checking user:', error);
      throw error;
    }
  }
}; 