import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const fetchLoans = createAsyncThunk(
  'loans/fetchLoans',
  async ({ status, userId = null }) => {
    let q = collection(db, 'loanApplications');
    
    if (status) {
      q = query(q, where('status', 'in', status));
    }
    
    if (userId) {
      q = query(q, where('userId', '==', userId));
    }
    
    q = query(q, orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
);

const loanSlice = createSlice({
  name: 'loans',
  initialState: {
    loans: [],
    loading: false,
    error: null,
    selectedLoan: null
  },
  reducers: {
    setSelectedLoan: (state, action) => {
      state.selectedLoan = action.payload;
    },
    updateLoanStatus: (state, action) => {
      const { loanId, status, updatedAt } = action.payload;
      const loan = state.loans.find(l => l.id === loanId);
      if (loan) {
        loan.status = status;
        loan.updatedAt = updatedAt;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLoans.fulfilled, (state, action) => {
        state.loading = false;
        state.loans = action.payload;
      })
      .addCase(fetchLoans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { setSelectedLoan, updateLoanStatus } = loanSlice.actions;
export default loanSlice.reducer; 