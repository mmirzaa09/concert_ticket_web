'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('admin' | 'organizer')[]
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles = ['admin', 'organizer'], 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      // If user is not authenticated, redirect to login
      if (!user) {
        router.push(redirectTo)
        return
      }

      // If user is authenticated but doesn't have the right role, redirect to dashboard
      if (!allowedRoles.includes(user.role)) {
        router.push('/dashboard')
        return
      }
    }
  }, [user, isLoading, allowedRoles, redirectTo, router])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    )
  }

  // Don't render children if user is not authenticated or doesn't have proper role
  if (!user || !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}