import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload,
  InsertDriveFile,
  CheckCircle,
  Delete,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { StyledCard } from '../../theme/components';

const DocumentUpload = () => {
  const [documents, setDocuments] = useState([
    { id: 1, name: 'ID Document', status: 'pending', required: true },
    { id: 2, name: 'Proof of Income', status: 'pending', required: true },
    { id: 3, name: 'Bank Statements', status: 'pending', required: true },
    { id: 4, name: 'Additional Supporting Documents', status: 'optional', required: false },
  ]);

  const [uploadProgress, setUploadProgress] = useState({});

  const handleFileSelect = (documentId) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Simulate upload progress
        setUploadProgress(prev => ({ ...prev, [documentId]: 0 }));
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            const newProgress = (prev[documentId] || 0) + 10;
            if (newProgress >= 100) {
              clearInterval(interval);
              setDocuments(docs => 
                docs.map(doc => 
                  doc.id === documentId 
                    ? { ...doc, status: 'uploaded', fileName: file.name }
                    : doc
                )
              );
              return prev;
            }
            return { ...prev, [documentId]: newProgress };
          });
        }, 300);
      }
    };
    
    input.click();
  };

  const handleDelete = (documentId) => {
    setDocuments(docs =>
      docs.map(doc =>
        doc.id === documentId
          ? { ...doc, status: 'pending', fileName: undefined }
          : doc
      )
    );
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[documentId];
      return newProgress;
    });
  };

  return (
    <StyledCard>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="#002044" gutterBottom>
          Required Documents
        </Typography>
        
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
                  primary={doc.name}
                  secondary={
                    doc.status === 'uploaded' 
                      ? doc.fileName 
                      : `${doc.required ? 'Required' : 'Optional'}`
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
                    onClick={() => handleFileSelect(doc.id)}
                    sx={{
                      borderColor: '#FD7C07',
                      color: '#FD7C07',
                      '&:hover': {
                        borderColor: '#FD7C07',
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
                          backgroundColor: '#FD7C07',
                        },
                      }}
                    />
                  </Box>
                )}
              </ListItem>
            </motion.div>
          ))}
        </List>
      </Box>
    </StyledCard>
  );
};

export default DocumentUpload; 