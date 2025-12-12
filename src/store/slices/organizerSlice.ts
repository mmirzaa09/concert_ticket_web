import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { organizersAPI } from '../../services/api';

// Types
export interface Organizer {
  id: string;
  id_organizer?: string;
  name: string;
  email: string;
  phone_number?: string;
  phone?: string;
  address: string;
  description?: string;
  website?: string;
  status: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

export interface OrganizerState {
  organizers: Organizer[];
  currentOrganizer: Organizer | null;
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  totalOrganizers: number;
}

// Async thunks
export const fetchOrganizers = createAsyncThunk(
  'organizers/fetchOrganizers',
  async (params: { page?: number; limit?: number; search?: string; status?: string } = {}, { rejectWithValue }) => {
    try {
      const data = await organizersAPI.getAll(params);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch organizers';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchAllOrganizers = createAsyncThunk(
  'organizers/fetchAllOrganizers',
  async (_, { rejectWithValue }) => {
    try {
      const data = await organizersAPI.getAllOrganizers();
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch organizers';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchOrganizerById = createAsyncThunk(
  'organizers/fetchOrganizerById',
  async (organizerId: string, { rejectWithValue }) => {
    try {
      const data = await organizersAPI.getById(organizerId);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch organizer';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createOrganizer = createAsyncThunk(
  'organizers/createOrganizer',
  async (organizerData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    description?: string;
    website?: string;
    status: string;
  }, { rejectWithValue }) => {
    try {
      const data = await organizersAPI.create(organizerData);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create organizer';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateOrganizer = createAsyncThunk(
  'organizers/updateOrganizer',
  async ({ id, updates }: { id: string; updates: Partial<Organizer> }, { rejectWithValue }) => {
    try {
      const data = await organizersAPI.update(id, updates as {
        name: string;
        email: string;
        phone: string;
        address: string;
        description?: string;
        website?: string;
      });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update organizer';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateOrganizerStatus = createAsyncThunk(
  'organizers/updateOrganizerStatus',
  async ({ id, status }: { id: string; status: '1' | '0' }, { rejectWithValue }) => {
    try {
      const data = await organizersAPI.updateStatus(id, status);
      return { ...data, id, status };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update organizer status';
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteOrganizer = createAsyncThunk(
  'organizers/deleteOrganizer',
  async (organizerId: string, { rejectWithValue }) => {
    try {
      await organizersAPI.delete(organizerId);
      return organizerId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete organizer';
      return rejectWithValue(errorMessage);
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
  totalOrganizers: 0,
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

    // Fetch all organizers (role organizer)
    builder
      .addCase(fetchAllOrganizers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrganizers.fulfilled, (state, action) => {
        state.loading = false;
        state.organizers = action.payload.data || action.payload;
      })
      .addCase(fetchAllOrganizers.rejected, (state, action) => {
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
        const index = state.organizers.findIndex(
          organizer => organizer.id_organizer === action.payload.id || organizer.id === action.payload.id
        );
        if (index !== -1) {
          state.organizers[index] = {
            ...state.organizers[index],
            status: action.payload.status,
          };
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
