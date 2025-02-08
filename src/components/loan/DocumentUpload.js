import React, { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  IconButton,
  LinearProgress,
  Alert,
  Paper,
  Divider,
} from '@mui/material';
import {
  CloudUpload,
  InsertDriveFile,
  CheckCircle,
  Delete,
  DriveFolderUpload,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { StyledCard, PrimaryButton } from '../../theme/components';

// Document type definitions with matching patterns
const DOCUMENT_TYPES = {
  ID_DOCUMENT: {
    id: 1,
    name: 'ID Document',
    required: true,
    patterns: ['id', 'identification', 'nrc', 'passport'],
    acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png']
  },
  PROOF_OF_INCOME: {
    id: 2,
    name: 'Proof of Income',
    required: true,
    patterns: ['payslip', 'salary', 'income', 'proof'],
    acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png']
  },
  BANK_STATEMENTS: {
    id: 3,
    name: 'Bank Statements',
    required: true,
    patterns: ['bank', 'statement', 'account'],
    acceptedFormats: ['.pdf']
  },
  SUPPORTING_DOCUMENTS: {
    id: 4,
    name: 'Additional Supporting Documents',
    required: false,
    patterns: ['support', 'additional', 'other'],
    acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']
  }
};

const DocumentUpload = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get application data from location state or session storage
  const applicationData = location.state || JSON.parse(sessionStorage.getItem('loanApplication') || '{}');
  
  // Extract step information from location state
  const { 
    step: currentStep = 4,
    totalSteps = 7,
    isApplicationFlow = true 
  } = applicationData;

  const [documents, setDocuments] = useState(Object.values(DOCUMENT_TYPES).map(type => ({
    ...type,
    status: 'pending',
    file: null,
    fileName: '',
  })));

  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Function to match file to document type
  const matchFileToDocType = (fileName) => {
    fileName = fileName.toLowerCase();
    return Object.entries(DOCUMENT_TYPES).find(([_, type]) => 
      type.patterns.some(pattern => fileName.includes(pattern))
    )?.[1]?.id;
  };

  // Handle multiple file selection
  const handleMultipleFiles = useCallback((files) => {
    const fileArray = Array.from(files);
    const unmatched = [];
    const updates = {};

    fileArray.forEach(file => {
      const docTypeId = matchFileToDocType(file.name);
      if (docTypeId) {
        updates[docTypeId] = {
          file,
          fileName: file.name,
          status: 'pending'
        };
      } else {
        unmatched.push(file.name);
      }
    });

    // Update documents with matched files
    setDocuments(docs => docs.map(doc => {
      if (updates[doc.id]) {
        return {
          ...doc,
          ...updates[doc.id]
        };
      }
      return doc;
    }));

    // Start upload simulation for matched files
    Object.keys(updates).forEach(docId => {
      simulateUpload(parseInt(docId));
    });

    // Show warning for unmatched files
    if (unmatched.length > 0) {
      setError(`Could not automatically match the following files: ${unmatched.join(', ')}`);
    }
  }, []);

  // Simulate file upload
  const simulateUpload = useCallback((documentId) => {
    setUploadProgress(prev => ({ ...prev, [documentId]: 0 }));
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = (prev[documentId] || 0) + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setDocuments(docs => 
            docs.map(doc => 
              doc.id === documentId 
                ? { ...doc, status: 'uploaded' }
                : doc
            )
          );
          return prev;
        }
        return { ...prev, [documentId]: newProgress };
      });
    }, 300);
  }, []);

  // Handle drag and drop
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleMultipleFiles(e.dataTransfer.files);
    }
  }, [handleMultipleFiles]);

  // Handle manual file selection
  const handleFileSelect = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = Object.values(DOCUMENT_TYPES)
      .flatMap(type => type.acceptedFormats)
      .join(',');
    
    input.onchange = (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleMultipleFiles(e.target.files);
      }
    };
    
    input.click();
  }, [handleMultipleFiles]);

  const handleDelete = useCallback((documentId) => {
    setDocuments(docs =>
      docs.map(doc =>
        doc.id === documentId
          ? { ...doc, status: 'pending', file: null, fileName: '' }
          : doc
      )
    );
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[documentId];
      return newProgress;
    });
  }, []);

  const handleContinue = useCallback(() => {
    // Validate required documents
    const missingRequired = documents.some(doc => doc.required && doc.status !== 'uploaded');
    if (missingRequired) {
      setError('Please upload all required documents before continuing');
      return;
    }

    // Get existing loan application data
    const existingData = JSON.parse(sessionStorage.getItem('loanApplication') || '{}');
    
    // Prepare documents data for storage
    const documentsData = documents.reduce((acc, doc) => {
      if (doc.status === 'uploaded') {
        acc[doc.name] = {
          fileName: doc.fileName,
          status: doc.status,
          file: doc.file,
          required: doc.required
        };
      }
      return acc;
    }, {});

    // Merge with existing data
    const updatedData = {
      ...existingData,
      documents: documentsData
    };

    // Save to session storage
    sessionStorage.setItem('loanApplication', JSON.stringify(updatedData));

    // Navigate to review
    navigate('/loan-review', { 
      state: { 
        ...updatedData,
        step: currentStep + 1,
        totalSteps,
        isApplicationFlow
      },
      replace: true
    });
  }, [navigate, documents, currentStep, totalSteps, isApplicationFlow]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Progress Bar */}
      {isApplicationFlow && (
      <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
          Step {currentStep} of {totalSteps}: Document Upload
        </Typography>
        <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
          <Box 
            sx={{ 
              width: `${(currentStep / totalSteps) * 100}%`, 
              height: '100%', 
                bgcolor: '#fd7c07', 
              borderRadius: 1 
            }} 
          />
        </Box>
      </Box>
      )}

      <StyledCard>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom color="#002044">
              Required Documents
          </Typography>

          {/* Drag and Drop Area */}
          <Paper
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            sx={{
              p: 4,
              mb: 3,
              textAlign: 'center',
              backgroundColor: dragActive ? 'rgba(253, 124, 7, 0.04)' : 'transparent',
              border: '2px dashed',
              borderColor: dragActive ? '#fd7c07' : 'divider',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={handleFileSelect}
          >
            <DriveFolderUpload sx={{ fontSize: 48, color: '#fd7c07', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Drag and Drop Files Here
            </Typography>
            <Typography color="textSecondary">
              or click to select multiple files
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Supported formats: PDF, JPG, PNG, DOC, DOCX
            </Typography>
          </Paper>

          <Divider sx={{ my: 3 }} />

          {/* Document List */}
            <List>
            {documents.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ListItem
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 2,
                    position: 'relative',
                  }}
                >
                  <ListItemIcon>
                    <InsertDriveFile color={doc.status === 'uploaded' ? 'success' : 'action'} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {doc.name}
                        {doc.required && (
                          <Typography 
                            variant="caption" 
                            color="error" 
                            sx={{ ml: 1 }}
                          >
                            (Required)
                        </Typography>
                        )}
                      </Box>
                    }
                    secondary={
                      doc.status === 'uploaded' 
                        ? doc.fileName 
                        : `Accepted formats: ${doc.acceptedFormats.join(', ')}`
                    }
                  />
                  
                  {doc.status === 'uploaded' ? (
                    <>
                      <CheckCircle color="success" sx={{ mr: 1 }} />
                          <IconButton 
                            size="small"
                        onClick={() => handleDelete(doc.id)}
                        sx={{ color: 'error.main' }}
                          >
                        <Delete />
                          </IconButton>
                    </>
                  ) : (
                    <Button
                      variant="outlined"
                      startIcon={<CloudUpload />}
                      onClick={handleFileSelect}
                      sx={{
                        borderColor: '#fd7c07',
                        color: '#fd7c07',
                        '&:hover': {
                          borderColor: '#fd7c07',
                          backgroundColor: 'rgba(253, 124, 7, 0.04)',
                        },
                      }}
                    >
                      Upload
                    </Button>
                  )}
                  
                  {uploadProgress[doc.id] !== undefined && uploadProgress[doc.id] < 100 && (
                    <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={uploadProgress[doc.id]} 
                        sx={{ 
                          height: 4,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#fd7c07',
                          },
                        }}
                      />
                  </Box>
                  )}
                </ListItem>
              </motion.div>
              ))}
            </List>

          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <PrimaryButton onClick={() => navigate(-1)}>
              Back
            </PrimaryButton>
            <PrimaryButton onClick={handleContinue}>
                Continue to Review
            </PrimaryButton>
            </Box>
            </Box>
      </StyledCard>
    </Container>
  );
};

export default DocumentUpload; 