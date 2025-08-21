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
  created_at: string
  updated_at: string
}
