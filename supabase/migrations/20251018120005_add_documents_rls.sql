-- supabase/migrations/20251018120005_add_documents_rls.sql

-- 1. Allow users to see their own documents
CREATE POLICY "Allow individual access to own documents" ON public.documents
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Allow users to create their own documents
CREATE POLICY "Allow individual insert for own documents" ON public.documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Allow users to update their own documents
CREATE POLICY "Allow individual update for own documents" ON public.documents
FOR UPDATE
USING (auth.uid() = user_id);

-- 4. Allow users to delete their own documents
CREATE POLICY "Allow individual delete for own documents" ON public.documents
FOR DELETE
USING (auth.uid() = user_id);
