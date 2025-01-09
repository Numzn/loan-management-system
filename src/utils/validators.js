export const validateLoanApplication = (data) => {
  const errors = {};
  
  // Personal Details
  if (!data.personalDetails?.firstName) {
    errors.firstName = 'Required';
  }
  
  // Loan Details
  if (!data.loanSpecificDetails?.employerName) {
    errors.employerName = 'Required';
  }
  
  // Documents
  if (!data.documents || Object.keys(data.documents).length === 0) {
    errors.documents = 'Required documents missing';
  }
  
  return errors;
}; 