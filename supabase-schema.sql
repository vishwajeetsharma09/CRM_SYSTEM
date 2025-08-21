-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- customers table
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE,
  phone text,
  company text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  source text,
  stage text NOT NULL DEFAULT 'new' CHECK (stage IN ('new','contacted','qualified','proposal','won','lost')),
  expected_value numeric(12,2) DEFAULT 0,
  probability int DEFAULT 0 CHECK (probability BETWEEN 0 AND 100),
  notes text,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  body text,
  type text NOT NULL CHECK (type IN ('call','email','meeting','note')),
  due_at timestamptz,
  completed_at timestamptz,
  customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (customer_id IS NOT NULL AND lead_id IS NULL) OR
    (customer_id IS NULL AND lead_id IS NOT NULL)
  )
);

-- tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','cancelled')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  due_date timestamptz,
  completed_at timestamptz,
  assigned_to text, -- For now, just store email/name, later we can add user management
  customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  activity_id uuid REFERENCES public.activities(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- email_templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  category text NOT NULL DEFAULT 'general' CHECK (category IN ('follow_up','proposal','meeting','general','custom')),
  variables jsonb DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- pipeline view
CREATE OR REPLACE VIEW public.pipeline AS
  SELECT id, name, stage, expected_value, probability, created_at, updated_at
  FROM public.leads;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON public.leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_customer_id ON public.leads(customer_id);
CREATE INDEX IF NOT EXISTS idx_activities_customer_id ON public.activities(customer_id);
CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON public.activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON public.activities(type);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);

-- Insert sample data
INSERT INTO public.customers (name, email, phone, company, status, notes) VALUES
  ('John Smith', 'john@acme.com', '+1-555-0101', 'Acme Corp', 'active', 'Key decision maker'),
  ('Sarah Johnson', 'sarah@techstart.com', '+1-555-0102', 'TechStart Inc', 'active', 'Interested in enterprise solution'),
  ('Mike Wilson', 'mike@oldcompany.com', '+1-555-0103', 'Old Company LLC', 'inactive', 'No longer with company')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.leads (name, email, phone, source, stage, expected_value, probability, notes) VALUES
  ('Alice Brown', 'alice@newcompany.com', '+1-555-0201', 'Website', 'new', 50000, 20, 'Filled out contact form'),
  ('Bob Davis', 'bob@startup.com', '+1-555-0202', 'Referral', 'contacted', 75000, 40, 'Follow up scheduled'),
  ('Carol White', 'carol@enterprise.com', '+1-555-0203', 'Trade Show', 'qualified', 150000, 70, 'Budget approved'),
  ('David Lee', 'david@bigcorp.com', '+1-555-0204', 'Cold Call', 'proposal', 200000, 85, 'Proposal sent'),
  ('Eva Garcia', 'eva@success.com', '+1-555-0205', 'Website', 'won', 100000, 100, 'Contract signed'),
  ('Frank Miller', 'frank@lost.com', '+1-555-0206', 'Referral', 'lost', 50000, 0, 'Competitor won')
ON CONFLICT DO NOTHING;

INSERT INTO public.activities (subject, body, type, customer_id, lead_id, due_at) VALUES
  ('Initial Contact', 'Called to introduce our solution', 'call', NULL, (SELECT id FROM public.leads WHERE email = 'alice@newcompany.com' LIMIT 1), now() + interval '1 day'),
  ('Follow Up', 'Schedule demo meeting', 'meeting', NULL, (SELECT id FROM public.leads WHERE email = 'bob@startup.com' LIMIT 1), now() + interval '2 days'),
  ('Proposal Review', 'Review proposal with team', 'meeting', NULL, (SELECT id FROM public.leads WHERE email = 'david@bigcorp.com' LIMIT 1), now() + interval '3 days'),
  ('Customer Check-in', 'Quarterly business review', 'call', (SELECT id FROM public.customers WHERE email = 'john@acme.com' LIMIT 1), NULL, now() + interval '1 week')
ON CONFLICT DO NOTHING;

-- Insert sample tasks
INSERT INTO public.tasks (title, description, status, priority, due_date, assigned_to, customer_id, lead_id) VALUES
  ('Follow up with Alice Brown', 'Call to discuss proposal details', 'pending', 'high', now() + interval '1 day', 'sales@company.com', NULL, (SELECT id FROM public.leads WHERE email = 'alice@newcompany.com' LIMIT 1)),
  ('Prepare demo for Bob Davis', 'Create custom demo for startup needs', 'in_progress', 'medium', now() + interval '2 days', 'sales@company.com', NULL, (SELECT id FROM public.leads WHERE email = 'bob@startup.com' LIMIT 1)),
  ('Review contract with David Lee', 'Legal review of enterprise contract', 'pending', 'urgent', now() + interval '1 day', 'legal@company.com', NULL, (SELECT id FROM public.leads WHERE email = 'david@bigcorp.com' LIMIT 1)),
  ('Schedule QBR with John Smith', 'Quarterly business review meeting', 'pending', 'medium', now() + interval '1 week', 'account@company.com', (SELECT id FROM public.customers WHERE email = 'john@acme.com' LIMIT 1), NULL),
  ('Update customer database', 'Verify all customer contact information', 'pending', 'low', now() + interval '1 week', 'admin@company.com', NULL, NULL)
ON CONFLICT DO NOTHING;

-- Insert sample email templates
INSERT INTO public.email_templates (name, subject, body, category, variables, is_active) VALUES
  ('Initial Follow-up', 'Following up on our conversation', 'Hi {customer_name},\n\nThank you for your interest in our solution. I wanted to follow up on our recent conversation about {company_name}.\n\n{body}\n\nBest regards,\n{your_name}', 'follow_up', '["customer_name", "company_name", "body", "your_name"]', true),
  ('Demo Scheduling', 'Schedule your personalized demo', 'Hi {lead_name},\n\nThank you for your interest! I''d love to schedule a personalized demo to show you how our solution can help {company_name}.\n\n{body}\n\nPlease let me know your availability this week.\n\nBest regards,\n{your_name}', 'meeting', '["lead_name", "company_name", "body", "your_name"]', true),
  ('Proposal Follow-up', 'Your proposal is ready for review', 'Hi {customer_name},\n\nI''m excited to share your customized proposal for {company_name}.\n\n{body}\n\nPlease review and let me know if you have any questions.\n\nBest regards,\n{your_name}', 'proposal', '["customer_name", "company_name", "body", "your_name"]', true),
  ('Welcome Email', 'Welcome to our platform!', 'Hi {customer_name},\n\nWelcome to our platform! We''re excited to have {company_name} on board.\n\n{body}\n\nIf you need any assistance, don''t hesitate to reach out.\n\nBest regards,\n{your_name}', 'general', '["customer_name", "company_name", "body", "your_name"]', true)
ON CONFLICT DO NOTHING;
