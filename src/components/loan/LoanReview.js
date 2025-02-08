import React, { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  
  const [applicationData, setApplicationData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const [documentStatus, setDocumentStatus] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);

  // Initialize application data from location state or session storage
  useEffect(() => {
    try {
      const data = location.state || JSON.parse(sessionStorage.getItem('loanApplication') || '{}');
      if (!data || !data.loanType) {
        console.error('No loan application data found');
        navigate('/calculator');
        return;
      }
      
      // Log document data when application data is loaded
      if (data.documents) {
        console.log('Loaded application documents:', {
          documentCount: Object.keys(data.documents).length,
          documents: Object.entries(data.documents).map(([type, details]) => ({
            type,
            hasFile: !!details.file,
            fileName: details.fileName,
            fileType: details.file?.type,
            required: details.required
          }))
        });
      }
      
      setApplicationData(data);
    } catch (err) {
      console.error('Error loading application data:', err);
      navigate('/calculator');
    }
  }, [location.state, navigate]);

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

  const handleSubmit = useCallback(async () => {
    if (!applicationData) return;
    
    if (isOffline) {
      setError('You are currently offline. Please check your internet connection and try again.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Generate application ID
      const applicationId = `LOAN-${Date.now().toString().slice(-6)}`;

      // Format the data for Supabase
      const applicationPayload = {
        application_id: applicationId,
        first_name: applicationData.personalDetails?.firstName || '',
        last_name: applicationData.personalDetails?.lastName || '',
        gender: applicationData.personalDetails?.gender || '',
        date_of_birth: applicationData.personalDetails?.dob || null,
        nrc_number: applicationData.personalDetails?.idNumber || '',
        phone_number: applicationData.personalDetails?.phoneNumber || '',
        email: applicationData.personalDetails?.email || '',
        physical_address: applicationData.personalDetails?.address || '',
        loan_type: applicationData.loanType || '',
        loan_amount: parseFloat(applicationData.amount) || 0,
        loan_purpose: applicationData.loanType || '',
        loan_duration: parseInt(applicationData.duration) || 0,
        monthly_payment: parseFloat(applicationData.calculatedResults?.monthlyPayment) || 0,
        total_repayment: parseFloat(applicationData.calculatedResults?.totalRepayment) || 0,
        monthly_income: parseFloat(applicationData.loanSpecificDetails?.monthlyIncome) || 0,
        employment_type: applicationData.loanSpecificDetails?.employmentType || '',
        employer_name: applicationData.loanSpecificDetails?.employerName || '',
        bank_name: applicationData.loanSpecificDetails?.bankName || '',
        account_number: applicationData.loanSpecificDetails?.accountNumber || '',
        next_of_kin_name: applicationData.loanSpecificDetails?.nextOfKinName || '',
        next_of_kin_phone: applicationData.loanSpecificDetails?.nextOfKinPhone || '',
        next_of_kin_relation: applicationData.loanSpecificDetails?.nextOfKinRelation || '',
        status: LOAN_STATUS.DRAFT,
        submitted_at: new Date().toISOString()
      };

      // Update required fields validation
      const requiredFields = {
        first_name: 'First Name',
        last_name: 'Last Name',
        gender: 'Gender',
        date_of_birth: 'Date of Birth',
        nrc_number: 'NRC Number',
        phone_number: 'Phone Number',
        email: 'Email',
        physical_address: 'Physical Address',
        loan_type: 'Loan Type',
        loan_amount: 'Loan Amount',
        loan_purpose: 'Loan Purpose',
        employment_type: 'Employment Type',
        employer_name: 'Employer Name',
        monthly_income: 'Monthly Income',
        bank_name: 'Bank Name',
        account_number: 'Account Number'
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([key]) => !applicationPayload[key])
        .map(([, label]) => label);

      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      // Save application data
      const { data: applicationResult, error: applicationError } = await supabase
        .from(TABLES.LOAN_APPLICATIONS)
        .insert([applicationPayload])
        .select()
        .single();

      if (applicationError) {
        console.error('Application save error:', applicationError);
        throw new Error(handleDatabaseError(applicationError));
      }

      // Save documents if any
      if (applicationData.documents && Object.keys(applicationData.documents).length > 0) {
        const totalDocuments = Object.keys(applicationData.documents).length;
        const documentsWithFiles = Object.entries(applicationData.documents)
          .filter(([, docDetails]) => docDetails.file && docDetails.fileName);

        console.log('Document validation:', {
          total: totalDocuments,
          withFiles: documentsWithFiles.length,
          documents: applicationData.documents
        });

        // Check required documents first
        const requiredDocuments = Object.entries(applicationData.documents)
          .filter(([, details]) => details.required)
          .map(([docType]) => docType);

        const missingRequiredFiles = requiredDocuments.filter(docType => {
          const doc = applicationData.documents[docType];
          return !doc?.file || !doc?.fileName;
        });

        if (missingRequiredFiles.length > 0) {
          throw new Error(`Please upload all required documents: ${missingRequiredFiles.join(', ')}`);
        }

        if (documentsWithFiles.length === 0) {
          console.warn('No documents with files to upload');
          return;
        }

        let uploadedCount = 0;
        const documentPromises = documentsWithFiles
          .map(async ([docType, docDetails]) => {
            try {
              const result = await uploadDocument(docType, docDetails, applicationId);
              if (result) {
                uploadedCount++;
                setUploadProgress((uploadedCount / documentsWithFiles.length) * 100);
                
                return {
                  loan_application_id: applicationResult.id,
                  document_type: result.document_type,
                  file_path: result.file_path,
                  file_name: result.file_name,
                  uploaded_at: new Date().toISOString()
                };
              }
              return null;
            } catch (error) {
              console.error(`Error uploading ${docType}:`, error);
              return null;
            }
          });

        // Wait for all document uploads to complete
        const documentRecords = (await Promise.all(documentPromises)).filter(Boolean);

        console.log('Document upload results:', {
          attempted: documentsWithFiles.length,
          successful: documentRecords.length,
          records: documentRecords
        });

        // Save document records to database
        if (documentRecords.length > 0) {
          console.log('Saving document records:', documentRecords);

          const { error: documentsError } = await supabase
            .from(TABLES.LOAN_DOCUMENTS)
            .insert(documentRecords);

          if (documentsError) {
            console.error('Document save error:', documentsError);
            throw new Error('Failed to save document records');
          }

          // Verify the uploaded documents
          const uploadedDocs = await verifyUploadedDocuments(applicationResult.id);
          console.log('Verified uploaded documents:', {
            expected: documentRecords.length,
            actual: uploadedDocs.length,
            documents: uploadedDocs
          });

          if (uploadedDocs.length !== documentRecords.length) {
            throw new Error('Some documents failed to upload. Please try again.');
          }
        }
      }

      // Add initial status history
      try {
        const { error: historyError } = await supabase
          .from(TABLES.LOAN_STATUS_HISTORY)
          .insert([{
            loan_application_id: applicationResult.id,
            status: LOAN_STATUS.DRAFT,
            notes: 'Application draft created'
            // Let the database handle created_at with its default value
          }]);

        if (historyError) {
          console.error('Status history error:', historyError);
          // Log the error but don't throw as it's not critical
        }
      } catch (error) {
        console.error('Failed to create status history:', error);
        // Continue with the flow as this is not critical
      }

      // Clear application data from session storage
      sessionStorage.removeItem('loanApplication');

      // Navigate to client dashboard with application data
      navigate('/client-dashboard', {
        state: {
          applicationData: applicationResult,
          message: 'Your loan application has been submitted successfully!',
          applicationId: applicationResult.application_id
        },
        replace: true
      });
    } catch (error) {
      console.error('Submission error:', error);
      
      let errorMessage = 'Failed to submit application. ';
      if (!navigator.onLine) {
        errorMessage += 'Please check your internet connection and try again.';
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again later or contact support if the problem persists.';
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  }, [navigate, isOffline, applicationData, documentStatus]);

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
                <InfoItem label="NRC Number" value={personalDetails?.idNumber} />
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
                  onClick={handleSubmit}
                  disabled={isSubmitting || isOffline}
                  sx={{
                    minWidth: 200,
                    '&:disabled': {
                      backgroundColor: 'rgba(253, 124, 7, 0.5)'
                    }
                  }}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : 'Submit Application'}
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
    </Container>
  );
};

export default LoanReview; 