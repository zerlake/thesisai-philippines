-- Fix RLS policies for documents table to work with the profiles reference

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow individual access to own documents" ON public.documents;
DROP POLICY IF EXISTS "Allow individual insert for own documents" ON public.documents;
DROP POLICY IF EXISTS "Allow individual update for own documents" ON public.documents;
DROP POLICY IF EXISTS "Allow individual delete for own documents" ON public.documents;

-- Create new policies that work with the documents table referencing profiles
-- Since user_id in documents points to profiles.id, and profiles.id points to auth.users.id,
-- we can check auth.uid() = user_id directly if the profile exists for that user

-- Policy for users to access their own documents
CREATE POLICY "Allow users to access own documents" ON public.documents
FOR SELECT
USING (
    -- Check that the user is authenticated and the document belongs to their profile
    auth.uid() = user_id
    AND EXISTS (
        -- Verify that a corresponding profile exists (should always be true after backfill)
        SELECT 1 FROM public.profiles WHERE id = user_id
    )
);

-- Policy for users to create their own documents
CREATE POLICY "Allow users to create own documents" ON public.documents
FOR INSERT
WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
        -- Verify that the user has a profile before allowing document creation
        SELECT 1 FROM public.profiles WHERE id = user_id
    )
);

-- Policy for users to update their own documents
CREATE POLICY "Allow users to update own documents" ON public.documents
FOR UPDATE
USING (
    auth.uid() = user_id
)
WITH CHECK (
    auth.uid() = user_id
);

-- Policy for users to delete their own documents
CREATE POLICY "Allow users to delete own documents" ON public.documents
FOR DELETE
USING (
    auth.uid() = user_id
);

-- Verify the policies were created
SELECT policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'documents'
ORDER BY policyname;

-- Test: Check if the currently authenticated user would have access to any documents
-- (This would need to be run with an auth context, but gives an idea if the policy works)
-- SELECT * FROM public.documents WHERE user_id = auth.uid();