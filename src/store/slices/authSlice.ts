import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'organizer';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Async thunks
export const loginAdmin = createAsyncThunk(
  'auth/loginAdmin',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    console.log('Attempting login with credentials:', credentials);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/organizer/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Login failed');
      }

      const data = await response.json();
      
      // Transform organizer data to match auth interface
      const transformedData = {
        user: {
          id: data.organizer?.id || data.organizer?.id_organizer,
          email: data.organizer?.email,
          name: data.organizer?.name,
          role: 'organizer' as const,
          ...data.organizer,
        },
        token: data.token,
      };
      
      // Store token in localStorage
      localStorage.setItem('adminToken', transformedData.token);
      
      return transformedData;
    } catch(error) {
      console.log('Login error:', error);
      return rejectWithValue('Network error occurred');
    }
  }
);

export const registerAdmin = createAsyncThunk(
  'auth/registerAdmin',
  async (registerData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    description?: string;
    website?: string;
  }, { rejectWithValue }) => {
    try {
      // Connect to organizer register endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/organizer/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      console.log('Register response status:', response);

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Registration failed');
      }

      const data = await response.json();
      
      // Transform organizer data to match auth interface
      const transformedData = {
        user: {
          id: data.organizer?.id || data.organizer?.id_organizer,
          email: data.organizer?.email,
          name: data.organizer?.name,
          role: 'organizer' as const,
          ...data.organizer,
        },
        token: data.token,
      };
      
      // Store token in localStorage
      localStorage.setItem('adminToken', transformedData.token);
      
      return transformedData;
    } catch(error) {
      console.log('Registration error:', error);
      return rejectWithValue('Network error occurred');
    }
  }
);

export const logoutAdmin = createAsyncThunk(
  'auth/logoutAdmin',
  async (_, { rejectWithValue }) => {
    try {
      // Remove token from localStorage
      localStorage.removeItem('adminToken');
      
      // Optionally call logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      return null;
    } catch {
      return rejectWithValue('Logout failed');
    }
  }
);

export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem('adminToken');
        return rejectWithValue('Token invalid');
      }

      const data = await response.json();
      return data;
    } catch {
      localStorage.removeItem('adminToken');
      return rejectWithValue('Token verification failed');
    }
  }
);

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(registerAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });

    // Verify token
    builder
      .addCase(verifyToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(verifyToken.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setUser, clearAuth } = authSlice.actions;

// Export async thunks
export { loginAdmin, registerAdmin, logoutAdmin, verifyToken };

export default authSlice.reducer;
