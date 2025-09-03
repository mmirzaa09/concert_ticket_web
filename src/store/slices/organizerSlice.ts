import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Organizer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  description?: string;
  website?: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface OrganizerState {
  organizers: Organizer[];
  currentOrganizer: Organizer | null;
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
}

// Async thunks
export const fetchOrganizers = createAsyncThunk(
  'organizers/fetchOrganizers',
  async (params: { page?: number; limit?: number; search?: string; status?: string } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        page: (params.page || 1).toString(),
        limit: (params.limit || 10).toString(),
        ...(params.search && { search: params.search }),
        ...(params.status && { status: params.status }),
      });

      const response = await fetch(`/api/organizers?${queryParams}`);
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch organizers');
      }

      const data = await response.json();
      return data;
    } catch {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const fetchOrganizerById = createAsyncThunk(
  'organizers/fetchOrganizerById',
  async (organizerId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/organizers/${organizerId}`);
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch organizer');
      }

      const data = await response.json();
      return data;
    } catch {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const createOrganizer = createAsyncThunk(
  'organizers/createOrganizer',
  async (organizerData: Omit<Organizer, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/organizers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(organizerData),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to create organizer');
      }

      const data = await response.json();
      return data;
    } catch {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const updateOrganizer = createAsyncThunk(
  'organizers/updateOrganizer',
  async ({ id, updates }: { id: string; updates: Partial<Organizer> }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/organizers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to update organizer');
      }

      const data = await response.json();
      return data;
    } catch {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const updateOrganizerStatus = createAsyncThunk(
  'organizers/updateOrganizerStatus',
  async ({ id, status }: { id: string; status: 'active' | 'inactive' | 'pending' }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/organizers/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to update organizer status');
      }

      const data = await response.json();
      return data;
    } catch {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const deleteOrganizer = createAsyncThunk(
  'organizers/deleteOrganizer',
  async (organizerId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/organizers/${organizerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to delete organizer');
      }

      return organizerId;
    } catch {
      return rejectWithValue('Network error occurred');
    }
  }
);

// Initial state
const initialState: OrganizerState = {
  organizers: [],
  currentOrganizer: null,
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
};

// Slice
const organizerSlice = createSlice({
  name: 'organizers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentOrganizer: (state, action: PayloadAction<Organizer | null>) => {
      state.currentOrganizer = action.payload;
    },
    clearOrganizers: (state) => {
      state.organizers = [];
      state.currentOrganizer = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch organizers
    builder
      .addCase(fetchOrganizers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizers.fulfilled, (state, action) => {
        state.loading = false;
        state.organizers = action.payload.organizers || action.payload;
        state.totalPages = action.payload.totalPages || 1;
        state.currentPage = action.payload.currentPage || 1;
      })
      .addCase(fetchOrganizers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch organizer by ID
    builder
      .addCase(fetchOrganizerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizerById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrganizer = action.payload;
      })
      .addCase(fetchOrganizerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create organizer
    builder
      .addCase(createOrganizer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrganizer.fulfilled, (state, action) => {
        state.loading = false;
        state.organizers.unshift(action.payload);
      })
      .addCase(createOrganizer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update organizer
    builder
      .addCase(updateOrganizer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrganizer.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.organizers.findIndex(organizer => organizer.id === action.payload.id);
        if (index !== -1) {
          state.organizers[index] = action.payload;
        }
        if (state.currentOrganizer?.id === action.payload.id) {
          state.currentOrganizer = action.payload;
        }
      })
      .addCase(updateOrganizer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update organizer status
    builder
      .addCase(updateOrganizerStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrganizerStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.organizers.findIndex(organizer => organizer.id === action.payload.id);
        if (index !== -1) {
          state.organizers[index] = action.payload;
        }
        if (state.currentOrganizer?.id === action.payload.id) {
          state.currentOrganizer = action.payload;
        }
      })
      .addCase(updateOrganizerStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete organizer
    builder
      .addCase(deleteOrganizer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrganizer.fulfilled, (state, action) => {
        state.loading = false;
        state.organizers = state.organizers.filter(organizer => organizer.id !== action.payload);
        if (state.currentOrganizer?.id === action.payload) {
          state.currentOrganizer = null;
        }
      })
      .addCase(deleteOrganizer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentOrganizer, clearOrganizers } = organizerSlice.actions;
export default organizerSlice.reducer;
