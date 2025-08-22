'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: { resource: string; action: string }
  requiredRole?: string
  fallback?: React.ReactNode
}

export function ProtectedRoute({ 
  children, 
  requiredPermission, 
  requiredRole,
  fallback = <div className="p-6"><div className="text-center text-gray-500">Access denied</div></div>
}: ProtectedRouteProps) {
  const { user, loading, hasPermission, hasRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return null
  }

  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return fallback
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission.resource, requiredPermission.action)) {
    return fallback
  }

  return <>{children}</>
}

// Higher-order component for easy wrapping
export function withAuth<T extends object>(
  Component: React.ComponentType<T>,
  options?: {
    requiredPermission?: { resource: string; action: string }
    requiredRole?: string
  }
) {
  return function AuthenticatedComponent(props: T) {
    return (
      <ProtectedRoute 
        requiredPermission={options?.requiredPermission}
        requiredRole={options?.requiredRole}
      >
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}
