# How to Fix Demo User Passwords (Advisor & Critic)

## Issue
- Demo student and admin accounts work correctly
- Demo advisor and critic accounts fail with "Invalid login credentials"

## Root Cause
The advisor and critic demo users exist in the database but have incorrect password hashes.

## Solution: Run SQL in Supabase Dashboard

### Step 1: Open Supabase SQL Editor
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in to your account
3. Select your **thesis-ai** project
4. In the left sidebar, click on **SQL Editor**

### Step 2: Execute the Password Fix SQL
1. Click **New query** tab
2. Copy and paste the following SQL:

```sql
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
```

### Step 3: Run the Query
1. Click the **Run** button (or press Ctrl+Enter)
2. You should see a success message indicating that 2 rows were updated

### Step 4: Test the Login
1. Go back to your application
2. Try the demo login for advisor and critic accounts again
3. They should now work with the password `demo123456`

## Alternative: Run via Supabase CLI
If you prefer to use the CLI, you can run:

```bash
supabase db remote exec "UPDATE auth.users SET encrypted_password = crypt('demo123456', gen_salt('bf')) WHERE email IN ('demo-advisor@thesis.ai', 'demo-critic@thesis.ai');"
```

## Verification
You can verify that the users were updated by running:
```sql
SELECT email, id FROM auth.users WHERE email LIKE 'demo-%' ORDER BY email;
```

## Troubleshooting
If you continue to have issues:
1. Make sure your local `.env.local` file has the correct Supabase URL and keys
2. Verify that the demo users actually exist in your remote database
3. Check that the password is exactly `demo123456` (case-sensitive)