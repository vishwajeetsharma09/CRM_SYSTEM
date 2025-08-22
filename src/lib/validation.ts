import { z } from 'zod'

// User validation schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  last_name: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  role: z.enum(['admin', 'manager', 'sales_rep', 'viewer'], {
    errorMap: () => ({ message: 'Invalid role' })
  })
})

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  first_name: z.string().min(1, 'First name is required').max(50, 'First name too long').optional(),
  last_name: z.string().min(1, 'Last name is required').max(50, 'Last name too long').optional(),
  role: z.enum(['admin', 'manager', 'sales_rep', 'viewer']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional()
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

// Customer validation schemas
export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().max(20, 'Phone number too long').optional().or(z.literal('')),
  company: z.string().max(100, 'Company name too long').optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']).default('active'),
  notes: z.string().max(1000, 'Notes too long').optional().or(z.literal(''))
})

export const updateCustomerSchema = createCustomerSchema.partial()

// Lead validation schemas
export const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().max(20, 'Phone number too long').optional().or(z.literal('')),
  source: z.string().max(50, 'Source too long').optional().or(z.literal('')),
  stage: z.enum(['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']).default('new'),
  expected_value: z.number().min(0, 'Expected value must be positive').max(999999999.99, 'Expected value too large').optional(),
  probability: z.number().min(0, 'Probability must be between 0 and 100').max(100, 'Probability must be between 0 and 100').optional(),
  notes: z.string().max(1000, 'Notes too long').optional().or(z.literal('')),
  customer_id: z.string().uuid('Invalid customer ID').optional().nullable()
})

export const updateLeadSchema = createLeadSchema.partial()

// Activity validation schemas
export const createActivitySchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  body: z.string().max(2000, 'Body too long').optional().or(z.literal('')),
  type: z.enum(['call', 'email', 'meeting', 'note'], {
    errorMap: () => ({ message: 'Invalid activity type' })
  }),
  due_at: z.string().datetime('Invalid due date').optional().nullable(),
  customer_id: z.string().uuid('Invalid customer ID').optional().nullable(),
  lead_id: z.string().uuid('Invalid lead ID').optional().nullable()
}).refine(
  (data) => (data.customer_id && !data.lead_id) || (!data.customer_id && data.lead_id),
  {
    message: 'Either customer_id or lead_id must be provided, but not both',
    path: ['customer_id']
  }
)

export const updateActivitySchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long').optional(),
  body: z.string().max(2000, 'Body too long').optional().or(z.literal('')),
  type: z.enum(['call', 'email', 'meeting', 'note']).optional(),
  due_at: z.string().datetime('Invalid due date').optional().nullable(),
  completed_at: z.string().datetime('Invalid completion date').optional().nullable(),
  customer_id: z.string().uuid('Invalid customer ID').optional().nullable(),
  lead_id: z.string().uuid('Invalid lead ID').optional().nullable()
})

// Task validation schemas
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional().or(z.literal('')),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  due_date: z.string().datetime('Invalid due date').optional().nullable(),
  assigned_to: z.string().max(100, 'Assigned to field too long').optional().or(z.literal('')),
  customer_id: z.string().uuid('Invalid customer ID').optional().nullable(),
  lead_id: z.string().uuid('Invalid lead ID').optional().nullable(),
  activity_id: z.string().uuid('Invalid activity ID').optional().nullable()
})

export const updateTaskSchema = createTaskSchema.partial()

// Email template validation schemas
export const createEmailTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  body: z.string().min(1, 'Body is required').max(10000, 'Body too long'),
  category: z.enum(['follow_up', 'proposal', 'meeting', 'general', 'custom']).default('general'),
  variables: z.array(z.string()).default([]),
  is_active: z.boolean().default(true)
})

export const updateEmailTemplateSchema = createEmailTemplateSchema.partial()

// API validation helpers
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      return { success: false, errors }
    }
    return { success: false, errors: ['Validation failed'] }
  }
}

// Rate limiting validation
export const rateLimitSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  endpoint: z.string().min(1, 'Endpoint is required'),
  limit: z.number().min(1, 'Limit must be positive').max(10000, 'Limit too high').default(100),
  windowMinutes: z.number().min(1, 'Window must be positive').max(1440, 'Window too long').default(15)
})

// Security validation
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string().min(1, 'Password confirmation is required')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

// IP address validation
export const ipAddressSchema = z.string().ip('Invalid IP address')

// UUID validation
export const uuidSchema = z.string().uuid('Invalid UUID')

// Pagination validation
export const paginationSchema = z.object({
  page: z.number().min(1, 'Page must be positive').default(1),
  limit: z.number().min(1, 'Limit must be positive').max(100, 'Limit too high').default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

// Search validation
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Search query too long'),
  filters: z.record(z.any()).optional()
})
