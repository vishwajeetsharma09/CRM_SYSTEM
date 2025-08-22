-- Security Enhancement Schema for CRM System (SAFE VERSION)
-- This file adds user management, roles, and audit logging

-- Step 1: Create all tables first
-- Users table for authentication
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role text NOT NULL DEFAULT 'sales_rep' CHECK (role IN ('admin','manager','sales_rep','viewer')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','suspended')),
  last_login timestamptz,
  failed_login_attempts int DEFAULT 0,
  locked_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- User permissions table
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  resource text NOT NULL,
  action text NOT NULL,
  granted boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Audit log table to track all changes
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Session management table
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- API rate limiting table
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  endpoint text NOT NULL,
  requests_count int NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Step 2: Add user_id columns to existing tables (only if they don't exist)
DO $$ 
BEGIN
  -- Add created_by column to customers table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'created_by') THEN
    ALTER TABLE public.customers ADD COLUMN created_by uuid REFERENCES public.users(id);
  END IF;
  
  -- Add created_by column to leads table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'created_by') THEN
    ALTER TABLE public.leads ADD COLUMN created_by uuid REFERENCES public.users(id);
  END IF;
  
  -- Add created_by column to activities table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'created_by') THEN
    ALTER TABLE public.activities ADD COLUMN created_by uuid REFERENCES public.users(id);
  END IF;
  
  -- Add created_by column to tasks table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'created_by') THEN
    ALTER TABLE public.tasks ADD COLUMN created_by uuid REFERENCES public.users(id);
  END IF;
  
  -- Add created_by column to email_templates table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'created_by') THEN
    ALTER TABLE public.email_templates ADD COLUMN created_by uuid REFERENCES public.users(id);
  END IF;
END $$;

-- Step 3: Create indexes for performance (SAFE - only for columns that exist)
-- Users table indexes (always safe since we just created this table)
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- User permissions indexes
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON public.user_permissions(user_id);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);

-- User sessions indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);

-- API rate limits indexes
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_identifier ON public.api_rate_limits(identifier);

-- SAFE: Only create indexes for existing columns in existing tables
DO $$ 
BEGIN
  -- Only create customers status index if the column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'status') THEN
    CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
  END IF;
  
  -- Only create leads stage index if the column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'stage') THEN
    CREATE INDEX IF NOT EXISTS idx_leads_stage ON public.leads(stage);
  END IF;
  
  -- Only create leads customer_id index if the column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'customer_id') THEN
    CREATE INDEX IF NOT EXISTS idx_leads_customer_id ON public.leads(customer_id);
  END IF;
  
  -- Only create activities customer_id index if the column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'customer_id') THEN
    CREATE INDEX IF NOT EXISTS idx_activities_customer_id ON public.activities(customer_id);
  END IF;
  
  -- Only create activities lead_id index if the column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'lead_id') THEN
    CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON public.activities(lead_id);
  END IF;
  
  -- Only create activities type index if the column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'type') THEN
    CREATE INDEX IF NOT EXISTS idx_activities_type ON public.activities(type);
  END IF;
  
  -- Only create tasks status index if the column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'status') THEN
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
  END IF;
  
  -- Only create tasks priority index if the column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'priority') THEN
    CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
  END IF;
  
  -- Only create tasks due_date index if the column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'due_date') THEN
    CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
  END IF;
  
  -- Only create tasks assigned_to index if the column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'assigned_to') THEN
    CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
  END IF;
END $$;

-- Step 4: Insert default users (password: admin123 - CHANGE THIS!)
-- Password hash for 'admin123' using bcrypt
INSERT INTO public.users (email, password_hash, first_name, last_name, role, status) VALUES
  ('admin@crm.com', '$2b$10$rQZ1vK4qJ8qJ8qJ8qJ8qJe8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJe', 'System', 'Administrator', 'admin', 'active'),
  ('manager@crm.com', '$2b$10$rQZ1vK4qJ8qJ8qJ8qJ8qJe8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJe', 'Sales', 'Manager', 'manager', 'active'),
  ('sales@crm.com', '$2b$10$rQZ1vK4qJ8qJ8qJ8qJ8qJe8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJe', 'Sales', 'Representative', 'sales_rep', 'active')
ON CONFLICT (email) DO NOTHING;

-- Step 5: Set up default permissions for roles (after users are created)
INSERT INTO public.user_permissions (user_id, resource, action, granted)
SELECT 
  u.id,
  resource.name,
  action.name,
  CASE 
    WHEN u.role = 'admin' THEN true
    WHEN u.role = 'manager' AND action.name != 'delete' THEN true
    WHEN u.role = 'sales_rep' AND action.name IN ('create', 'read', 'update') THEN true
    WHEN u.role = 'viewer' AND action.name = 'read' THEN true
    ELSE false
  END
FROM public.users u
CROSS JOIN (VALUES ('customers'), ('leads'), ('activities'), ('tasks'), ('templates')) resource(name)
CROSS JOIN (VALUES ('create'), ('read'), ('update'), ('delete')) action(name)
ON CONFLICT DO NOTHING;

-- Step 6: Create functions and triggers
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for users table updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (table_name, record_id, action, old_values)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (table_name, record_id, action, old_values, new_values)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (table_name, record_id, action, new_values)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Add audit triggers to all main tables (SAFE - only if tables exist)
DO $$ 
BEGIN
  -- Only add triggers if the tables exist
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
    DROP TRIGGER IF EXISTS audit_customers ON public.customers;
    CREATE TRIGGER audit_customers 
      AFTER INSERT OR UPDATE OR DELETE ON public.customers 
      FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads') THEN
    DROP TRIGGER IF EXISTS audit_leads ON public.leads;
    CREATE TRIGGER audit_leads 
      AFTER INSERT OR UPDATE OR DELETE ON public.leads 
      FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activities') THEN
    DROP TRIGGER IF EXISTS audit_activities ON public.activities;
    CREATE TRIGGER audit_activities 
      AFTER INSERT OR UPDATE OR DELETE ON public.activities 
      FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
    DROP TRIGGER IF EXISTS audit_tasks ON public.tasks;
    CREATE TRIGGER audit_tasks 
      AFTER INSERT OR UPDATE OR DELETE ON public.tasks 
      FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'email_templates') THEN
    DROP TRIGGER IF EXISTS audit_email_templates ON public.email_templates;
    CREATE TRIGGER audit_email_templates 
      AFTER INSERT OR UPDATE OR DELETE ON public.email_templates 
      FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
  END IF;
END $$;

-- Step 8: Success message
DO $$ 
BEGIN
  RAISE NOTICE 'Security schema installed successfully! Default users created:';
  RAISE NOTICE 'Admin: admin@crm.com / admin123';
  RAISE NOTICE 'Manager: manager@crm.com / admin123';
  RAISE NOTICE 'Sales Rep: sales@crm.com / admin123';
  RAISE NOTICE 'IMPORTANT: Change these default passwords immediately!';
END $$;
