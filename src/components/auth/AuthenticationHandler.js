import { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import AuthenticationModal from './AuthenticationModal';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

export default function AuthenticationHandler({ 
  email, 
  onSuccess,
  applicationData 
}) {
  const { handleAuthentication, loadPreviousData } = useUser();
  const [showPreviousDataDialog, setShowPreviousDataDialog] = useState(false);
  const [previousData, setPreviousData] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(true);

  const handleAuthSuccess = async () => {
    await handleAuthentication(email);
    const prevData = await loadPreviousData(email);
    
    if (prevData) {
      setPreviousData(prevData);
      setShowPreviousDataDialog(true);
    } else {
      onSuccess(applicationData);
    }
  };

  const handleUsePreviousData = () => {
    onSuccess(previousData);
    setShowPreviousDataDialog(false);
  };

  const handleUseNewData = () => {
    onSuccess(applicationData);
    setShowPreviousDataDialog(false);
  };

  return (
    <>
      <AuthenticationModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        email={email}
        onSuccess={handleAuthSuccess}
      />

      <Dialog open={showPreviousDataDialog}>
        <DialogTitle>Previous Application Found</DialogTitle>
        <DialogContent>
          <Typography>
            We found your previous loan application. Would you like to:
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUseNewData}>
            Start Fresh Application
          </Button>
          <Button 
            variant="contained" 
            onClick={handleUsePreviousData}
          >
            Use Previous Details
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}