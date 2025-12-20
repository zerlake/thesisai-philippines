-- Insert advisor demo user
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
VALUES (
  'ff79d401-5614-4de8-9f17-bc920f360dcf'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'demo-advisor@thesis.ai',
  crypt('demo123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"role": "advisor", "first_name": "Advisor", "last_name": "Demo User", "plan": "demo", "isDemoAccount": true}'::jsonb,
  false,
  'authenticated'
)
ON CONFLICT DO NOTHING;

-- Insert critic demo user
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
VALUES (
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'demo-critic@thesis.ai',
  crypt('demo123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"role": "critic", "first_name": "Critic", "last_name": "Demo User", "plan": "demo", "isDemoAccount": true}'::jsonb,
  false,
  'authenticated'
)
ON CONFLICT DO NOTHING;

-- Verify insertion
SELECT id, email FROM auth.users WHERE email IN ('demo-advisor@thesis.ai', 'demo-critic@thesis.ai');
