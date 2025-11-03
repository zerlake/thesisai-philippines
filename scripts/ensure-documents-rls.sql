-- Ensure proper RLS policies on documents table

-- First, make sure RLS is enabled
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Policy for users to access their own documents
CREATE POLICY "Allow individual access to own documents" ON public.documents
FOR SELECT
USING (auth.uid() = user_id);

-- Policy for users to create their own documents
CREATE POLICY "Allow individual insert for own documents" ON public.documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own documents
CREATE POLICY "Allow individual update for own documents" ON public.documents
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy for users to delete their own documents
CREATE POLICY "Allow individual delete for own documents" ON public.documents
FOR DELETE
USING (auth.uid() = user_id);

-- Verify the policies were created
SELECT policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'documents';