import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {transactionsAPI} from '../../services/api';

// Define the Transaction type
interface Transaction {
  id: string;
  username: string;
  priceOrder: number;
  proofImage: string | null;
  status: 'pending' | 'approved' | 'rejected';
  dateUploaded: string | null;
  orderId: string;
  concertTitle?: string;
  paymentMethod?: string;
}

// Define the state structure for transactions
interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

const initialState: TransactionState = {
  transactions: [],
  loading: false,
  error: null,
};

// Async thunk to fetch all transactions
export const fetchAllTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await transactionsAPI.getAll();
      return response.data;
    } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

// Async thunk to update a transaction's status
export const updateTransactionStatus = createAsyncThunk(
  'transactions/updateStatus',
  async ({ transactionId, status }: { transactionId: string; status: 'approved' | 'rejected' }, { rejectWithValue }) => {
    try {
      const payload = { id_transaction: transactionId, transaction_status: status };
      const response = await transactionsAPI.updateStatus(payload);
      return response.data;
    } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        return rejectWithValue(err.response?.data?.message || 'Failed to update status');
    }
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all transactions
      .addCase(fetchAllTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTransactions.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        console.log('Transactions fetched successfully:', action.payload); // Debug log
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchAllTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update transaction status
      .addCase(updateTransactionStatus.pending, () => {
        // You might want to set a specific loading state for the item being updated
      })
      .addCase(updateTransactionStatus.fulfilled, (state, action: PayloadAction<Transaction>) => {
        const index = state.transactions.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
      })
      .addCase(updateTransactionStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default transactionSlice.reducer;
