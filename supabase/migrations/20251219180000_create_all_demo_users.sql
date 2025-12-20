-- Create all four demo users (student, advisor, critic, admin)
-- This migration creates auth users with proper passwords and profiles

-- Temporarily disable triggers
ALTER TABLE auth.users DISABLE TRIGGER IF EXISTS on_auth_user_created;

DO $$
DECLARE
  student_id uuid := '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7'::uuid;
  advisor_id uuid := 'ff79d401-5614-4de8-9f17-bc920f360dcf'::uuid;
  critic_id uuid := '14a7ff7d-c6d2-4b27-ace1-32237ac28e02'::uuid;
  admin_id uuid := '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7'::uuid;
  student_exists boolean;
  advisor_exists boolean;
  critic_exists boolean;
  admin_exists boolean;
BEGIN
  -- Check which users already exist
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'demo-student@thesis.ai') INTO student_exists;
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'demo-advisor@thesis.ai') INTO advisor_exists;
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'demo-critic@thesis.ai') INTO critic_exists;
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'demo-admin@thesis.ai') INTO admin_exists;

  -- Create student user if doesn't exist
  IF NOT student_exists THEN
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
      student_id,
      '00000000-0000-0000-0000-000000000000',
      'demo-student@thesis.ai',
      crypt('demo123456', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"role": "student", "first_name": "Student", "last_name": "Demo User", "plan": "demo", "isDemoAccount": true}'::jsonb,
      false,
      'authenticated',
      'authenticated',
      '',
      '',
      '',
      ''
    );

    INSERT INTO public.profiles (id, email, role, first_name, last_name, plan, isDemoAccount)
    VALUES (student_id, 'demo-student@thesis.ai', 'student', 'Student', 'Demo User', 'demo', true)
    ON CONFLICT (id) DO UPDATE SET role = 'student', first_name = 'Student', last_name = 'Demo User', isDemoAccount = true;

    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      student_id,
      jsonb_build_object('sub', student_id::text, 'email', 'demo-student@thesis.ai', 'email_verified', true),
      'email',
      'demo-student@thesis.ai',
      NOW(),
      NOW(),
      NOW()
    );

    RAISE NOTICE 'Created student user with ID: %', student_id;
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

    INSERT INTO public.profiles (id, email, role, first_name, last_name, plan, isDemoAccount)
    VALUES (advisor_id, 'demo-advisor@thesis.ai', 'advisor', 'Advisor', 'Demo User', 'demo', true)
    ON CONFLICT (id) DO UPDATE SET role = 'advisor', first_name = 'Advisor', last_name = 'Demo User', isDemoAccount = true;

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

    INSERT INTO public.profiles (id, email, role, first_name, last_name, plan, isDemoAccount)
    VALUES (critic_id, 'demo-critic@thesis.ai', 'critic', 'Critic', 'Demo User', 'demo', true)
    ON CONFLICT (id) DO UPDATE SET role = 'critic', first_name = 'Critic', last_name = 'Demo User', isDemoAccount = true;

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

  -- Create admin user if doesn't exist
  IF NOT admin_exists THEN
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
      admin_id,
      '00000000-0000-0000-0000-000000000000',
      'demo-admin@thesis.ai',
      crypt('demo123456', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"role": "admin", "first_name": "Admin", "last_name": "Demo User", "plan": "demo", "isDemoAccount": true}'::jsonb,
      false,
      'authenticated',
      'authenticated',
      '',
      '',
      '',
      ''
    );

    INSERT INTO public.profiles (id, email, role, first_name, last_name, plan, isDemoAccount)
    VALUES (admin_id, 'demo-admin@thesis.ai', 'admin', 'Admin', 'Demo User', 'demo', true)
    ON CONFLICT (id) DO UPDATE SET role = 'admin', first_name = 'Admin', last_name = 'Demo User', isDemoAccount = true;

    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      admin_id,
      jsonb_build_object('sub', admin_id::text, 'email', 'demo-admin@thesis.ai', 'email_verified', true),
      'email',
      'demo-admin@thesis.ai',
      NOW(),
      NOW(),
      NOW()
    );

    RAISE NOTICE 'Created admin user with ID: %', admin_id;
  END IF;

END $$;

-- Re-enable triggers
ALTER TABLE auth.users ENABLE TRIGGER IF EXISTS on_auth_user_created;
