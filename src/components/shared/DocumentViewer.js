import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Box
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';

export default function DocumentViewer({ documents }) {
  const [selectedDoc, setSelectedDoc] = useState(null);

  const handleOpenDoc = (doc) => {
    setSelectedDoc(doc);
  };

  const handleCloseDoc = () => {
    setSelectedDoc(null);
  };

  const renderDocument = (doc) => {
    if (doc.type.includes('image')) {
      return (
        <img
          src={doc.url}
          alt={doc.name}
          style={{ maxWidth: '100%', maxHeight: '80vh' }}
        />
      );
    } else if (doc.type === 'application/pdf') {
      return (
        <iframe
          src={doc.url}
          title={doc.name}
          width="100%"
          height="80vh"
          frameBorder="0"
        />
      );
    } else {
      return (
        <Typography color="error">
          Unsupported document type
        </Typography>
      );
    }
  };

  return (
    <>
      <List>
        {documents.map((doc) => (
          <ListItem key={doc.name}>
            <ListItemText
              primary={doc.name}
              secondary={`Uploaded on ${new Date(doc.uploadedAt).toLocaleDateString()}`}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => handleOpenDoc(doc)}>
                <VisibilityIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog
        open={Boolean(selectedDoc)}
        onClose={handleCloseDoc}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {selectedDoc?.name}
            </Typography>
            <IconButton onClick={handleCloseDoc}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedDoc && renderDocument(selectedDoc)}
        </DialogContent>
      </Dialog>
    </>
  );
} 