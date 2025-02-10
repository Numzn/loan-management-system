import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material';
import PropTypes from 'prop-types';

const RejectionDialog = ({ open, onClose, onReject, reason, onReasonChange }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Reject Loan Application</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Reason for Rejection"
          type="text"
          fullWidth
          multiline
          rows={4}
          value={reason}
          onChange={onReasonChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onReject} color="primary" variant="contained">
          Confirm Rejection
        </Button>
      </DialogActions>
    </Dialog>
  );
};

RejectionDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  reason: PropTypes.string.isRequired,
  onReasonChange: PropTypes.func.isRequired
};

export default RejectionDialog; 