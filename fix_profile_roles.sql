-- Fix advisor and critic profile roles
UPDATE profiles
SET role = 'advisor'
WHERE email = 'demo-advisor@thesis.ai';

UPDATE profiles
SET role = 'critic'
WHERE email = 'demo-critic@thesis.ai';

-- Verify the fix
SELECT email, role FROM profiles 
WHERE email IN ('demo-student@thesis.ai', 'demo-advisor@thesis.ai', 'demo-critic@thesis.ai', 'demo-admin@thesis.ai')
ORDER BY email;
