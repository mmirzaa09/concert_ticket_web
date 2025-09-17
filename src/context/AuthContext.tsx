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
  register: (email: string, password: string, name: string, role: 'admin' | 'organizer') => Promise<boolean>
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
      // Mock API call - replace with actual API integration
      const mockUsers = [
        { id: '1', email: 'admin@test.com', password: 'admin123', name: 'Admin User', role: 'admin' as const },
        { id: '2', email: 'organizer@test.com', password: 'org123', name: 'Organizer User', role: 'organizer' as const }
      ]

      const foundUser = mockUsers.find(u => u.email === email && u.password === password)
      
      if (foundUser) {
        const mockToken = `mock-token-${foundUser.id}-${Date.now()}`
        const userData: User = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          role: foundUser.role
        }

        setToken(mockToken)
        setUser(userData)
        localStorage.setItem('token', mockToken)
        localStorage.setItem('user', JSON.stringify(userData))
        
        return true
      }
      
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const register = async (email: string, password: string, name: string, role: 'admin' | 'organizer'): Promise<boolean> => {
    try {
      // Mock API call - replace with actual API integration
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        role
      }

      const mockToken = `mock-token-${newUser.id}-${Date.now()}`
      
      setToken(mockToken)
      setUser(newUser)
      localStorage.setItem('token', mockToken)
      localStorage.setItem('user', JSON.stringify(newUser))
      
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