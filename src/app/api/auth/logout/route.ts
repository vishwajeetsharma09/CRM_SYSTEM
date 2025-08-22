import { NextRequest, NextResponse } from 'next/server'
import { logout } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 400 }
      )
    }

    const success = await logout(token)

    if (success) {
      // Clear the cookie
      const response = NextResponse.json({ success: true })
      response.cookies.set('auth-token', '', { maxAge: 0 })
      return response
    } else {
      return NextResponse.json(
        { error: 'Logout failed' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Logout API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
