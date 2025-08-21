'use server'

import { supabase } from './supabase'
import { revalidatePath } from 'next/cache'

export async function getDashboardStats() {
  console.log('Fetching dashboard stats...')
  
  const [
    { count: totalCustomers, error: customersError },
    { count: activeLeads, error: leadsError },
    { count: dealsWonThisMonth, error: dealsError },
    { data: pipelineData, error: pipelineError }
  ] = await Promise.all([
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }).neq('stage', 'won').neq('stage', 'lost'),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('stage', 'won').gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    supabase.from('leads').select('expected_value').neq('stage', 'won').neq('stage', 'lost')
  ])

  console.log('Dashboard stats response:', { 
    totalCustomers, 
    activeLeads, 
    dealsWonThisMonth, 
    pipelineData,
    customersError,
    leadsError,
    dealsError,
    pipelineError
  })

  const totalPipelineValue = pipelineData?.reduce((sum, lead) => sum + (lead.expected_value || 0), 0) || 0

  return {
    totalCustomers: totalCustomers || 0,
    activeLeads: activeLeads || 0,
    dealsWonThisMonth: dealsWonThisMonth || 0,
    totalPipelineValue
  }
}

export async function getPipelineData() {
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .neq('stage', 'won')
    .neq('stage', 'lost')

  const totalValue = leads?.reduce((sum, lead) => sum + (lead.expected_value || 0), 0) || 0
  const totalLeads = leads?.length || 0

  return { totalValue, totalLeads }
}

export async function getLeadStages() {
  const { data: leads } = await supabase
    .from('leads')
    .select('stage')

  const stages = leads?.reduce((acc, lead) => {
    acc[lead.stage] = (acc[lead.stage] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return {
    ...stages,
    total: leads?.length || 0
  }
}

export async function getRecentActivities() {
  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  return activities || []
}

export async function getCustomers() {
  console.log('Fetching customers...')
  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })

  console.log('Customers response:', { customers, error })
  
  if (error) {
    console.error('Supabase error:', error)
    throw error
  }

  return customers || []
}

export async function getCustomer(id: string) {
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  return customer
}

export async function createCustomer(formData: FormData) {
  const customer = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    company: formData.get('company') as string,
    status: formData.get('status') as 'active' | 'inactive',
    notes: formData.get('notes') as string,
  }

  const { error } = await supabase
    .from('customers')
    .insert(customer)

  if (error) throw error

  revalidatePath('/customers')
  revalidatePath('/')
}

export async function updateCustomer(id: string, formData: FormData) {
  const customer = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    company: formData.get('company') as string,
    status: formData.get('status') as 'active' | 'inactive',
    notes: formData.get('notes') as string,
  }

  const { error } = await supabase
    .from('customers')
    .update(customer)
    .eq('id', id)

  if (error) throw error

  revalidatePath('/customers')
  revalidatePath(`/customers/${id}`)
  revalidatePath('/')
}

export async function deleteCustomer(id: string) {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)

  if (error) throw error

  revalidatePath('/customers')
  revalidatePath('/')
}

export async function getLeads() {
  const { data: leads } = await supabase
    .from('leads')
    .select('*, customers(name, company)')
    .order('created_at', { ascending: false })

  return leads || []
}

export async function getLead(id: string) {
  const { data: lead } = await supabase
    .from('leads')
    .select('*, customers(name, company)')
    .eq('id', id)
    .single()

  return lead
}

export async function createLead(formData: FormData) {
  const lead = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    source: formData.get('source') as string,
    stage: formData.get('stage') as 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost',
    expected_value: parseFloat(formData.get('expected_value') as string) || 0,
    probability: parseInt(formData.get('probability') as string) || 0,
    notes: formData.get('notes') as string,
    customer_id: formData.get('customer_id') as string || null,
  }

  const { error } = await supabase
    .from('leads')
    .insert(lead)

  if (error) throw error

  revalidatePath('/leads')
  revalidatePath('/pipeline')
  revalidatePath('/')
}

export async function updateLead(id: string, formData: FormData) {
  const lead = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    source: formData.get('source') as string,
    stage: formData.get('stage') as 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost',
    expected_value: parseFloat(formData.get('expected_value') as string) || 0,
    probability: parseInt(formData.get('probability') as string) || 0,
    notes: formData.get('notes') as string,
    customer_id: formData.get('customer_id') as string || null,
  }

  const { error } = await supabase
    .from('leads')
    .update(lead)
    .eq('id', id)

  if (error) throw error

  revalidatePath('/leads')
  revalidatePath('/pipeline')
  revalidatePath(`/leads/${id}`)
  revalidatePath('/')
}

export async function updateLeadStage(id: string, stage: string) {
  const { error } = await supabase
    .from('leads')
    .update({ stage })
    .eq('id', id)

  if (error) throw error

  revalidatePath('/leads')
  revalidatePath('/pipeline')
  revalidatePath('/')
}

export async function deleteLead(id: string) {
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id)

  if (error) throw error

  revalidatePath('/leads')
  revalidatePath('/pipeline')
  revalidatePath('/')
}

export async function getActivities() {
  const { data: activities } = await supabase
    .from('activities')
    .select('*, customers(name), leads(name)')
    .order('created_at', { ascending: false })

  return activities || []
}

export async function getActivity(id: string) {
  const { data: activity } = await supabase
    .from('activities')
    .select('*, customers(name), leads(name)')
    .eq('id', id)
    .single()

  return activity
}

