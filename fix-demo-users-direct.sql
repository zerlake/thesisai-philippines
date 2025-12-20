-- Direct SQL to fix demo users password/auth issues
-- Run this in Supabase SQL editor or psql

-- First, let's check if users exist
SELECT id, email FROM auth.users WHERE email LIKE 'demo-%';

-- Update advisor password if user exists
UPDATE auth.users 
SET encrypted_password = crypt('demo123456', gen_salt('bf'))
WHERE email = 'demo-advisor@thesis.ai';

-- Update critic password if user exists  
UPDATE auth.users 
SET encrypted_password = crypt('demo123456', gen_salt('bf'))
WHERE email = 'demo-critic@thesis.ai';

-- Update student password if user exists
UPDATE auth.users 
SET encrypted_password = crypt('demo123456', gen_salt('bf'))
WHERE email = 'demo-student@thesis.ai';

-- Update admin password if user exists
UPDATE auth.users 
SET encrypted_password = crypt('demo123456', gen_salt('bf'))
WHERE email = 'demo-admin@thesis.ai';

-- Verify the updates
SELECT id, email, email_confirmed_at FROM auth.users WHERE email LIKE 'demo-%' ORDER BY email;
