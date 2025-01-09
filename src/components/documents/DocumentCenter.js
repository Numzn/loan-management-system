import { useState } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import {
  Box,
  Typography,
  Paper,
  Button
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const menuItems = [
  {
    text: 'Documents',
    path: '/documents',
    icon: <FolderIcon />
  }
];

export default function DocumentCenter() {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    setUploading(true);
    try {
      // TODO: Implement document upload
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout title="Document Center" menuItems={menuItems}>
      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Your Documents</Typography>
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={handleUpload}
            disabled={uploading}
          >
            Upload Document
          </Button>
        </Box>
        <Typography variant="body2" color="textSecondary">
          No documents uploaded yet
        </Typography>
      </Paper>
    </DashboardLayout>
  );
} 