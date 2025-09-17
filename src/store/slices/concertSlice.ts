import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { concertsAPI } from '../../services/api';

// Types
export interface Concert {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  price: number;
  totalTickets: number;
  availableTickets: number;
  image?: string;
  organizerId: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface ConcertState {
  concerts: Concert[];
  currentConcert: Concert | null;
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
}

// Async thunks
export const fetchConcerts = createAsyncThunk(
  'concerts/fetchConcerts',
  async (params: { page?: number; limit?: number; search?: string } = {}, { rejectWithValue }) => {
    try {
      const data = await concertsAPI.getAll(params);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch concerts';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchConcertsByRole = createAsyncThunk(
  'concerts/fetchConcertsByRole',
  async (params: { 
    userRole: 'super_admin' | 'organizer'; 
    organizerId?: string; 
  }, { rejectWithValue }) => {
    try {
      if (params.userRole === 'organizer' && params.organizerId) {
        // Use specific method for organizer concerts
        const data = await concertsAPI.getByOrganizerId(params.organizerId);
        return data;
      } else {
        // For admin or when no organizerId, get all concerts
        const data = await concertsAPI.getAll();
        return data;
      }
    } catch (error) {
      console.log('check error', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch concerts by role';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchConcertById = createAsyncThunk(
  'concerts/fetchConcertById',
  async (concertId: string, { rejectWithValue }) => {
    try {
      const data = await concertsAPI.getById(concertId);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch concert';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createConcert = createAsyncThunk(
  'concerts/createConcert',
  async (concertData: {
    title: string;
    description: string;
    date: string;
    venue: string;
    price: number;
    status: 'active' | 'inactive';
  }, { rejectWithValue }) => {
    try {
      const data = await concertsAPI.create(concertData);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create concert';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateConcert = createAsyncThunk(
  'concerts/updateConcert',
  async ({ id, updates }: { 
    id: string; 
    updates: {
      title: string;
      description: string;
      date: string;
      venue: string;
      price: number;
      status: 'active' | 'inactive';
    }
  }, { rejectWithValue }) => {
    try {
      const data = await concertsAPI.update(id, updates);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update concert';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteConcert = createAsyncThunk(
  'concerts/deleteConcert',
  async (concertId: string, { rejectWithValue }) => {
    try {
      await concertsAPI.delete(concertId);
      return concertId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete concert';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateConcertStatus = createAsyncThunk(
  'concerts/updateConcertStatus',
  async ({ id, status }: { id: string; status: 'active' | 'inactive' }, { rejectWithValue }) => {
    try {
      const data = await concertsAPI.updateStatus(id, status);
      return { id, status, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update concert status';
      return rejectWithValue(errorMessage);
    }
  }
);

// Initial state
const initialState: ConcertState = {
  concerts: [],
  currentConcert: null,
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
};

// Slice
const concertSlice = createSlice({
  name: 'concerts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentConcert: (state, action: PayloadAction<Concert | null>) => {
      state.currentConcert = action.payload;
    },
    clearConcerts: (state) => {
      state.concerts = [];
      state.currentConcert = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch concerts
    builder
      .addCase(fetchConcerts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConcerts.fulfilled, (state, action) => {
        state.loading = false;
        state.concerts = action.payload.concerts || action.payload;
        state.totalPages = action.payload.totalPages || 1;
        state.currentPage = action.payload.currentPage || 1;
      })
      .addCase(fetchConcerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch concerts by role
    builder
      .addCase(fetchConcertsByRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConcertsByRole.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both paginated and non-paginated responses
        if (action.payload.data && Array.isArray(action.payload.data)) {
          // Backend response format: { success: true, message: string, data: Concert[] }
          state.concerts = action.payload.data;
        } else if (Array.isArray(action.payload.concerts)) {
          // Paginated response format
          state.concerts = action.payload.concerts;
          state.totalPages = action.payload.totalPages || 1;
          state.currentPage = action.payload.currentPage || 1;
        } else if (Array.isArray(action.payload)) {
          // Direct array response
          state.concerts = action.payload;
        } else {
          state.concerts = [];
        }
      })
      .addCase(fetchConcertsByRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch concert by ID
    builder
      .addCase(fetchConcertById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConcertById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentConcert = action.payload;
      })
      .addCase(fetchConcertById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create concert
    builder
      .addCase(createConcert.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createConcert.fulfilled, (state, action) => {
        state.loading = false;
        state.concerts.unshift(action.payload);
      })
      .addCase(createConcert.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update concert
    builder
      .addCase(updateConcert.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateConcert.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.concerts.findIndex(concert => concert.id === action.payload.id);
        if (index !== -1) {
          state.concerts[index] = action.payload;
        }
        if (state.currentConcert?.id === action.payload.id) {
          state.currentConcert = action.payload;
        }
      })
      .addCase(updateConcert.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete concert
    builder
      .addCase(deleteConcert.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteConcert.fulfilled, (state, action) => {
        state.loading = false;
        state.concerts = state.concerts.filter(concert => concert.id !== action.payload);
        if (state.currentConcert?.id === action.payload) {
          state.currentConcert = null;
        }
      })
      .addCase(deleteConcert.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update concert status
    builder
      .addCase(updateConcertStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateConcertStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { id, status } = action.payload;
        const index = state.concerts.findIndex(concert => concert.id === id);
        if (index !== -1) {
          state.concerts[index] = { ...state.concerts[index], status };
        }
        if (state.currentConcert?.id === id) {
          state.currentConcert = { ...state.currentConcert, status };
        }
      })
      .addCase(updateConcertStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentConcert, clearConcerts } = concertSlice.actions;
export { fetchConcertsByRole, updateConcertStatus };
export default concertSlice.reducer;
