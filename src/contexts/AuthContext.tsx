'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  permissions: string[]
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  hasPermission: (resource: string, action: string) => boolean
  hasRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      if (!token) {
        setLoading(false)
        return
      }

      // Try to validate token with API
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          setPermissions(data.permissions)
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('auth-token')
          document.cookie = 'auth-token=; path=/; max-age=0'
        }
      } catch (apiError) {
        // If API fails (database not set up), create a mock user for development
        console.warn('Auth API not available, using mock user for development')
        const mockUser = {
          id: 'mock-user-id',
          email: 'demo@crm.com',
          first_name: 'Demo',
          last_name: 'User',
          role: 'admin' as const,
          status: 'active' as const,
          last_login: new Date().toISOString(),
          failed_login_attempts: 0,
          locked_until: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setUser(mockUser)
        setPermissions(['*:*']) // Admin permissions
      }
    } catch (error) {
      console.error('Auth check error:', error)
      localStorage.removeItem('auth-token')
      document.cookie = 'auth-token=; path=/; max-age=0'
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Login attempt:', { email, password }) // Debug log
    
    // Check for demo login first (before API call)
    if (email === 'demo@crm.com' && password === 'demo') {
      console.log('Demo admin login successful') // Debug log
      const mockToken = 'mock-token-' + Date.now()
      console.log('Setting token:', mockToken) // Debug log
      
      try {
        localStorage.setItem('auth-token', mockToken)
        document.cookie = `auth-token=${mockToken}; path=/; max-age=${24 * 60 * 60}`
        console.log('Token stored successfully') // Debug log
      } catch (storageError) {
        console.error('Storage error:', storageError) // Debug log
      }
      
      const mockUser = {
        id: 'mock-user-id',
        email: 'demo@crm.com',
        first_name: 'Demo',
        last_name: 'User',
        role: 'admin' as const,
        status: 'active' as const,
        last_login: new Date().toISOString(),
        failed_login_attempts: 0,
        locked_until: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      console.log('Setting user:', mockUser) // Debug log
      setUser(mockUser)
      setPermissions(['*:*'])
      
      // Force a small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100))
      
      console.log('Login function returning true') // Debug log
      return true
    }

    // Demo manager account
    if (email === 'manager@demo.com' && password === 'demo') {
      console.log('Demo manager login successful') // Debug log
      const mockToken = 'mock-token-manager-' + Date.now()
      localStorage.setItem('auth-token', mockToken)
      document.cookie = `auth-token=${mockToken}; path=/; max-age=${24 * 60 * 60}`
      
      const mockUser = {
        id: 'mock-manager-id',
        email: 'manager@demo.com',
        first_name: 'Demo',
        last_name: 'Manager',
        role: 'manager' as const,
        status: 'active' as const,
        last_login: new Date().toISOString(),
        failed_login_attempts: 0,
        locked_until: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setUser(mockUser)
      setPermissions(['customers:read', 'customers:create', 'customers:update', 'leads:read', 'leads:create', 'leads:update', 'activities:read', 'activities:create', 'activities:update', 'tasks:read', 'tasks:create', 'tasks:update', 'templates:read'])
      
      // Force a small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100))
      
      return true
    }

    // Demo sales rep account
    if (email === 'sales@demo.com' && password === 'demo') {
      console.log('Demo sales rep login successful') // Debug log
      const mockToken = 'mock-token-sales-' + Date.now()
      localStorage.setItem('auth-token', mockToken)
      document.cookie = `auth-token=${mockToken}; path=/; max-age=${24 * 60 * 60}`
      
      const mockUser = {
        id: 'mock-sales-id',
        email: 'sales@demo.com',
        first_name: 'Demo',
        last_name: 'Sales',
        role: 'sales_rep' as const,
        status: 'active' as const,
        last_login: new Date().toISOString(),
        failed_login_attempts: 0,
        locked_until: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setUser(mockUser)
      setPermissions(['customers:read', 'customers:create', 'customers:update', 'leads:read', 'leads:create', 'leads:update', 'activities:read', 'activities:create', 'activities:update', 'tasks:read', 'tasks:create', 'tasks:update'])
      
      // Force a small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100))
      
      return true
    }

    // Try real API login
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        localStorage.setItem('auth-token', data.token)
        document.cookie = `auth-token=${data.token}; path=/; max-age=${24 * 60 * 60}` // 24 hours
        setUser(data.user)
        
        // Fetch permissions
        const permResponse = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${data.token}`
          }
        })
        
        if (permResponse.ok) {
          const permData = await permResponse.json()
          setPermissions(permData.permissions)
        }

        return true
      }
      
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
    
    // If we get here, no login method worked
    console.log('No login method matched, returning false') // Debug log
    return false
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('auth-token')
      document.cookie = 'auth-token=; path=/; max-age=0'
      setUser(null)
      setPermissions([])
    }
  }

  const hasPermission = (resource: string, action: string): boolean => {
    return permissions.includes(`${resource}:${action}`) || permissions.includes('*:*')
  }

  const hasRole = (role: string): boolean => {
    return user?.role === role
  }

  const value = {
    user,
    permissions,
    loading,
    login,
    logout,
    hasPermission,
    hasRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
