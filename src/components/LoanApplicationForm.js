import React, { useState } from 'react';
import { useAuth, useDocumentUpload } from '../hooks/useSupabase';
import { TextField, Button, Box, Typography, CircularProgress } from '@mui/material';

export default function LoanApplicationForm() {
  const { user } = useAuth();
  const [applicationId, setApplicationId] = useState(null);
  const { uploadDocument, uploading, error } = useDocumentUpload(applicationId);
  const [formData, setFormData] = useState({
    applicant_name: '',
    loan_amount: '',
    loan_purpose: '',
    monthly_income: '',
    employment_type: '',
    employer_name: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = async (e) => {
    if (!applicationId) return;

    const file = e.target.files[0];
    if (!file) return;

    try {
      await uploadDocument(file, 'income_proof');
      // Show success message
    } catch (err) {
      // Handle error
      console.error('Upload failed:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Create application
      const { data, error } = await supabase
        .from('loan_applications')
        .insert([{
          ...formData,
          user_id: user.id,
          status: 'draft'
        }])
        .select()
        .single();

      if (error) throw error;

      setApplicationId(data.id);
      // Show success message
    } catch (err) {
      // Handle error
      console.error('Submission failed:', err);
    }
  };

  if (!user) {
    return <Typography>Please log in to submit a loan application</Typography>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Loan Application
      </Typography>

      <TextField
        fullWidth
        label="Full Name"
        name="applicant_name"
        value={formData.applicant_name}
        onChange={handleInputChange}
        margin="normal"
        required
      />

      <TextField
        fullWidth
        label="Loan Amount"
        name="loan_amount"
        type="number"
        value={formData.loan_amount}
        onChange={handleInputChange}
        margin="normal"
        required
      />

      <TextField
        fullWidth
        label="Loan Purpose"
        name="loan_purpose"
        value={formData.loan_purpose}
        onChange={handleInputChange}
        margin="normal"
        required
        multiline
        rows={3}
      />

      <TextField
        fullWidth
        label="Monthly Income"
        name="monthly_income"
        type="number"
        value={formData.monthly_income}
        onChange={handleInputChange}
        margin="normal"
        required
      />

      <TextField
        fullWidth
        label="Employment Type"
        name="employment_type"
        value={formData.employment_type}
        onChange={handleInputChange}
        margin="normal"
        required
      />

      <TextField
        fullWidth
        label="Employer Name"
        name="employer_name"
        value={formData.employer_name}
        onChange={handleInputChange}
        margin="normal"
        required
      />

      {applicationId && (
        <Box mt={2}>
          <Typography variant="subtitle1" gutterBottom>
            Upload Documents
          </Typography>
          <input
            accept="application/pdf,image/*"
            style={{ display: 'none' }}
            id="document-upload"
            type="file"
            onChange={handleFileUpload}
          />
          <label htmlFor="document-upload">
            <Button
              variant="outlined"
              component="span"
              disabled={uploading}
            >
              {uploading ? <CircularProgress size={24} /> : 'Upload Income Proof'}
            </Button>
          </label>
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error.message}
        </Typography>
      )}

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 3 }}
        disabled={uploading}
      >
        Submit Application
      </Button>
    </Box>
  );
} 