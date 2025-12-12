'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authAPI } from '../services/api'
import { useAppDispatch } from '../store/hooks'

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
  const dispatch = useAppDispatch()

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
      const data = await authAPI.login(email, password);

      // Check if organizer status is inactive (status = '0')
      if (data.data.status === '0') {
        throw new Error('Your account has been deactivated. Please contact administrator.');
      }

      const userData: User = {
        id: data.data.id_organizer,
        email: data.data.email,
        name: data.data.name,
        role: data.data.role,
      };

      setToken(data.data.token);
      setUser(userData);
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(userData));

      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
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
      await authAPI.register(registerData)
      return true
    } catch (error) {
      console.error('Registration error:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch({ type: 'user/logout' })
  }

  const value = {
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