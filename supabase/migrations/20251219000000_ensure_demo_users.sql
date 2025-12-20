-- Ensure all demo users exist with correct passwords and profiles
-- This migration is idempotent and safe to run multiple times

DO $$
DECLARE
  student_id uuid := '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7'::uuid;
  advisor_id uuid := 'ff79d401-5614-4de8-9f17-bc920f360dcf'::uuid;
  critic_id uuid := '14a7ff7d-c6d2-4b27-ace1-32237ac28e02'::uuid;
  admin_id uuid := '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7'::uuid;
BEGIN
  -- Update advisor password
  UPDATE auth.users 
  SET encrypted_password = crypt('demo123456', gen_salt('bf')), email_confirmed_at = NOW()
  WHERE email = 'demo-advisor@thesis.ai';

  -- Update critic password
  UPDATE auth.users 
  SET encrypted_password = crypt('demo123456', gen_salt('bf')), email_confirmed_at = NOW()
  WHERE email = 'demo-critic@thesis.ai';

  -- Update student password
  UPDATE auth.users 
  SET encrypted_password = crypt('demo123456', gen_salt('bf')), email_confirmed_at = NOW()
  WHERE email = 'demo-student@thesis.ai';

  -- Update admin password
  UPDATE auth.users 
  SET encrypted_password = crypt('demo123456', gen_salt('bf')), email_confirmed_at = NOW()
  WHERE email = 'demo-admin@thesis.ai';

  RAISE NOTICE 'Demo user passwords updated successfully';
END $$;
