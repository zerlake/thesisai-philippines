-- Reset advisor and critic demo user passwords
-- Run this in Supabase SQL Editor

UPDATE auth.users
SET encrypted_password = crypt('demo123456', gen_salt('bf')),
    updated_at = NOW()
WHERE email IN ('demo-advisor@thesis.ai', 'demo-critic@thesis.ai');

-- Verify the update
SELECT id, email, created_at, updated_at
FROM auth.users
WHERE email IN ('demo-advisor@thesis.ai', 'demo-critic@thesis.ai')
ORDER BY email;
