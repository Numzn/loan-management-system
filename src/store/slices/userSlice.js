import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (role = null) => {
    let q = collection(db, 'users');
    
    if (role) {
      q = query(q, where('role', '==', role));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    loading: false,
    error: null,
    selectedUser: null
  },
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { setSelectedUser } = userSlice.actions;
export default userSlice.reducer; 