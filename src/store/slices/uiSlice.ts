import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Modal {
  isOpen: boolean;
  type: 'confirm' | 'info' | 'error' | 'success' | 'custom';
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  loading: boolean;
  modal: Modal;
  notifications: Notification[];
  searchQuery: string;
  currentPage: string;
}

// Initial state
const initialState: UIState = {
  sidebarOpen: true,
  theme: 'light',
  loading: false,
  modal: {
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  },
  notifications: [],
  searchQuery: '',
  currentPage: 'dashboard',
};

// Slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },

    // Theme
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },

    // Loading
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Modal
    openModal: (state, action: PayloadAction<Omit<Modal, 'isOpen'>>) => {
      state.modal = {
        ...action.payload,
        isOpen: true,
      };
    },
    closeModal: (state) => {
      state.modal = {
        ...initialState.modal,
        isOpen: false,
      };
    },

    // Notifications
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Search
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearSearchQuery: (state) => {
      state.searchQuery = '';
    },

    // Current page
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload;
    },

    // Utility actions
    showSuccessNotification: (state, action: PayloadAction<{ title: string; message: string }>) => {
      const notification: Notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: 'success',
        title: action.payload.title,
        message: action.payload.message,
        duration: 5000,
      };
      state.notifications.push(notification);
    },
    showErrorNotification: (state, action: PayloadAction<{ title: string; message: string }>) => {
      const notification: Notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: 'error',
        title: action.payload.title,
        message: action.payload.message,
        duration: 7000,
      };
      state.notifications.push(notification);
    },
    showWarningNotification: (state, action: PayloadAction<{ title: string; message: string }>) => {
      const notification: Notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: 'warning',
        title: action.payload.title,
        message: action.payload.message,
        duration: 6000,
      };
      state.notifications.push(notification);
    },
    showInfoNotification: (state, action: PayloadAction<{ title: string; message: string }>) => {
      const notification: Notification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: 'info',
        title: action.payload.title,
        message: action.payload.message,
        duration: 5000,
      };
      state.notifications.push(notification);
    },

    // Confirmation modal shortcuts
    showConfirmModal: (state, action: PayloadAction<{
      title: string;
      message: string;
      onConfirm: () => void;
      onCancel?: () => void;
    }>) => {
      state.modal = {
        isOpen: true,
        type: 'confirm',
        title: action.payload.title,
        message: action.payload.message,
        onConfirm: action.payload.onConfirm,
        onCancel: action.payload.onCancel,
      };
    },
  },
});

export const {
  // Sidebar
  toggleSidebar,
  setSidebarOpen,
  
  // Theme
  toggleTheme,
  setTheme,
  
  // Loading
  setLoading,
  
  // Modal
  openModal,
  closeModal,
  
  // Notifications
  addNotification,
  removeNotification,
  clearNotifications,
  
  // Search
  setSearchQuery,
  clearSearchQuery,
  
  // Current page
  setCurrentPage,
  
  // Utility actions
  showSuccessNotification,
  showErrorNotification,
  showWarningNotification,
  showInfoNotification,
  
  // Confirmation modal
  showConfirmModal,
} = uiSlice.actions;

export default uiSlice.reducer;
