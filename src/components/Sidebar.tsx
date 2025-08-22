'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  Activity,
  BarChart3,
  CheckSquare,
  Mail,
  LogOut,
  User,
  Shield,
  Settings
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Leads', href: '/leads', icon: Target },
  { name: 'Activities', href: '/activities', icon: Activity },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Email Templates', href: '/email-templates', icon: Mail },
  { name: 'Pipeline', href: '/pipeline', icon: BarChart3 },
  // { name: 'Demo', href: '/demo', icon: LayoutDashboard },
]

const adminNavigation = [
  { name: 'Administration', href: '/admin', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, hasPermission } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  // Filter navigation based on permissions
  const filteredNavigation = navigation.filter(item => {
    switch (item.href) {
      case '/customers':
        return hasPermission('customers', 'read')
      case '/leads':
        return hasPermission('leads', 'read')
      case '/activities':
        return hasPermission('activities', 'read')
      case '/tasks':
        return hasPermission('tasks', 'read')
      case '/email-templates':
        return hasPermission('templates', 'read')
      default:
        return true // Dashboard and other general pages
    }
  })

  // Add admin navigation for admin users
  const allNavigation = user?.role === 'admin' 
    ? [...filteredNavigation, ...adminNavigation] 
    : filteredNavigation

  if (!user) {
    return null // Don't show sidebar if not authenticated
  }

  return (
    <div className="flex w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">CRM System</h1>
      </div>
      
      {/* User info */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {user.first_name} {user.last_name}
            </p>
            <div className="flex items-center">
              <Shield className="h-3 w-3 text-gray-400 mr-1" />
              <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-6">
        {allNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Logout button */}
      <div className="px-4 py-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
          Sign out
        </button>
      </div>
    </div>
  )
}
