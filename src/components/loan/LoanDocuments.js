import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  Box,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Delete as DeleteIcon,
  PhotoCamera as CameraIcon
} from '@mui/icons-material';
import { LOAN_TYPES } from '../../constants/loanTypes';
import { formatCurrency } from '../../utils/formatters';
import LoanProgressBar from '../shared/LoanProgressBar';
import DocumentUploadProgress from '../shared/DocumentUploadProgress';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_TYPES = {
  'image': ['image/jpeg', 'image/png'],
  'document': ['application/pdf'],
  'photo': ['image/jpeg', 'image/png']
};

export default function LoanDocuments() {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const saved = sessionStorage.getItem('loanApplication');
    if (!saved && !location.state) {
      navigate('/calculator');
      return;
    }
  }, [navigate, location]);

  const [applicationData, setApplicationData] = useState(() => {
    const saved = sessionStorage.getItem('loanApplication');
    return saved ? JSON.parse(saved) : location.state;
  });

  if (!applicationData?.loanType) {
    return (
      <Container>
        <Alert severity="error">
          Invalid application data. Please start over.
        </Alert>
        <Button onClick={() => navigate('/calculator')}>
          Start New Application
        </Button>
      </Container>
    );
  }

  const [files, setFiles] = useState({});
  const [progress, setProgress] = useState({});
  const [errors, setErrors] = useState({});
  const [profilePhoto, setProfilePhoto] = useState(null);

  const requiredDocs = LOAN_TYPES[applicationData.loanType]?.requiredDocuments || [];

  const validateFile = (file, type) => {
    const errors = [];
    
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    const allowedTypes = type === 'photo' ? 
      ALLOWED_TYPES.photo : 
      [...ALLOWED_TYPES.document, ...ALLOWED_TYPES.image];

    if (!allowedTypes.includes(file.type)) {
      errors.push(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
    }

    return errors.length ? errors.join('. ') : null;
  };

  const handleFileUpload = async (event, docType) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      const error = validateFile(file, docType.includes('photo') ? 'photo' : 'document');
      if (error) {
        setErrors(prev => ({ ...prev, [docType]: error }));
        return;
      }

      setProgress(prev => ({ ...prev, [docType]: 0 }));

      // If it's a passport photo, create preview
      if (docType === 'Passport-sized photo') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfilePhoto(reader.result);
        };
        reader.readAsDataURL(file);
      }

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(r => setTimeout(r, 100));
        setProgress(prev => ({ ...prev, [docType]: i }));
      }

      setFiles(prev => ({ ...prev, [docType]: file }));
      setErrors(prev => ({ ...prev, [docType]: null }));
    } catch (error) {
      console.error('File upload error:', error);
      setErrors(prev => ({
        ...prev,
        [docType]: 'Failed to upload file. Please try again.'
      }));
    }
  };

  const handleDelete = (docType) => {
    setFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[docType];
      return newFiles;
    });
    setProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[docType];
      return newProgress;
    });
  };

  const handleNext = () => {
    if (!validateDocuments()) {
      return;
    }

    const updatedData = {
      ...applicationData,
      documents: files
    };

    sessionStorage.setItem('loanApplication', JSON.stringify(updatedData));
    navigate('/loan-review', { state: updatedData });
  };

  const validateDocuments = () => {
    // Check if all required documents are uploaded
    const missingDocs = requiredDocs.filter(doc => !files[doc]);
    
    if (missingDocs.length > 0) {
      setErrors(prev => ({
        ...prev,
        general: `Missing required documents: ${missingDocs.join(', ')}`
      }));
      return false; // Prevent navigation
    }

    // Check if any files are still uploading
    const isUploading = Object.values(progress).some(p => p > 0 && p < 100);
    if (isUploading) {
      setErrors(prev => ({
        ...prev,
        general: 'Please wait for all files to finish uploading'
      }));
      return false; // Prevent navigation
    }

    return true;
  };

  useEffect(() => {
    return () => {
      // Cleanup any ongoing uploads when component unmounts
      Object.keys(progress).forEach(key => {
        if (progress[key] < 100) {
          setProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[key];
            return newProgress;
          });
        }
      });
    };
  }, [progress]);

  useEffect(() => {
    return () => {
      // Clean up any uploaded files from memory
      Object.values(files).forEach(file => {
        URL.revokeObjectURL(URL.createObjectURL(file));
      });
    };
  }, [files]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <LoanProgressBar currentStep={4} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Required Documents
            </Typography>

            {/* Profile Photo Preview */}
            {profilePhoto && (
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={profilePhoto}
                  sx={{ width: 100, height: 100 }}
                />
                <Typography>Profile Photo Preview</Typography>
              </Box>
            )}

            {errors.general && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.general}
              </Alert>
            )}

            <List>
              {requiredDocs.map((doc) => (
                <ListItem key={doc}>
                  <ListItemIcon>
                    {files[doc] ? <CheckIcon color="success" /> : 
                     doc.includes('photo') ? <CameraIcon /> : <UploadIcon />}
                  </ListItemIcon>
                  <ListItemText 
                    primary={doc}
                    secondary={files[doc]?.name || 'No file uploaded'}
                  />
                  {progress[doc] > 0 && progress[doc] < 100 && (
                    <DocumentUploadProgress 
                      progress={progress[doc]} 
                      fileName={files[doc]?.name}
                    />
                  )}
                  {files[doc] ? (
                    <IconButton onClick={() => handleDelete(doc)}>
                      <DeleteIcon />
                    </IconButton>
                  ) : (
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={doc.includes('photo') ? <CameraIcon /> : <UploadIcon />}
                    >
                      Upload
                      <input
                        type="file"
                        hidden
                        accept={doc.includes('photo') ? 
                          ALLOWED_TYPES.photo.join(',') :
                          [...ALLOWED_TYPES.document, ...ALLOWED_TYPES.image].join(',')}
                        onChange={(e) => handleFileUpload(e, doc)}
                      />
                    </Button>
                  )}
                </ListItem>
              ))}
            </List>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => navigate(-1)}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={requiredDocs.some(doc => !files[doc])}
              >
                Preview Application
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Document Guidelines
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Photo Requirements"
                  secondary="Passport photo must be recent, clear, and on white background"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="File Types"
                  secondary="Photos: JPG/PNG, Documents: PDF"
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="File Size"
                  secondary="Maximum 5MB per file"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
} 