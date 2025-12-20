# Quick Fix: Demo Login for Advisor & Critic

## Problem
- ✅ demo-student works
- ❌ demo-advisor fails (401)
- ❌ demo-critic fails (401)
- ✅ demo-admin works

## Solution (2 minutes)

### Step 1: Go to Supabase SQL Editor
- Open: https://app.supabase.com
- Select your **thesis-ai** project
- Left sidebar → **SQL Editor**
- Click **New query**

### Step 2: Copy & Paste This SQL

```sql
-- Fix demo user passwords
UPDATE auth.users 
SET encrypted_password = crypt('demo123456', gen_salt('bf'))
WHERE email IN ('demo-advisor@thesis.ai', 'demo-critic@thesis.ai');

-- Verify
SELECT email, id FROM auth.users 
WHERE email IN ('demo-advisor@thesis.ai', 'demo-critic@thesis.ai');
```

### Step 3: Execute
- Click **Run** (or Ctrl+Enter)
- Should show: "2 rows updated"

### Step 4: Verify
Open terminal and run:
```bash
node test-all-demo-logins.mjs
```

Expected output:
```
Testing: demo-student@thesis.ai
  ✓ SUCCESS

Testing: demo-advisor@thesis.ai
  ✓ SUCCESS

Testing: demo-critic@thesis.ai
  ✓ SUCCESS

Testing: demo-admin@thesis.ai
  ✓ SUCCESS
```

## Alternative: Use Existing Snippet

If you prefer, there's already a snippet in your project that recreates these users:
1. SQL Editor → **Snippets** (top right)
2. Find: **"Create Demo Critic and Advisor Users"**
3. Click to open
4. Click **Run** (or Ctrl+Enter)

This will recreate the accounts with correct passwords.

---

**That's it!** Once done, the demo login buttons on the login page will work for all 4 accounts.
