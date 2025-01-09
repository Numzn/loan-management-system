import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default function DocumentUpload({ requiredDocuments, documents, setDocuments }) {
  const onDrop = useCallback((acceptedFiles) => {
    const newDocuments = acceptedFiles.map(file => ({
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date()
    }));
    setDocuments(prev => [...prev, ...newDocuments]);
  }, [setDocuments]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.jpg', '.png']
    }
  });

  const handleDelete = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Required Documents
      </Typography>
      <List>
        {requiredDocuments.map((doc, index) => (
          <ListItem key={index}>
            <ListItemText primary={doc} />
          </ListItem>
        ))}
      </List>

      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          mt: 2,
          textAlign: 'center',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          cursor: 'pointer'
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, mb: 2 }} />
        <Typography>
          {isDragActive
            ? "Drop the files here..."
            : "Drag 'n' drop files here, or click to select files"}
        </Typography>
      </Paper>

      {documents.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Uploaded Documents
          </Typography>
          <List>
            {documents.map((doc, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={doc.name}
                  secondary={`Size: ${(doc.size / 1024 / 1024).toFixed(2)} MB`}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleDelete(index)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
} 