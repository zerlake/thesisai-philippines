-- Fix demo user passwords for advisor and critic
-- This updates the encrypted password field to the correct bcrypt hash

DO $$
DECLARE
  user_record RECORD;
BEGIN
  -- Update advisor password
  UPDATE auth.users
  SET encrypted_password = crypt('demo123456', gen_salt('bf'))
  WHERE email = 'demo-advisor@thesis.ai';

  RAISE NOTICE 'Updated advisor password';

  -- Update critic password
  UPDATE auth.users
  SET encrypted_password = crypt('demo123456', gen_salt('bf'))
  WHERE email = 'demo-critic@thesis.ai';

  RAISE NOTICE 'Updated critic password';

  -- Verify updates
  RAISE NOTICE 'Demo users status:';
  FOR user_record IN
    SELECT email, id FROM auth.users
    WHERE email LIKE 'demo-%'
    ORDER BY email
  LOOP
    RAISE NOTICE '  - %: %', user_record.email, user_record.id;
  END LOOP;
END $$;