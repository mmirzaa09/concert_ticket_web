import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

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
      const queryParams = new URLSearchParams({
        page: (params.page || 1).toString(),
        limit: (params.limit || 10).toString(),
        ...(params.search && { search: params.search }),
      });

      const response = await fetch(`/api/concerts?${queryParams}`);
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch concerts');
      }

      const data = await response.json();
      return data;
    } catch {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const fetchConcertById = createAsyncThunk(
  'concerts/fetchConcertById',
  async (concertId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/concerts/${concertId}`);
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch concert');
      }

      const data = await response.json();
      return data;
    } catch {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const createConcert = createAsyncThunk(
  'concerts/createConcert',
  async (concertData: Omit<Concert, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/concerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(concertData),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to create concert');
      }

      const data = await response.json();
      return data;
    } catch {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const updateConcert = createAsyncThunk(
  'concerts/updateConcert',
  async ({ id, updates }: { id: string; updates: Partial<Concert> }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/concerts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to update concert');
      }

      const data = await response.json();
      return data;
    } catch {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const deleteConcert = createAsyncThunk(
  'concerts/deleteConcert',
  async (concertId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/concerts/${concertId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to delete concert');
      }

      return concertId;
    } catch {
      return rejectWithValue('Network error occurred');
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
  },
});

export const { clearError, setCurrentConcert, clearConcerts } = concertSlice.actions;
export default concertSlice.reducer;
