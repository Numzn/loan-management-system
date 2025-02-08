import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Description,
  CheckCircle,
  Close,
  Send,
  Download,
  Edit,
} from '@mui/icons-material';

const VerificationStep = ({ label, completed, error }) => (
  <Step completed={completed}>
    <StepLabel error={error}>
      {label}
      {completed && <CheckCircle color="success" sx={{ ml: 1 }} />}
    </StepLabel>
  </Step>
);

const ApplicationDetail = ({ application, onClose, onForward }) => {
  const [verificationSteps] = useState([
    { label: 'Document Verification', completed: false },
    { label: 'Identity Check', completed: false },
    { label: 'Income Verification', completed: false },
    { label: 'Credit Assessment', completed: false },
  ]);

  const [comments, setComments] = useState('');
  const [showForwardDialog, setShowForwardDialog] = useState(false);

  const handleVerificationComplete = () => {
    setShowForwardDialog(true);
  };

  const handleForward = () => {
    onForward(application.id, comments);
    setShowForwardDialog(false);
    onClose();
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Application Details - {application.id}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Client Information */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Client Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Name"
                    secondary={application.clientName}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Loan Type"
                    secondary={application.loanType}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Amount"
                    secondary={`$${application.amount.toLocaleString()}`}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {/* Documents */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Documents
              </Typography>
              <List>
                {application.documents.map((doc, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Description />
                    </ListItemIcon>
                    <ListItemText primary={doc} />
                    <Tooltip title="Download">
                      <IconButton>
                        <Download />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View">
                      <IconButton>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Verification Steps */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Verification Progress
              </Typography>
              <Stepper activeStep={1} sx={{ mt: 2 }}>
                {verificationSteps.map((step, index) => (
                  <VerificationStep
                    key={index}
                    label={step.label}
                    completed={step.completed}
                    error={step.error}
                  />
                ))}
              </Stepper>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleVerificationComplete}
          startIcon={<Send />}
        >
          Complete Verification
        </Button>
      </DialogActions>

      {/* Forward Dialog */}
      <Dialog
        open={showForwardDialog}
        onClose={() => setShowForwardDialog(false)}
      >
        <DialogTitle>Forward to Manager</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Verification Comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowForwardDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleForward}
          >
            Forward
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default ApplicationDetail; 