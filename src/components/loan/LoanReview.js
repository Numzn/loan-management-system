import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Container,
  Typography,
  Grid,
  Box,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  InsertDriveFile,
  CheckCircle,
  Description,
  AccountCircle,
  Work,
  ContactPhone,
  AttachFile,
} from '@mui/icons-material';
import { LOAN_TYPES } from '../../constants/loanTypes';
import { formatCurrency } from '../../utils/formatters';
import { StyledCard, PrimaryButton } from '../../theme/components';
import { 
  supabase, 
  TABLES, 
  STORAGE, 
  generateStoragePath,
  handleDatabaseError,
  LOAN_STATUS
} from '../../config/supabaseClient';
import { submitLoanApplication } from './LoanSubmissionHandler';

const SectionTitle = ({ children, icon: Icon }) => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    mb: 3,
    pb: 1,
    borderBottom: '2px solid #fd7c07'
  }}>
    {Icon && <Icon sx={{ mr: 1, color: '#002044' }} />}
    <Typography variant="h6" color="#002044" sx={{ fontWeight: 600 }}>
      {children}
    </Typography>
  </Box>
);

const InfoItem = ({ label, value }) => (
  <Grid item xs={12} sm={6}>
    <Paper elevation={0} sx={{ 
      p: 2, 
      height: '100%',
      backgroundColor: 'rgba(0, 32, 68, 0.02)',
      border: '1px solid rgba(0, 32, 68, 0.1)',
      borderRadius: 1,
      '&:hover': {
        backgroundColor: 'rgba(0, 32, 68, 0.05)',
        transition: 'background-color 0.3s ease'
      }
    }}>
      <Typography color="textSecondary" variant="subtitle2" sx={{ mb: 1 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {value || '-'}
      </Typography>
    </Paper>
  </Grid>
);

const DocumentItem = ({ name, fileName, status }) => (
  <ListItem sx={{ 
    mb: 1,
    backgroundColor: 'rgba(253, 124, 7, 0.05)',
    border: '1px solid rgba(253, 124, 7, 0.2)',
    borderRadius: 1,
    '&:hover': {
      backgroundColor: 'rgba(253, 124, 7, 0.1)',
      transition: 'background-color 0.3s ease'
    }
  }}>
    <ListItemIcon>
      <InsertDriveFile sx={{ color: '#fd7c07' }} />
    </ListItemIcon>
    <ListItemText 
      primary={name}
      secondary={
        <React.Fragment>
          <Typography component="span" variant="body2" color="textSecondary">
            {fileName}
          </Typography>
          <br />
          <Typography 
            component="span" 
            variant="body2" 
            sx={{ 
              color: status === 'success' ? '#4caf50' : 
                     status === 'error' ? '#f44336' : 
                     status === 'uploading' ? '#ff9800' : 'textSecondary'
            }}
          >
            {status === 'success' ? 'Upload successful' :
             status === 'error' ? 'Upload failed' :
             status === 'uploading' ? 'Uploading...' : 'Pending upload'}
          </Typography>
        </React.Fragment>
      }
      primaryTypographyProps={{ fontWeight: 500 }}
    />
    {status === 'success' && <CheckCircle sx={{ color: '#4caf50' }} />}
  </ListItem>
);

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const LoanReview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const [documentStatus, setDocumentStatus] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Get application data from session storage or location state
  const applicationData = useMemo(() => {
    const savedData = sessionStorage.getItem('loanApplication');
    return savedData ? JSON.parse(savedData) : location.state;
  }, [location.state]);

  // Initialize application data from location state or session storage
  useEffect(() => {
    try {
      if (!applicationData || !applicationData.loanType) {
        console.error('No loan application data found');
        navigate('/calculator');
        return;
      }
      
      // Log document data when application data is loaded
      if (applicationData.documents) {
        console.log('Loaded application documents:', {
          documentCount: Object.keys(applicationData.documents).length,
          documents: Object.entries(applicationData.documents).map(([type, details]) => ({
            type,
            hasFile: !!details.file,
            fileName: details.fileName,
            fileType: details.file?.type,
            required: details.required
          }))
        });
      }
    } catch (err) {
      console.error('Error loading application data:', err);
      navigate('/calculator');
    }
  }, [applicationData, navigate]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const verifyDocumentUpload = async (storagePath) => {
    try {
      // First check if file exists in storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from(STORAGE.LOAN_DOCUMENTS)
        .list(storagePath.split('/')[0]); // Get the application ID folder

      if (storageError) {
        console.error('Storage check error:', storageError);
        return false;
      }

      // Check if file exists in the folder
      const fileName = storagePath.split('/')[1];
      const fileExists = storageData?.some(file => file.name === fileName);

      if (!fileExists) {
        console.error('File not found in storage:', storagePath);
        return false;
      }

      // Try to get the file metadata
      const { data: metadata, error: metadataError } = await supabase.storage
        .from(STORAGE.LOAN_DOCUMENTS)
        .getPublicUrl(storagePath);

      if (metadataError) {
        console.error('Metadata check error:', metadataError);
        return false;
      }

      console.log('Document verified successfully:', {
        path: storagePath,
        url: metadata?.publicUrl,
        exists: fileExists
      });

      return true;
    } catch (error) {
      console.error('Document verification error:', error);
      return false;
    }
  };

  const uploadDocument = async (docType, docDetails, applicationId) => {
    try {
      // Log the incoming document details
      console.log('Processing document for upload:', {
        docType,
        fileName: docDetails?.fileName,
        fileType: docDetails?.file?.type,
        fileSize: docDetails?.file?.size,
        hasFile: !!docDetails?.file,
        applicationId
      });

      // Map document types to storage categories
      const documentType = docType.toLowerCase().includes('id') ? 'id_proof' :
                          docType.toLowerCase().includes('income') ? 'income_proof' :
                          docType.toLowerCase().includes('bank') ? 'bank_statement' :
                          docType.toLowerCase().includes('additional') ? 'other' : 'other';

      setDocumentStatus(prev => ({
        ...prev,
        [docType]: 'uploading'
      }));

      if (!docDetails?.file) {
        console.error('No file provided for upload:', {
          docType,
          details: docDetails
        });
        throw new Error(`No file provided for ${docType}`);
      }

      // Validate file type
      const allowedTypes = {
        'id_proof': ['image/jpeg', 'image/png', 'application/pdf'],
        'income_proof': ['image/jpeg', 'image/png', 'application/pdf'],
        'bank_statement': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        'other': ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      };

      if (!allowedTypes[documentType]?.includes(docDetails.file.type)) {
        console.error('Invalid file type:', {
          docType,
          fileType: docDetails.file.type,
          allowedTypes: allowedTypes[documentType]
        });
        throw new Error(`Invalid file type for ${docType}. Allowed types: ${allowedTypes[documentType].join(', ')}`);
      }

      // Generate storage path with file type extension
      const fileExtension = docDetails.fileName.split('.').pop();
      const storagePath = `${applicationId}/${documentType}_${Date.now()}.${fileExtension}`;
      
      console.log('Uploading document:', {
        type: documentType,
        fileName: docDetails.fileName,
        storagePath,
        fileSize: docDetails.file.size,
        mimeType: docDetails.file.type
      });

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication required for document upload');
      }

      // Upload file to storage with public read access
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE.LOAN_DOCUMENTS)
        .upload(storagePath, docDetails.file, {
          cacheControl: '3600',
          upsert: true,
          contentType: docDetails.file.type,
          duplex: 'half'
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        // Check if it's a permissions error
        if (uploadError.statusCode === 403) {
          throw new Error('Permission denied. Please ensure you are logged in and try again.');
        }
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      // Get the public URL
      const { data: urlData } = await supabase.storage
        .from(STORAGE.LOAN_DOCUMENTS)
        .getPublicUrl(storagePath);

      setDocumentStatus(prev => ({
        ...prev,
        [docType]: 'success'
      }));

      return {
        document_type: documentType,
        file_path: storagePath,
        file_name: docDetails.fileName,
        uploaded_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Document upload error:', error);
      setDocumentStatus(prev => ({
        ...prev,
        [docType]: 'error'
      }));
      throw error;
    }
  };

  // Update the document verification function
  const verifyUploadedDocuments = async (applicationId) => {
    try {
      // First check the database records
      const { data: documents, error: dbError } = await supabase
        .from(TABLES.LOAN_DOCUMENTS)
        .select('document_type,file_path,file_name,uploaded_at')
        .eq('loan_application_id', applicationId);

      if (dbError) throw dbError;

      // Then verify each document in storage
      const verifiedDocs = await Promise.all(
        documents.map(async (doc) => {
          const exists = await verifyDocumentUpload(doc.file_path);
          return {
            ...doc,
            verified: exists
          };
        })
      );

      console.log('Document verification results:', verifiedDocs);
      return verifiedDocs;
    } catch (error) {
      console.error('Error verifying documents:', error);
      return [];
    }
  };

  const handleConfirmSubmit = () => {
    setShowConfirmDialog(true);
  };

  const handleCancelSubmit = () => {
    setShowConfirmDialog(false);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setShowConfirmDialog(false);

      const result = await submitLoanApplication(applicationData);
      
      // Store application data in session storage
      sessionStorage.setItem('currentApplication', JSON.stringify(result.applicationData));

      // Show success message
      toast.success('Application submitted successfully!');

      // Log navigation attempt
      console.log('Attempting navigation to dashboard with:', result.applicationData);

      // Clear any existing application data
      sessionStorage.removeItem('loanApplication');
      sessionStorage.removeItem('personalDetails');
      sessionStorage.removeItem('loanSpecificDetails');

      // Navigate to client dashboard
      navigate('/client/dashboard', { 
        state: {
          applicationData: result.applicationData,
          message: 'Application submitted successfully!'
        },
        replace: true
      });

    } catch (error) {
      console.error('Submission error:', error);
      setError(error.message || 'Failed to submit application');
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.retryTimeout) {
        clearTimeout(window.retryTimeout);
      }
    };
  }, []);

  if (!applicationData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const { 
    loanType, 
    amount, 
    duration, 
    calculatedResults,
    personalDetails,
    loanSpecificDetails,
    documents 
  } = applicationData;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {isOffline && (
        <Alert 
          severity="warning" 
            sx={{ 
            mb: 3,
            border: '1px solid',
            borderColor: 'warning.main' 
          }}
        >
          You are currently offline. Please check your internet connection to submit your application.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <StyledCard sx={{ 
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #002044 0%, #fd7c07 100%)'
            }
          }}>
            <Box sx={{ 
              p: 4,
              backgroundColor: '#fff',
              backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.9) 2px, transparent 2px), linear-gradient(90deg, rgba(255, 255, 255, 0.9) 2px, transparent 2px)',
              backgroundSize: '50px 50px',
              backgroundPosition: '-2px -2px',
            }}>
              <Typography 
                variant="h4" 
                gutterBottom 
                color="#002044"
                sx={{ 
                  mb: 4,
                  fontWeight: 600,
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: 1
                }}
              >
                Loan Application Review
              </Typography>

              {/* Loan Details Section */}
              <SectionTitle icon={Description}>Loan Details</SectionTitle>
              <Grid container spacing={3}>
                <InfoItem label="Loan Type" value={LOAN_TYPES[loanType]?.name} />
                <InfoItem label="Amount" value={formatCurrency(amount)} />
                <InfoItem label="Duration" value={`${duration} months`} />
                <InfoItem label="Monthly Payment" value={formatCurrency(calculatedResults?.monthlyPayment)} />
                <InfoItem label="Total Repayment" value={formatCurrency(calculatedResults?.totalRepayment)} />
                </Grid>

              <Divider sx={{ my: 4 }} />

              {/* Personal Details Section */}
              <SectionTitle icon={AccountCircle}>Personal Details</SectionTitle>
              <Grid container spacing={3}>
                <InfoItem label="Full Name" value={`${personalDetails?.firstName} ${personalDetails?.lastName}`} />
                <InfoItem label="Gender" value={personalDetails?.gender} />
                <InfoItem label="Date of Birth" value={personalDetails?.dob} />
                <InfoItem label="NRC Number" value={personalDetails?.nrcNumber} />
                <InfoItem label="Phone Number" value={personalDetails?.phoneNumber} />
                <InfoItem label="Email" value={personalDetails?.email} />
                <InfoItem label="Address" value={personalDetails?.address} />
                </Grid>

              <Divider sx={{ my: 4 }} />

              {/* Employment & Banking Details */}
              <SectionTitle icon={Work}>Employment & Banking Details</SectionTitle>
              <Grid container spacing={3}>
                <InfoItem label="Employment Type" value={loanSpecificDetails?.employmentType} />
                <InfoItem label="Employer Name" value={loanSpecificDetails?.employerName} />
                <InfoItem label="Monthly Income" value={formatCurrency(loanSpecificDetails?.monthlyIncome)} />
                <InfoItem label="Bank Name" value={loanSpecificDetails?.bankName} />
                <InfoItem label="Account Number" value={loanSpecificDetails?.accountNumber} />
                </Grid>

              <Divider sx={{ my: 4 }} />

              {/* Next of Kin Details */}
              <SectionTitle icon={ContactPhone}>Next of Kin Details</SectionTitle>
              <Grid container spacing={3}>
                <InfoItem label="Name" value={loanSpecificDetails?.nextOfKinName} />
                <InfoItem label="Phone Number" value={loanSpecificDetails?.nextOfKinPhone} />
                <InfoItem label="Relationship" value={loanSpecificDetails?.nextOfKinRelation} />
                </Grid>

              <Divider sx={{ my: 4 }} />

              {/* Documents Section */}
              <SectionTitle icon={AttachFile}>Uploaded Documents</SectionTitle>
              <List sx={{ mt: 2 }}>
                {documents && Object.entries(documents).map(([docName, docDetails]) => (
                  <DocumentItem 
                    key={docName}
                    name={docName}
                    fileName={docDetails.fileName}
                    status={documentStatus[docName]}
                  />
                ))}
              </List>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Uploading documents: {Math.round(uploadProgress)}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={uploadProgress} 
                    sx={{ 
                      mt: 1,
                      height: 8,
                      borderRadius: 1,
                      backgroundColor: 'rgba(253, 124, 7, 0.2)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#fd7c07'
                      }
                    }}
                  />
                </Box>
              )}

              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mt: 3,
                    border: '1px solid',
                    borderColor: 'error.main'
                  }}
                >
                  {error}
                </Alert>
              )}

              {/* Submit Button */}
              <Box sx={{ 
                mt: 4, 
                pt: 3,
                display: 'flex', 
                justifyContent: 'space-between',
                borderTop: '1px solid rgba(0, 0, 0, 0.12)'
              }}>
                <PrimaryButton 
                  onClick={() => navigate(-1)}
                  sx={{
                    backgroundColor: 'transparent',
                    color: '#002044',
                    border: '1px solid #002044',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 32, 68, 0.05)'
                    }
                  }}
                >
                  Back
                </PrimaryButton>
                <PrimaryButton
                  onClick={handleConfirmSubmit}
                  disabled={isSubmitting || isOffline}
                  sx={{
                    minWidth: 200,
                    '&:disabled': {
                      backgroundColor: 'rgba(253, 124, 7, 0.5)'
                    }
                  }}
                >
                  {isSubmitting ? (
                    <CircularProgress size={24} sx={{ color: '#fff' }} />
                  ) : (
                    'Submit Application'
                  )}
                </PrimaryButton>
              </Box>
            </Box>
          </StyledCard>
        </Grid>

        {/* Summary Card */}
        <Grid item xs={12} md={4}>
          <StyledCard sx={{ 
            position: 'sticky',
            top: 24,
            backgroundColor: '#002044',
            color: '#fff',
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}>
            <Box sx={{ p: 2.5 }}>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  color: '#fff',
                  fontWeight: 600,
                  textAlign: 'center',
                  pb: 1.5,
                  borderBottom: '2px solid #fd7c07'
                }}
              >
                Application Summary
              </Typography>
              
              <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                      Loan Type
                    </Typography>
                    <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                      {LOAN_TYPES[loanType]?.name}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                      Amount
              </Typography>
                    <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                      {formatCurrency(amount)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                      Monthly Payment
                  </Typography>
                    <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                      {formatCurrency(calculatedResults?.monthlyPayment)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                      Duration
                    </Typography>
                    <Typography sx={{ color: '#fff', fontWeight: 500 }}>
                      {duration} months
                  </Typography>
                </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ 
                      mt: 1, 
                      pt: 2, 
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.875rem' }}>
                        Total Repayment
              </Typography>
                      <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '1.25rem' }}>
                        {formatCurrency(calculatedResults?.totalRepayment)}
                            </Typography>
                          </Box>
                  </Grid>
              </Grid>
            </Box>
            </Box>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={handleCancelSubmit}
        aria-labelledby="confirm-dialog-title"
      >
        <DialogTitle id="confirm-dialog-title">
          Confirm Loan Application Submission
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to submit your loan application? Please verify all information is correct.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Loan Amount: {formatCurrency(applicationData.amount)}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Duration: {applicationData.duration} months
            </Typography>
            <Typography variant="subtitle1">
              Monthly Payment: {formatCurrency(applicationData.calculatedResults?.monthlyPayment)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelSubmit} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Confirm Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LoanReview; 