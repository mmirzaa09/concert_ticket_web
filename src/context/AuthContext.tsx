'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'organizer'
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (registerData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    description?: string;
    website?: string;
  }) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user data from localStorage on app start
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(userData)
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Connect to organizer login endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/organizer/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        console.error('Login failed:', response.statusText);
        return false;
      }

      const data = await response.json();
      
      // Transform organizer data to match auth interface
      const userData: User = {
        id: data.organizer?.id || data.organizer?.id_organizer,
        email: data.organizer?.email,
        name: data.organizer?.name,
        role: 'organizer',
      };

      setToken(data.token);
      setUser(userData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  const register = async (registerData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string;
    description?: string;
    website?: string;
  }): Promise<boolean> => {
    try {
      const backendData = {
        ...registerData,
        phone_number: registerData.phone,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/organizer/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      });

      if (!response.ok) {
        console.error('Registration failed:', response.statusText);
        return false;
      }

      // Registration successful, but don't auto-login
      // User must login separately after registration
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}