-- Create missing demo users: critic and advisor
-- This migration creates auth users with proper passwords

-- Temporarily disable the trigger that's causing issues
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

-- Create the users
DO $$
DECLARE
  critic_exists boolean;
  advisor_exists boolean;
  critic_id uuid := gen_random_uuid();
  advisor_id uuid := gen_random_uuid();
BEGIN
  -- Check if critic user exists
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'demo-critic@thesis.ai') INTO critic_exists;

  -- Check if advisor user exists
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'demo-advisor@thesis.ai') INTO advisor_exists;

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
      '00000000-0000-0000-0000-000000000000',
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

    -- Create profile manually since trigger is disabled
    INSERT INTO public.profiles (id, email, role, first_name, last_name, plan)
    VALUES (critic_id, 'demo-critic@thesis.ai', 'critic', 'Critic', 'Demo User', 'demo')
    ON CONFLICT (id) DO UPDATE SET role = 'critic', first_name = 'Critic', last_name = 'Demo User';

    -- Create identity record
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (
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
  END IF;

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
      '00000000-0000-0000-0000-000000000000',
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

    -- Create profile manually
    INSERT INTO public.profiles (id, email, role, first_name, last_name, plan)
    VALUES (advisor_id, 'demo-advisor@thesis.ai', 'advisor', 'Advisor', 'Demo User', 'demo')
    ON CONFLICT (id) DO UPDATE SET role = 'advisor', first_name = 'Advisor', last_name = 'Demo User';

    -- Create identity record
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (
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
  END IF;

END $$;

-- Re-enable the trigger
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;
