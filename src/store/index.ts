import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import concertSlice from './slices/concertSlice';
import organizerSlice from './slices/organizerSlice';
import uiSlice from './slices/uiSlice';
import userSlice from './slices/userSlice';
import orderSlice from './slices/orderSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    concerts: concertSlice,
    organizers: organizerSlice,
    ui: uiSlice,
    users: userSlice,
    orders: orderSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
