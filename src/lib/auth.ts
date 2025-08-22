import { supabase } from './supabase'
import { User, UserSession } from './supabase'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// JWT Secret - In production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  token?: string
  error?: string
}

export interface SessionInfo {
  user: User
  permissions: string[]
  isValid: boolean
}

// Hash password for storage
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

// Generate JWT token
export function generateToken(user: User): string {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Login function
export async function login(credentials: LoginCredentials, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
  try {
    // Get user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', credentials.email)
      .eq('status', 'active')
      .single()

    if (userError || !user) {
      return { success: false, error: 'Invalid credentials' }
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return { success: false, error: 'Account is temporarily locked. Please try again later.' }
    }

    // Verify password
    const isValidPassword = await verifyPassword(credentials.password, user.password_hash)
    
    if (!isValidPassword) {
      // Increment failed login attempts
      const failedAttempts = user.failed_login_attempts + 1
      const lockUntil = failedAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null // Lock for 15 minutes after 5 failed attempts

      await supabase
        .from('users')
        .update({ 
          failed_login_attempts: failedAttempts,
          locked_until: lockUntil?.toISOString()
        })
        .eq('id', user.id)

      return { success: false, error: 'Invalid credentials' }
    }

    // Reset failed attempts and update last login
    await supabase
      .from('users')
      .update({ 
        failed_login_attempts: 0,
        locked_until: null,
        last_login: new Date().toISOString()
      })
      .eq('id', user.id)

    // Generate token and create session
    const token = generateToken(user)
    
    // Store session in database
    const { error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        session_token: token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        ip_address: ipAddress,
        user_agent: userAgent
      })

    if (sessionError) {
      console.error('Session creation error:', sessionError)
    }

    return { 
      success: true, 
      user: {
        ...user,
        password_hash: undefined // Don't send password hash to client
      } as User, 
      token 
    }

  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'Login failed' }
  }
}

// Logout function
export async function logout(token: string): Promise<boolean> {
  try {
    // Remove session from database
    const { error } = await supabase
      .from('user_sessions')
      .delete()
      .eq('session_token', token)

    return !error
  } catch (error) {
    console.error('Logout error:', error)
    return false
  }
}

// Get current user from token
export async function getCurrentUser(token: string): Promise<SessionInfo | null> {
  try {
    // Verify JWT token
    const decoded = verifyToken(token)
    if (!decoded) {
      return null
    }

    // Check if session exists and is valid
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('session_token', token)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (sessionError || !session) {
      return null
    }

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .eq('status', 'active')
      .single()

    if (userError || !user) {
      return null
    }

    // Get user permissions
    const { data: permissions, error: permError } = await supabase
      .from('user_permissions')
      .select('resource, action')
      .eq('user_id', user.id)
      .eq('granted', true)

    const permissionStrings = permissions?.map(p => `${p.resource}:${p.action}`) || []

    return {
      user: {
        ...user,
        password_hash: undefined // Don't send password hash to client
      } as User,
      permissions: permissionStrings,
      isValid: true
    }

  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

// Check if user has permission
export function hasPermission(userPermissions: string[], resource: string, action: string): boolean {
  return userPermissions.includes(`${resource}:${action}`) || userPermissions.includes('*:*')
}

// Rate limiting check
export async function checkRateLimit(identifier: string, endpoint: string, limit: number = 100, windowMinutes: number = 15): Promise<boolean> {
  try {
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000)
    
    // Get current count for this identifier and endpoint
    const { data: rateLimits, error } = await supabase
      .from('api_rate_limits')
      .select('requests_count')
      .eq('identifier', identifier)
      .eq('endpoint', endpoint)
      .gte('window_start', windowStart.toISOString())

    if (error) {
      console.error('Rate limit check error:', error)
      return true // Allow request if there's an error checking
    }

    const totalRequests = rateLimits?.reduce((sum, rl) => sum + rl.requests_count, 0) || 0
    
    if (totalRequests >= limit) {
      return false // Rate limit exceeded
    }

    // Record this request
    await supabase
      .from('api_rate_limits')
      .insert({
        identifier,
        endpoint,
        requests_count: 1,
        window_start: new Date().toISOString()
      })

    return true // Request allowed

  } catch (error) {
    console.error('Rate limiting error:', error)
    return true // Allow request if there's an error
  }
}

// Create new user (admin only)
export async function createUser(userData: {
  email: string
  password: string
  first_name: string
  last_name: string
  role: 'admin' | 'manager' | 'sales_rep' | 'viewer'
}): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Hash password
    const password_hash = await hashPassword(userData.password)

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: userData.email,
        password_hash,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, user: user as User }

  } catch (error) {
    console.error('Create user error:', error)
    return { success: false, error: 'Failed to create user' }
  }
}
