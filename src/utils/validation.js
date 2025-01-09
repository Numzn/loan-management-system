export const loanValidationSchema = yup.object({
  amount: yup.number()
    .required('Amount is required')
    .positive('Amount must be positive')
    .max(1000000, 'Amount exceeds maximum limit'),
  duration: yup.number()
    .required('Duration is required')
    .min(1, 'Minimum duration is 1 month')
    .max(60, 'Maximum duration is 60 months')
}); 