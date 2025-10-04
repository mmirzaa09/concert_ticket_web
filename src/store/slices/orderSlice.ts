import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ordersAPI } from '../../services/api';

// Types
export interface Order {
  id: string;
  userId: string;
  concertId: string;
  quantity: number;
  totalAmount: number;
  paymentMethod?: string;
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
  createdAt: string;
  updatedAt: string;
  // Additional fields that might be included from joins
  userName?: string;
  userEmail?: string;
  concertTitle?: string;
  concertDate?: string;
  concertVenue?: string;
}

export interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  stats?: {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    failedOrders: number;
  };
}

// Async thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params: { 
    page?: number; 
    limit?: number; 
    status?: 'pending' | 'completed' | 'cancelled' | 'failed';
    search?: string;
    userId?: string;
    concertId?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const data = await ordersAPI.getAll(params);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const data = await ordersAPI.getById(orderId);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch order';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchOrderListDetails = createAsyncThunk(
  'orders/fetchOrderListDetails',
  async (_, { rejectWithValue }) => {
    try {
      const data = await ordersAPI.getAllWithDetails();
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch order details';
      return rejectWithValue(errorMessage);
    }
  }
);


// Initial state
const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
  stats: undefined,
};

// Slice
const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    clearOrders: (state) => {
      state.orders = [];
      state.currentOrder = null;
      state.error = null;
    },
    clearStats: (state) => {
      state.stats = undefined;
    },
  },
  extraReducers: (builder) => {
    // Fetch orders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data.orders;
        state.totalOrders = action.payload.data.totalOrders;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch order by ID
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch order list with details
    builder
      .addCase(fetchOrderListDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderListDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.listOrders = action.payload.data.listOrder;
        state.totalOrders = action.payload.data.totalOrder;
      })
      .addCase(fetchOrderListDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentOrder, clearOrders, clearStats } = orderSlice.actions;
export default orderSlice.reducer;
