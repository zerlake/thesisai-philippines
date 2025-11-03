-- Comprehensive fix for documents table RLS policies
-- This script ensures the policies are correctly set up for relationship between auth.users.id, public.profiles.id, and public.documents.user_id

-- First, confirm the foreign key relationship
-- The documents table should have user_id that references profiles.id, and profiles.id should match auth.users.id

-- Ensure the table uses RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Allow individual access to own documents" ON public.documents;
DROP POLICY IF EXISTS "Allow individual insert for own documents" ON public.documents;
DROP POLICY IF EXISTS "Allow individual update for own documents" ON public.documents;
DROP POLICY IF EXISTS "Allow individual delete for own documents" ON public.documents;

-- Create correct policies for documents table
-- Since documents.user_id references profiles.id, and profiles.id should match auth.users.id,
-- auth.uid() should equal documents.user_id

-- Policy for SELECT (users can only see their own documents)
CREATE POLICY "documents_select_policy" ON public.documents
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy for INSERT (users can only create documents for themselves)
CREATE POLICY "documents_insert_policy" ON public.documents
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE (users can only update their own documents)
CREATE POLICY "documents_update_policy" ON public.documents
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for DELETE (users can only delete their own documents)
CREATE POLICY "documents_delete_policy" ON public.documents
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Verify that the policies were created correctly
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM 
    pg_policies 
WHERE 
    tablename = 'documents'
ORDER BY 
    policyname;

-- Test query (this would work when run with an authenticated user context)
-- SELECT * FROM public.documents WHERE user_id = auth.uid() LIMIT 1;