export async function createActivity(formData: FormData) {
  const activity = {
    subject: formData.get('subject') as string,
    body: formData.get('body') as string,
    type: formData.get('type') as 'call' | 'email' | 'meeting' | 'note',
    due_at: formData.get('due_at') as string || null,
    customer_id: formData.get('customer_id') as string || null,
    lead_id: formData.get('lead_id') as string || null,
  }

  const { error } = await supabase
    .from('activities')
    .insert(activity)

  if (error) throw error

  revalidatePath('/activities')
  revalidatePath('/')
}

export async function updateActivity(id: string, formData: FormData) {
  const activity = {
    subject: formData.get('subject') as string,
    body: formData.get('body') as string,
    type: formData.get('type') as 'call' | 'email' | 'meeting' | 'note',
    due_at: formData.get('due_at') as string || null,
    customer_id: formData.get('customer_id') as string || null,
    lead_id: formData.get('lead_id') as string || null,
  }

  const { error } = await supabase
    .from('activities')
    .update(activity)
    .eq('id', id)

  if (error) throw error

  revalidatePath('/activities')
  revalidatePath('/')
}

// Task Management Functions
export async function getTasks() {
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, customers(name, company), leads(name, stage)')
    .order('due_date', { ascending: true })

  return tasks || []
}

export async function getTask(id: string) {
  const { data: task } = await supabase
    .from('tasks')
    .select('*, customers(name, company), leads(name, stage)')
    .eq('id', id)
    .single()

  return task
}

export async function getTasksByStatus(status: string) {
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, customers(name, company), leads(name, stage)')
    .eq('status', status)
    .order('due_date', { ascending: true })

  return tasks || []
}

export async function getOverdueTasks() {
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, customers(name, company), leads(name, stage)')
    .lt('due_date', new Date().toISOString())
    .neq('status', 'completed')
    .order('due_date', { ascending: true })

  return tasks || []
}

export async function createTask(formData: FormData) {
  const task = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    status: formData.get('status') as 'pending' | 'in_progress' | 'completed' | 'cancelled',
    priority: formData.get('priority') as 'low' | 'medium' | 'high' | 'urgent',
    due_date: formData.get('due_date') as string || null,
    assigned_to: formData.get('assigned_to') as string,
    customer_id: formData.get('customer_id') as string || null,
    lead_id: formData.get('lead_id') as string || null,
    activity_id: formData.get('activity_id') as string || null,
  }

  const { error } = await supabase
    .from('tasks')
    .insert(task)

  if (error) throw error

  revalidatePath('/tasks')
  revalidatePath('/')
}

export async function updateTask(id: string, formData: FormData) {
  const task = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    status: formData.get('status') as 'pending' | 'in_progress' | 'completed' | 'cancelled',
    priority: formData.get('priority') as 'low' | 'medium' | 'high' | 'urgent',
    due_date: formData.get('due_date') as string || null,
    assigned_to: formData.get('assigned_to') as string,
    customer_id: formData.get('customer_id') as string || null,
    lead_id: formData.get('lead_id') as string || null,
    activity_id: formData.get('activity_id') as string || null,
    completed_at: formData.get('status') === 'completed' ? new Date().toISOString() : null,
  }

  const { error } = await supabase
    .from('tasks')
    .update(task)
    .eq('id', id)

  if (error) throw error

  revalidatePath('/tasks')
  revalidatePath(`/tasks/${id}`)
  revalidatePath('/')
}

export async function deleteTask(id: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) throw error

  revalidatePath('/tasks')
  revalidatePath('/')
}

export async function updateTaskStatus(id: string, status: string) {
  const updateData: any = { status }
  
  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString()
  } else {
    updateData.completed_at = null
  }

  const { error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', id)

  if (error) throw error

  revalidatePath('/tasks')
  revalidatePath('/')
}

// Email Template Management Functions
export async function getEmailTemplates() {
  const { data: templates } = await supabase
    .from('email_templates')
    .select('*')
    .order('created_at', { ascending: false })

  return templates || []
}

export async function getEmailTemplate(id: string) {
  const { data: template } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', id)
    .single()

  return template
}

export async function getEmailTemplatesByCategory(category: string) {
  const { data: templates } = await supabase
    .from('email_templates')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('name', { ascending: true })

  return templates || []
}

export async function createEmailTemplate(formData: FormData) {
  const template = {
    name: formData.get('name') as string,
    subject: formData.get('subject') as string,
    body: formData.get('body') as string,
    category: formData.get('category') as 'follow_up' | 'proposal' | 'meeting' | 'general' | 'custom',
    variables: JSON.parse(formData.get('variables') as string || '[]'),
    is_active: formData.get('is_active') === 'true',
  }

  const { error } = await supabase
    .from('email_templates')
    .insert(template)

  if (error) throw error

  revalidatePath('/email-templates')
  revalidatePath('/')
}

export async function updateEmailTemplate(id: string, formData: FormData) {
  const template = {
    name: formData.get('name') as string,
    subject: formData.get('subject') as string,
    body: formData.get('body') as string,
    category: formData.get('category') as 'follow_up' | 'proposal' | 'meeting' | 'general' | 'custom',
    variables: JSON.parse(formData.get('variables') as string || '[]'),
    is_active: formData.get('is_active') === 'true',
  }

  const { error } = await supabase
    .from('email_templates')
    .update(template)
    .eq('id', id)

  if (error) throw error

  revalidatePath('/email-templates')
  revalidatePath(`/email-templates/${id}`)
  revalidatePath('/')
}

export async function deleteEmailTemplate(id: string) {
  const { error } = await supabase
    .from('email_templates')
    .delete()
    .eq('id', id)

  if (error) throw error

  revalidatePath('/email-templates')
  revalidatePath('/')
}

export async function toggleEmailTemplateStatus(id: string, isActive: boolean) {
  const { error } = await supabase
    .from('email_templates')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) throw error

  revalidatePath('/email-templates')
  revalidatePath('/')
}
