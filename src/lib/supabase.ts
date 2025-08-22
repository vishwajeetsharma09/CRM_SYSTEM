import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

console.log('Supabase configuration:', {
  url: supabaseUrl,
  anonKey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined'
})

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  status: 'active' | 'inactive'
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  name: string
  email: string | null
  phone: string | null
  source: string | null
  stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'
  expected_value: number | null
  probability: number | null
  notes: string | null
  customer_id: string | null
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  subject: string
  body: string | null
  type: 'call' | 'email' | 'meeting' | 'note'
  due_at: string | null
  completed_at: string | null
  customer_id: string | null
  lead_id: string | null
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string | null
  completed_at: string | null
  assigned_to: string | null
  customer_id: string | null
  lead_id: string | null
  activity_id: string | null
  created_at: string
  updated_at: string
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  category: 'follow_up' | 'proposal' | 'meeting' | 'general' | 'custom'
  variables: string[] // Array of variable names like ['{customer_name}', '{company_name}']
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

// Security-related interfaces
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: 'admin' | 'manager' | 'sales_rep' | 'viewer'
  status: 'active' | 'inactive' | 'suspended'
  last_login: string | null
  failed_login_attempts: number
  locked_until: string | null
  created_at: string
  updated_at: string
}

export interface UserPermission {
  id: string
  user_id: string
  resource: string
  action: string
  granted: boolean
  created_at: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  table_name: string
  record_id: string
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  old_values: any
  new_values: any
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface UserSession {
  id: string
  user_id: string
  session_token: string
  expires_at: string
  ip_address: string | null
  user_agent: string | null
  created_at: string
}
