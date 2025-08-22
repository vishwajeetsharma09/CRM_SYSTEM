-- Diagnostic script to check existing table structure
-- Run this first to see what columns exist

-- Check customers table
SELECT 'customers' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'customers' 
ORDER BY ordinal_position;

-- Check leads table
SELECT 'leads' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'leads' 
ORDER BY ordinal_position;

-- Check activities table
SELECT 'activities' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'activities' 
ORDER BY ordinal_position;

-- Check tasks table
SELECT 'tasks' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'tasks' 
ORDER BY ordinal_position;

-- Check email_templates table
SELECT 'email_templates' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'email_templates' 
ORDER BY ordinal_position;

-- Check if tables exist
SELECT table_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('customers', 'leads', 'activities', 'tasks', 'email_templates');
