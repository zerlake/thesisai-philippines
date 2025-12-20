# Manual Fix for Demo User Passwords

The advisor and critic demo accounts exist but have invalid passwords. To fix this, run the following SQL in the Supabase SQL Editor (https://app.supabase.com > Your Project > SQL Editor):

## SQL to Execute

```sql
-- Update advisor demo user password
UPDATE auth.users 
SET encrypted_password = crypt('demo123456', gen_salt('bf')),
    email_confirmed_at = NOW()
WHERE email = 'demo-advisor@thesis.ai';

-- Update critic demo user password
UPDATE auth.users 
SET encrypted_password = crypt('demo123456', gen_salt('bf')),
    email_confirmed_at = NOW()
WHERE email = 'demo-critic@thesis.ai';

-- Verify the updates
SELECT id, email, email_confirmed_at FROM auth.users 
WHERE email IN ('demo-advisor@thesis.ai', 'demo-critic@thesis.ai')
ORDER BY email;
```

## Steps:
1. Go to your Supabase project dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy and paste the SQL above
5. Click "Run" (or Ctrl+Enter)
6. You should see 2 rows updated and the verification query should show both users with email_confirmed_at set

## Verification:
After running the SQL, test demo login:
```bash
node test-all-demo-logins.mjs
```

All four accounts should now show ✓ SUCCESS.
