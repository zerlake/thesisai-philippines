-- Create missing demo user profiles
-- First create the users via Supabase Dashboard > Authentication > Users > Add User:
--   - demo-critic@thesis.ai (password: demo123456)
--   - demo-advisor@thesis.ai (password: demo123456)
-- Then run this SQL to set up their profiles correctly:

-- Update critic profile
INSERT INTO public.profiles (id, email, role, first_name, last_name, plan)
SELECT id, email, 'critic', 'Critic', 'Demo User', 'demo'
FROM auth.users WHERE email = 'demo-critic@thesis.ai'
ON CONFLICT (id) DO UPDATE SET role = 'critic', first_name = 'Critic', last_name = 'Demo User', plan = 'demo';

-- Update advisor profile
INSERT INTO public.profiles (id, email, role, first_name, last_name, plan)
SELECT id, email, 'advisor', 'Advisor', 'Demo User', 'demo'
FROM auth.users WHERE email = 'demo-advisor@thesis.ai'
ON CONFLICT (id) DO UPDATE SET role = 'advisor', first_name = 'Advisor', last_name = 'Demo User', plan = 'demo';

-- Verify the users exist
SELECT u.id, u.email, p.role, p.first_name, p.last_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email IN ('demo-critic@thesis.ai', 'demo-advisor@thesis.ai', 'demo-student@thesis.ai', 'demo-admin@thesis.ai');
