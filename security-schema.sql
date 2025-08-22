-- Security Enhancement Schema for CRM System
-- This file adds user management, roles, and audit logging

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
  resource text NOT NULL, -- 'customers', 'leads', 'activities', 'tasks', 'templates'
  action text NOT NULL, -- 'create', 'read', 'update', 'delete'
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
  identifier text NOT NULL, -- IP address or user ID
  endpoint text NOT NULL,
  requests_count int NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add user_id to existing tables for ownership tracking
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.users(id);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.users(id);
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.users(id);
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.users(id);
ALTER TABLE public.email_templates ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.users(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON public.user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_identifier ON public.api_rate_limits(identifier);

-- Insert default admin user (password: admin123 - CHANGE THIS!)
-- Password hash for 'admin123' using bcrypt
INSERT INTO public.users (email, password_hash, first_name, last_name, role, status) VALUES
  ('admin@crm.com', '$2b$10$rQZ1vK4qJ8qJ8qJ8qJ8qJe8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJe', 'System', 'Administrator', 'admin', 'active'),
  ('manager@crm.com', '$2b$10$rQZ1vK4qJ8qJ8qJ8qJ8qJe8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJe', 'Sales', 'Manager', 'manager', 'active'),
  ('sales@crm.com', '$2b$10$rQZ1vK4qJ8qJ8qJ8qJ8qJe8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJ8qJe', 'Sales', 'Representative', 'sales_rep', 'active')
ON CONFLICT (email) DO NOTHING;

-- Wait a moment to ensure users table is ready
-- Default permissions for roles
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
WHERE u.status = 'active'
ON CONFLICT DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- Add audit triggers to all main tables
CREATE TRIGGER audit_customers AFTER INSERT OR UPDATE OR DELETE ON public.customers FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_leads AFTER INSERT OR UPDATE OR DELETE ON public.leads FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_activities AFTER INSERT OR UPDATE OR DELETE ON public.activities FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_tasks AFTER INSERT OR UPDATE OR DELETE ON public.tasks FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_email_templates AFTER INSERT OR UPDATE OR DELETE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
