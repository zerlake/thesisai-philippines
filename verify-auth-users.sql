-- Verify all demo users in auth.users table
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  role,
  CASE WHEN encrypted_password IS NOT NULL THEN 'has_password' ELSE 'no_password' END as password_status
FROM auth.users
WHERE email IN ('demo-student@thesis.ai', 'demo-advisor@thesis.ai', 'demo-critic@thesis.ai', 'demo-admin@thesis.ai')
ORDER BY email;
