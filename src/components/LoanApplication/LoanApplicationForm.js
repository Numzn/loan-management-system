import { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useLoanApplication } from '../../hooks/useLoanApplication';
import { LOAN_TYPES } from '../../constants/loanTypes';
import {
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  Box,
  Typography,
  Grid
} from '@mui/material';
import DocumentUpload from '../documents/DocumentUpload';

const validationSchema = Yup.object({
  loanType: Yup.string().required('Loan type is required'),
  amount: Yup.number()
    .required('Amount is required')
    .positive('Amount must be positive'),
  duration: Yup.number()
    .required('Duration is required')
    .positive('Duration must be positive'),
  purpose: Yup.string().required('Loan purpose is required'),
  employmentStatus: Yup.string().required('Employment status is required'),
  monthlyIncome: Yup.number()
    .required('Monthly income is required')
    .positive('Monthly income must be positive')
});

export default function LoanApplicationForm() {
  const [activeStep, setActiveStep] = useState(0);
  const [documents, setDocuments] = useState([]);
  const { submitLoanApplication, loading } = useLoanApplication();

  const steps = [
    'Loan Details',
    'Personal Information',
    'Documents Upload',
    'Review & Submit'
  ];

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (values) => {
    try {
      await submitLoanApplication(values, documents);
      // Handle success - redirect to dashboard
    } catch (error) {
      // Handle error
    }
  };

  const renderStepContent = (step, formikProps) => {
    const { values, errors, touched, handleChange } = formikProps;

    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                name="loanType"
                label="Loan Type"
                value={values.loanType}
                onChange={handleChange}
                error={touched.loanType && Boolean(errors.loanType)}
                helperText={touched.loanType && errors.loanType}
              >
                {Object.values(LOAN_TYPES).map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="amount"
                label="Loan Amount"
                type="number"
                value={values.amount}
                onChange={handleChange}
                error={touched.amount && Boolean(errors.amount)}
                helperText={touched.amount && errors.amount}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="duration"
                label="Duration (months)"
                type="number"
                value={values.duration}
                onChange={handleChange}
                error={touched.duration && Boolean(errors.duration)}
                helperText={touched.duration && errors.duration}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="purpose"
                label="Loan Purpose"
                multiline
                rows={4}
                value={values.purpose}
                onChange={handleChange}
                error={touched.purpose && Boolean(errors.purpose)}
                helperText={touched.purpose && errors.purpose}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="employmentStatus"
                label="Employment Status"
                value={values.employmentStatus}
                onChange={handleChange}
                error={touched.employmentStatus && Boolean(errors.employmentStatus)}
                helperText={touched.employmentStatus && errors.employmentStatus}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="monthlyIncome"
                label="Monthly Income"
                type="number"
                value={values.monthlyIncome}
                onChange={handleChange}
                error={touched.monthlyIncome && Boolean(errors.monthlyIncome)}
                helperText={touched.monthlyIncome && errors.monthlyIncome}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <DocumentUpload
            requiredDocuments={LOAN_TYPES[values.loanType]?.requiredDocuments || []}
            documents={documents}
            setDocuments={setDocuments}
          />
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6">Review Your Application</Typography>
            {/* Add summary of application details */}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Formik
        initialValues={{
          loanType: '',
          amount: '',
          duration: '',
          purpose: '',
          employmentStatus: '',
          monthlyIncome: ''
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formikProps) => (
          <Form>
            {renderStepContent(activeStep, formikProps)}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Back
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  type="submit"
                  disabled={loading}
                >
                  Submit Application
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
} 