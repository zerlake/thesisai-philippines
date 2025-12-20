-- Create advisor and critic demo users
-- Run this SQL in your Supabase SQL Editor (Tables > SQL Editor)

DO $$
DECLARE
  advisor_id uuid := 'ff79d401-5614-4de8-9f17-bc920f360dcf'::uuid;
  critic_id uuid := '14a7ff7d-c6d2-4b27-ace1-32237ac28e02'::uuid;
  advisor_exists boolean;
  critic_exists boolean;
BEGIN
  -- Check if users already exist
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'demo-advisor@thesis.ai') INTO advisor_exists;
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'demo-critic@thesis.ai') INTO critic_exists;

  -- Create advisor user if doesn't exist
  IF NOT advisor_exists THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      aud,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) VALUES (
      advisor_id,
      '00000000-0000-0000-0000-000000000000'::uuid,
      'demo-advisor@thesis.ai',
      crypt('demo123456', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"role": "advisor", "first_name": "Advisor", "last_name": "Demo User", "plan": "demo", "isDemoAccount": true}'::jsonb,
      false,
      'authenticated',
      'authenticated',
      '',
      '',
      '',
      ''
    );

    INSERT INTO public.profiles (id, email, role, first_name, last_name, plan, isdemoacccount)
    VALUES (advisor_id, 'demo-advisor@thesis.ai', 'advisor', 'Advisor', 'Demo User', 'demo', true)
    ON CONFLICT (id) DO UPDATE SET
      role = 'advisor',
      first_name = 'Advisor',
      last_name = 'Demo User',
      email = 'demo-advisor@thesis.ai',
      plan = 'demo',
      updated_at = NOW(),
      isdemoacccount = true;

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      advisor_id,
      jsonb_build_object('sub', advisor_id::text, 'email', 'demo-advisor@thesis.ai', 'email_verified', true),
      'email',
      'demo-advisor@thesis.ai',
      NOW(),
      NOW(),
      NOW()
    );

    RAISE NOTICE 'Created advisor user with ID: %', advisor_id;
  ELSE
    RAISE NOTICE 'Advisor user already exists with ID: %', advisor_id;
  END IF;

  -- Create critic user if doesn't exist
  IF NOT critic_exists THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      aud,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) VALUES (
      critic_id,
      '00000000-0000-0000-0000-000000000000'::uuid,
      'demo-critic@thesis.ai',
      crypt('demo123456', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"role": "critic", "first_name": "Critic", "last_name": "Demo User", "plan": "demo", "isDemoAccount": true}'::jsonb,
      false,
      'authenticated',
      'authenticated',
      '',
      '',
      '',
      ''
    );

    INSERT INTO public.profiles (id, email, role, first_name, last_name, plan, isdemoacccount)
    VALUES (critic_id, 'demo-critic@thesis.ai', 'critic', 'Critic', 'Demo User', 'demo', true)
    ON CONFLICT (id) DO UPDATE SET
      role = 'critic',
      first_name = 'Critic',
      last_name = 'Demo User',
      email = 'demo-critic@thesis.ai',
      plan = 'demo',
      updated_at = NOW(),
      isdemoacccount = true;

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      critic_id,
      jsonb_build_object('sub', critic_id::text, 'email', 'demo-critic@thesis.ai', 'email_verified', true),
      'email',
      'demo-critic@thesis.ai',
      NOW(),
      NOW(),
      NOW()
    );

    RAISE NOTICE 'Created critic user with ID: %', critic_id;
  ELSE
    RAISE NOTICE 'Critic user already exists with ID: %', critic_id;
  END IF;

END $$;

-- Verify the users were created
SELECT id, email, role FROM auth.users WHERE email IN ('demo-advisor@thesis.ai', 'demo-critic@thesis.ai');
SELECT id, email, role FROM public.profiles WHERE email IN ('demo-advisor@thesis.ai', 'demo-critic@thesis.ai');
