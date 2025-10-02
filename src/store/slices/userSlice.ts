import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { usersAPI } from '../../services/api';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'organizer';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  phone?: string;
  address?: string;
  description?: string;
  website?: string;
}

export interface UserState {
  users: User[];
  listUsers: User[]; // Add this property that's being used in the reducer
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  totalUsers: number; // Add this property that's being used in the reducer
}

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: { page?: number; limit?: number; search?: string } = {}, { rejectWithValue }) => {
    try {
      const data = await usersAPI.getAll(params);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (userId: string, { rejectWithValue }) => {
    try {
      const data = await usersAPI.getById(userId);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user';
      return rejectWithValue(errorMessage);
    }
  }
);

// Initial state
const initialState: UserState = {
  users: [],
  listUsers: [], // Initialize the missing property
  currentUser: null,
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
  totalUsers: 0, // Initialize the missing property
};

// Slice
const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
    clearUsers: (state) => {
      state.users = [];
      state.listUsers = [];
      state.currentUser = null;
      state.error = null;
      state.totalUsers = 0;
    },
  },
  extraReducers: (builder) => {
    // Fetch users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.listUsers = action.payload.data.users
        state.totalUsers = action.payload.data.totalUsers;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch user by ID
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentUser, clearUsers } = userSlice.actions;
export default userSlice.reducer;
