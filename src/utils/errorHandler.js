import { toast } from 'react-toastify';

export const handleApiError = (error, customMessage = '') => {
  let errorMessage = 'An unexpected error occurred';
  
  if (error.response) {
    // Handle different HTTP status codes
    switch (error.response.status) {
      case 400:
        errorMessage = 'Invalid request. Please check your input.';
        break;
      case 401:
        errorMessage = 'Authentication required. Please login again.';
        break;
      case 403:
        errorMessage = 'You do not have permission to perform this action.';
        break;
      case 404:
        errorMessage = 'The requested resource was not found.';
        break;
      case 500:
        errorMessage = 'Server error. Please try again later.';
        break;
      default:
        errorMessage = error.response.data.message || errorMessage;
    }
  } else if (error.request) {
    errorMessage = 'Network error. Please check your connection.';
  }

  // Log error for debugging
  console.error('API Error:', {
    message: errorMessage,
    originalError: error,
    timestamp: new Date().toISOString()
  });

  // Show toast notification
  toast.error(customMessage || errorMessage);

  return errorMessage;
};

// Utility function to handle Firebase specific errors
export const handleFirebaseError = (error) => {
  let errorMessage = 'Firebase operation failed';

  switch (error.code) {
    case 'auth/user-not-found':
      errorMessage = 'No user found with this email.';
      break;
    case 'auth/wrong-password':
      errorMessage = 'Invalid password.';
      break;
    case 'auth/email-already-in-use':
      errorMessage = 'Email is already registered.';
      break;
    case 'auth/weak-password':
      errorMessage = 'Password should be at least 6 characters.';
      break;
    case 'auth/network-request-failed':
      errorMessage = 'Network error. Please check your connection.';
      break;
    default:
      errorMessage = error.message;
  }

  // Log error
  console.error('Firebase Error:', {
    code: error.code,
    message: errorMessage,
    timestamp: new Date().toISOString()
  });

  toast.error(errorMessage);
  return errorMessage;
};

// Utility function to handle form validation errors
export const handleValidationError = (error) => {
  const errorMessage = error.inner
    .map(err => err.message)
    .join('. ');
    
  toast.error(errorMessage);
  return errorMessage;
}; 