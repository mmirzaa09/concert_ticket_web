import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import concertSlice from './slices/concertSlice';
import organizerSlice from './slices/organizerSlice';
import uiSlice from './slices/uiSlice';
import userSlice from './slices/userSlice';
import orderSlice from './slices/orderSlice';
import transactionSlice from './slices/transactionSlice';

const appReducer = combineReducers({
  auth: authSlice,
  concerts: concertSlice,
  organizers: organizerSlice,
  ui: uiSlice,
  users: userSlice,
  orders: orderSlice,
  transactions: transactionSlice,
});

const rootReducer = (state: unknown, action: unknown) => {
  if (action.type === 'user/logout') {
    // You can also clear any persisted state from localStorage here if needed
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
