import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, checkRateLimit } from './auth'

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/api/auth/login', '/api/health']

// API routes that need rate limiting
const RATE_LIMITED_ROUTES = ['/api/auth/login', '/api/customers', '/api/leads', '/api/activities', '/api/tasks']

export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for public routes and static files
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Get token from Authorization header or cookies
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value

  if (!token) {
    // Redirect to login for web pages, return 401 for API routes
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verify token and get user
  const sessionInfo = await getCurrentUser(token)
  
  if (!sessionInfo || !sessionInfo.isValid) {
    // Invalid token - redirect to login or return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Rate limiting for API routes
  if (pathname.startsWith('/api/') && RATE_LIMITED_ROUTES.some(route => pathname.startsWith(route))) {
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const isAllowed = await checkRateLimit(clientIP, pathname, 100, 15) // 100 requests per 15 minutes
    
    if (!isAllowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }
  }

  // Add user info to request headers for API routes
  const response = NextResponse.next()
  response.headers.set('x-user-id', sessionInfo.user.id)
  response.headers.set('x-user-role', sessionInfo.user.role)
  response.headers.set('x-user-permissions', JSON.stringify(sessionInfo.permissions))

  return response
}

// Permission checking utility for API routes
export function requirePermission(resource: string, action: string) {
  return (handler: Function) => {
    return async (request: NextRequest, context?: any) => {
      const userPermissions = JSON.parse(request.headers.get('x-user-permissions') || '[]')
      const hasAccess = userPermissions.includes(`${resource}:${action}`) || userPermissions.includes('*:*')
      
      if (!hasAccess) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      
      return handler(request, context)
    }
  }
}

// Role checking utility
export function requireRole(allowedRoles: string[]) {
  return (handler: Function) => {
    return async (request: NextRequest, context?: any) => {
      const userRole = request.headers.get('x-user-role')
      
      if (!userRole || !allowedRoles.includes(userRole)) {
        return NextResponse.json({ error: 'Insufficient role' }, { status: 403 })
      }
      
      return handler(request, context)
    }
  }
}
