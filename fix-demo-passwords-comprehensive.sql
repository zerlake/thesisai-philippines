-- Comprehensive fix for demo user passwords - updates both auth.users and auth.identities
-- This ensures both tables have consistent data for advisor and critic accounts

DO $$
DECLARE
  advisor_user_id UUID;
  critic_user_id UUID;
BEGIN
  -- Get the user IDs for advisor and critic
  SELECT id INTO advisor_user_id FROM auth.users WHERE email = 'demo-advisor@thesis.ai';
  SELECT id INTO critic_user_id FROM auth.users WHERE email = 'demo-critic@thesis.ai';

  -- Update advisor password
  UPDATE auth.users
  SET encrypted_password = crypt('demo123456', gen_salt('bf')),
      email_confirmed_at = NOW(),
      updated_at = NOW()
  WHERE email = 'demo-advisor@thesis.ai';

  RAISE NOTICE 'Updated advisor password in auth.users';

  -- Update critic password
  UPDATE auth.users
  SET encrypted_password = crypt('demo123456', gen_salt('bf')),
      email_confirmed_at = NOW(),
      updated_at = NOW()
  WHERE email = 'demo-critic@thesis.ai';

  RAISE NOTICE 'Updated critic password in auth.users';

  -- Update identities table to ensure consistency
  IF advisor_user_id IS NOT NULL THEN
    UPDATE auth.identities
    SET identity_data = jsonb_set(identity_data, '{email_verified}', 'true'::jsonb)
    WHERE user_id = advisor_user_id;

    RAISE NOTICE 'Updated advisor identity data';
  END IF;

  IF critic_user_id IS NOT NULL THEN
    UPDATE auth.identities
    SET identity_data = jsonb_set(identity_data, '{email_verified}', 'true'::jsonb)
    WHERE user_id = critic_user_id;

    RAISE NOTICE 'Updated critic identity data';
  END IF;

  -- Verify updates
  RAISE NOTICE 'Demo users verification:';
  FOR user_record IN
    SELECT email, id, email_confirmed_at FROM auth.users
    WHERE email LIKE 'demo-%'
    ORDER BY email
  LOOP
    RAISE NOTICE '  - %: % (confirmed at: %)', user_record.email, user_record.id, user_record.email_confirmed_at;
  END LOOP;

  -- Check if identities are properly set
  RAISE NOTICE 'Demo user identities:';
  FOR identity_record IN
    SELECT i.user_id, u.email, i.identity_data 
    FROM auth.identities i
    JOIN auth.users u ON i.user_id = u.id
    WHERE u.email LIKE 'demo-%'
    ORDER BY u.email
  LOOP
    RAISE NOTICE '  - % (%): %', identity_record.email, identity_record.user_id, identity_record.identity_data;
  END LOOP;

END $$;