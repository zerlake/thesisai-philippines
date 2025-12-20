-- Re-create the profiles for critic and advisor users

-- Update critic profile
INSERT INTO public.profiles (id, email, role, first_name, last_name, plan)
VALUES ('14a7ff7d-c6d2-4b27-ace1-32237ac28e02', 'demo-critic@thesis.ai', 'critic', 'Critic', 'Demo User', 'demo')
ON CONFLICT (id) DO UPDATE SET role = 'critic', first_name = 'Critic', last_name = 'Demo User', plan = 'demo';

-- Update advisor profile
INSERT INTO public.profiles (id, email, role, first_name, last_name, plan)
VALUES ('ff79d401-5614-4de8-9f17-bc920f360dcf', 'demo-advisor@thesis.ai', 'advisor', 'Advisor', 'Demo User', 'demo')
ON CONFLICT (id) DO UPDATE SET role = 'advisor', first_name = 'Advisor', last_name = 'Demo User', plan = 'demo';

-- Update passwords for critic and advisor to demo123456
UPDATE auth.users
SET encrypted_password = crypt('demo123456', gen_salt('bf'))
WHERE email IN ('demo-critic@thesis.ai', 'demo-advisor@thesis.ai');

-- Verify
SELECT u.id, u.email, p.role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email LIKE 'demo-%@thesis.ai';
