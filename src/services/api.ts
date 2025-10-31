import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/organizer/login', { email, password })
    return response.data
  },

  register: async (registerData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    description?: string;
    website?: string;
  }) => {
    const backendData = {
      ...registerData,
      phone_number: registerData.phone,
    }
    const response = await api.post('/api/organizer/register', backendData)
    return response.data
  },

  logout: async () => {
    const response = await api.post('/api/auth/logout')
    return response.data
  },

  verifyToken: async () => {
    const response = await api.get('/api/auth/verify')
    return response.data
  }
}

// Concerts API
export const concertsAPI = {
  // Get all concerts with optional filters
  getAll: async () => {
    const response = await api.get('/api/concert')
    return response.data
  },

  // Get concerts by organizer ID
  getByOrganizerId: async (organizerId: string) => {
    const response = await api.get(`/api/concert/organizer/${organizerId}`)
    return response.data
  },

  // Get specific concert by concert ID
  getById: async (id: string) => {
    const response = await api.get(`/api/concert/${id}`)
    return response.data
  },

  create: async (concertData: FormData | {
    title: string;
    description: string;
    date: string;
    venue: string;
    price: number;
    status: 'active' | 'inactive';
  }) => {
    const config = concertData instanceof FormData ? {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    } : {};
    
    const response = await api.post('/api/concert/create', concertData, config)
    return response.data
  },

  update: async (id: string, concertData: {
    title: string;
    description: string;
    date: string;
    venue: string;
    price: number;
    status: 'active' | 'inactive';
  }) => {
    const response = await api.put(`/api/concert/${id}`, concertData)
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/api/concert/${id}`)
    return response.data
  },

  updateStatus: async (id: string, status: 'active' | 'inactive') => {
    const response = await api.patch(`/api/concert/status/${id}`, { status })
    return response.data
  }
}

// Users API (Admin only)
export const usersAPI = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await api.get('/api/user/users', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/users/${id}`)
    return response.data
  },

  create: async (userData: {
    name: string;
    email: string;
    role: 'admin' | 'organizer';
    status: 'active' | 'inactive';
  }) => {
    const response = await api.post('/api/users', userData)
    return response.data
  },

  update: async (id: string, userData: {
    name: string;
    email: string;
    role: 'admin' | 'organizer';
    status: 'active' | 'inactive';
  }) => {
    const response = await api.put(`/api/users/${id}`, userData)
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/api/users/${id}`)
    return response.data
  },

  updateStatus: async (id: string, status: 'active' | 'inactive') => {
    const response = await api.patch(`/api/users/${id}/status`, { status })
    return response.data
  }
}

// Orders API (Admin only)
export const ordersAPI = {
  getAll: async () => {
    const response = await api.get('/api/order')
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/order/${id}`)
    return response.data
  },

  getAllWithDetails: async () => {
    const response = await api.get('/api/order/list')
    return response.data
  }
}

// Transactions API (Admin only)
export const transactionsAPI = {
  getAll: async () => {
    const response = await api.get('/api/transaction')
    return response.data
  },
  updateStatus: async (payload: { transaction_id: string; transaction_status: 'approved' | 'rejected' }) => {
    console.log('Updating transaction status:', payload)
    const response = await api.post(`/api/transaction/confirm`, payload)
    return response.data
  }
}


// Organizers API (Admin only)
export const organizersAPI = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await api.get('/api/organizers', { params })
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/organizers/${id}`)
    return response.data
  },

  create: async (organizerData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    description?: string;
    website?: string;
  }) => {
    const response = await api.post('/api/organizers', organizerData)
    return response.data
  },

  update: async (id: string, organizerData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    description?: string;
    website?: string;
  }) => {
    const response = await api.put(`/api/organizers/${id}`, organizerData)
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/api/organizers/${id}`)
    return response.data
  },

  updateStatus: async (id: string, status: 'active' | 'inactive') => {
    const response = await api.patch(`/api/organizers/status/${id}`, { status })
    return response.data
  }
}

export default api