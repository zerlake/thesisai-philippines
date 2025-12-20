-- Complete regeneration of advisor and critic users
-- This script will fully reset and re-create these users from scratch

-- First, delete the identities for advisor and critic
DELETE FROM auth.identities
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('demo-advisor@thesis.ai', 'demo-critic@thesis.ai')
);

-- Delete the existing users
DELETE FROM auth.users
WHERE email IN ('demo-advisor@thesis.ai', 'demo-critic@thesis.ai');

-- Now re-create them with proper configuration
DO $$
DECLARE
  advisor_id uuid := 'ff79d401-5614-4de8-9f17-bc920f360dcf'::uuid;
  critic_id uuid := '14a7ff7d-c6d2-4b27-ace1-32237ac28e02'::uuid;
BEGIN
  -- Create advisor user
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud, confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) VALUES (
    advisor_id, '00000000-0000-0000-0000-000000000000'::uuid,
    'demo-advisor@thesis.ai', crypt('demo123456', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"role": "advisor", "first_name": "Advisor", "last_name": "Demo User", "plan": "demo", "isDemoAccount": true}'::jsonb,
    false, 'authenticated', 'authenticated', '', '', '', ''
  );

  -- Create critic user
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud, confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) VALUES (
    critic_id, '00000000-0000-0000-0000-000000000000'::uuid,
    'demo-critic@thesis.ai', crypt('demo123456', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"role": "critic", "first_name": "Critic", "last_name": "Demo User", "plan": "demo", "isDemoAccount": true}'::jsonb,
    false, 'authenticated', 'authenticated', '', '', '', ''
  );

  -- Create identities for both
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), advisor_id,
    jsonb_build_object('sub', advisor_id::text, 'email', 'demo-advisor@thesis.ai', 'email_verified', true),
    'email', 'demo-advisor@thesis.ai',
    NOW(), NOW(), NOW()
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), critic_id,
    jsonb_build_object('sub', critic_id::text, 'email', 'demo-critic@thesis.ai', 'email_verified', true),
    'email', 'demo-critic@thesis.ai',
    NOW(), NOW(), NOW()
  );

  RAISE NOTICE 'Created advisor and critic users successfully';
END $$;

-- Verify
SELECT id, email, email_confirmed_at, role FROM auth.users
WHERE email IN ('demo-advisor@thesis.ai', 'demo-critic@thesis.ai')
ORDER BY email;
