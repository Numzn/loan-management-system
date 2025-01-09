import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Button
} from '@mui/material';
import LoanDetailsCard from '../shared/LoanDetailsCard';
import DocumentViewer from '../shared/DocumentViewer';
import StatusUpdateDialog from '../shared/StatusUpdateDialog';

const allowedStatuses = [
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approve' },
  { value: 'rejected', label: 'Reject' },
  { value: 'escalated', label: 'Escalate to Manager' }
];

export default function LoanReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loan, setLoan] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  useEffect(() => {
    const fetchLoan = async () => {
      try {
        const loanDoc = await getDoc(doc(db, 'loanApplications', id));
        if (loanDoc.exists()) {
          setLoan({ id: loanDoc.id, ...loanDoc.data() });
        }
      } catch (error) {
        console.error('Error fetching loan:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoan();
  }, [id]);

  const handleStatusUpdate = async (updateData) => {
    try {
      await updateDoc(doc(db, 'loanApplications', id), {
        status: updateData.status,
        comments: updateData.comments,
        updatedAt: updateData.updatedAt,
        reviewedBy: 'current-user-id' // Replace with actual user ID
      });

      setLoan(prev => ({
        ...prev,
        status: updateData.status,
        comments: updateData.comments,
        updatedAt: updateData.updatedAt
      }));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!loan) {
    return (
      <Container>
        <Typography variant="h6">Loan application not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4">Loan Application Review</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setStatusDialogOpen(true)}
            >
              Update Status
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={8}>
          <LoanDetailsCard loan={loan} />
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Required Documents
            </Typography>
            <DocumentViewer documents={loan.documents || []} />
          </Paper>
        </Grid>
      </Grid>

      <StatusUpdateDialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        onSubmit={handleStatusUpdate}
        currentStatus={loan.status}
        allowedStatuses={allowedStatuses}
      />
    </Container>
  );
} 