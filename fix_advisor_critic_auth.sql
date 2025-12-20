-- Fix advisor and critic demo users - set email_confirmed_at and role
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  role = 'authenticated',
  updated_at = NOW()
WHERE email IN ('demo-advisor@thesis.ai', 'demo-critic@thesis.ai');

-- Verify the fix
SELECT id, email, email_confirmed_at, role
FROM auth.users
WHERE email IN ('demo-student@thesis.ai', 'demo-advisor@thesis.ai', 'demo-critic@thesis.ai', 'demo-admin@thesis.ai')
ORDER BY email;
