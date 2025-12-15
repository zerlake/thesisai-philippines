# Sample Data Troubleshooting Guide

## Error: Empty error object `{}`

If you're seeing `Fetch error: {}` in the console, this usually means:

1. **RLS Policy Issue** - SELECT permission not granted
2. **Migration Not Applied** - documents table or policies don't exist
3. **Session Issue** - User not properly authenticated

## Quick Diagnostic Steps

### Step 1: Verify Migrations Applied

Run in terminal:
```bash
supabase migration list
```

You should see:
```
02_documents_table.sql - Applied
```

If not applied, run:
```bash
supabase migration up
```

### Step 2: Check Supabase Connection

Open Supabase dashboard → SQL Editor and run:

```sql
-- Check if table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'documents';

-- Check RLS is enabled
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'documents';

-- Check policies exist
SELECT * FROM pg_policies 
WHERE tablename = 'documents';
```

Expected results:
- Table exists
- relrowsecurity = true
- 4 policies (SELECT, INSERT, UPDATE, DELETE)

### Step 3: Test INSERT Directly

In Supabase SQL Editor:

```sql
-- Test INSERT as authenticated user
INSERT INTO documents (user_id, title, content, status)
VALUES (
  auth.uid(),
  'Test Document',
  '<h1>Test</h1>',
  'draft'
);

-- Check if it was inserted
SELECT * FROM documents WHERE user_id = auth.uid();
```

### Step 4: Check Browser Console

When seeding, look for detailed error messages:

```
Inserting documents: 2
Response: 
Insert error: <detailed error here>
```

Copy the exact error message and check below.

## Common Errors & Solutions

### Error: "PostgreSQL error: relation "documents" does not exist"

**Cause:** Migration not applied

**Fix:**
```bash
# Apply all pending migrations
supabase migration up

# Verify
supabase migration list
```

### Error: "PostgreSQL error: permission denied for relation documents"

**Cause:** RLS policy doesn't allow INSERT

**Fix:** Check Supabase SQL Editor:
```sql
SELECT * FROM pg_policies WHERE tablename = 'documents';
```

Should show policy:
```
Users can insert own documents | INSERT | authenticated
```

If missing, run migration again:
```bash
supabase db pull  # Pull latest schema
supabase migration up
```

### Error: "new row violates row-level security policy"

**Cause:** user_id in insert doesn't match auth.uid()

**Fix:** The code should be setting `user_id: session.user.id` which matches `auth.uid()`. Check that session.user.id is a valid UUID.

In browser console after login:
```javascript
// Check authenticated user
console.log(supabase.auth.session?.user.id)
```

Should show a UUID like: `550e8400-e29b-41d4-a716-446655440000`

### Error: "Not authenticated" (401)

**Cause:** Session not properly established

**Fix:**
1. Log out completely: Click profile → Logout
2. Refresh page
3. Log in again with: `student@demo.thesisai.local` / `demo123456`
4. Wait for page to fully load
5. Then try seeding again

### Error: `{}`  (empty error object)

**Cause:** Unknown Supabase error - usually RLS or connection issue

**Fix:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try seeding again
4. Look for POST request to Supabase
5. Check response status and body
6. Share the exact error message

## How to Check If Seed Worked

### Method 1: Test Page Shows Documents

1. Click "Seed Documents"
2. Click "Check Status"
3. Should list 2 documents with content

### Method 2: Browser Console

After seeding, run:
```javascript
const { data } = await supabase
  .from('documents')
  .select('id, title')
  .eq('user_id', supabase.auth.session?.user.id);

console.log(data);  // Should show 2 documents
```

### Method 3: Supabase Dashboard

1. Go to Supabase dashboard
2. Select project
3. Go to SQL Editor
4. Run:

```sql
SELECT id, title, status, user_id, content_length
FROM documents
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'student@demo.thesisai.local')
ORDER BY created_at DESC;
```

Should show 2 rows.

### Method 4: Check /drafts Page

After seeding:
1. Navigate to `/drafts`
2. Should see 2 document cards
3. If not, try F5 refresh

## Database Schema Verification

Run in Supabase SQL Editor:

```sql
-- Complete schema check
\d documents

-- Check each column
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'documents'
ORDER BY ordinal_position;
```

Expected columns:
- id (uuid, not null)
- user_id (uuid, not null)
- title (text, not null)
- content (text, nullable)
- word_count (integer, default 0)
- updated_at (timestamp with time zone)
- created_at (timestamp with time zone)

## Environment Check

Verify `.env.local` has:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

Test connection:
```javascript
// In browser console
console.log(supabase.auth.session?.user.id)  // Should show UUID
```

## RLS Policy Testing

In Supabase SQL Editor, test each policy:

```sql
-- Test as authenticated user
-- First, get current user ID
SELECT auth.uid();

-- Test SELECT (should work)
SELECT * FROM documents WHERE user_id = auth.uid();

-- Test INSERT (should work)
INSERT INTO documents (user_id, title, content, status)
VALUES (auth.uid(), 'Test', '<p>Test</p>', 'draft');

-- Test UPDATE (should work)
UPDATE documents SET title = 'Updated' 
WHERE user_id = auth.uid() LIMIT 1;

-- Test DELETE (should work)
DELETE FROM documents 
WHERE user_id = auth.uid() LIMIT 1;
```

All should succeed.

## Enable Query Logging

To see actual SQL queries being run:

In Supabase SQL Editor:
```sql
-- Enable query logging
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- View recent queries
SELECT query, now() - query_start as duration
FROM pg_stat_statements
WHERE query LIKE '%documents%'
ORDER BY query_start DESC
LIMIT 10;
```

## Nuclear Option: Reset Database

⚠️ **WARNING: This deletes all data!**

Only do this if nothing else works:

```bash
# Drop and recreate
supabase db reset

# Then apply migrations
supabase migration up

# Seed again
```

## Asking for Help

When reporting the issue, include:

1. Browser console output (exact error message)
2. Migration status: `supabase migration list`
3. RLS policy output from SQL Editor
4. Session check: `supabase.auth.session?.user.id`
5. Network tab response (if API error)

## Useful Links

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Row Level Security Policy Examples](https://supabase.com/docs/guides/auth/row-level-security-examples)
- [Debug Supabase Locally](https://supabase.com/docs/guides/local-development)

---

**Still stuck?** Check the full documentation:
- `SAMPLE_DATA_DOCS_INDEX.md` - Complete guide
- `FINAL_SAMPLE_DATA_SETUP.md` - Implementation summary
- `TEST_SAMPLE_DATA_PAGE.md` - Test page guide
