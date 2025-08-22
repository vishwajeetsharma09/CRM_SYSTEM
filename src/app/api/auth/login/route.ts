import { NextRequest, NextResponse } from 'next/server'
import { login } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Get client IP and user agent for security logging
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const result = await login({ email, password }, clientIP, userAgent)

    if (result.success) {
      return NextResponse.json({
        success: true,
        user: result.user,
        token: result.token
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
