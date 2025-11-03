-- Check that RLS policies are correctly set up for documents table

-- Check current RLS policies on documents table
SELECT 
    p.polname AS policyname,
    p.polcmd AS command,
    pg_get_expr(p.qual, p.polrelid) AS using_clause,
    pg_get_expr(p.with_check, p.polrelid) AS check_clause
FROM pg_policy p
JOIN pg_class c ON c.oid = p.polrelid
WHERE c.relname = 'documents'
ORDER BY p.polname;

-- Check if auth.uid() function is working in your context
-- This would typically be run when a user is authenticated
-- SELECT auth.uid(); -- This will return NULL if not run with a proper auth context

-- Verify the foreign key constraint on documents.user_id
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'documents' AND contype = 'f'
AND array_to_string(c.conkey, ',')::text LIKE '%user_id%';