-- Allow demo documents table to work without authentication
-- This is for development/demo purposes only

-- Add a policy that allows anyone to insert documents (for demo mode)
DROP POLICY IF EXISTS "Users can insert own documents" ON documents;

CREATE POLICY "Users can insert own documents" ON documents
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Also allow unauthenticated access for demo mode
CREATE POLICY "Demo allow insert unauthenticated" ON documents
  FOR INSERT TO anon
  WITH CHECK (true);

-- Update policy to allow unauthenticated updates on demo documents
DROP POLICY IF EXISTS "Users can update own documents" ON documents;

CREATE POLICY "Users can update own documents" ON documents
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Demo allow update unauthenticated" ON documents
  FOR UPDATE TO anon
  USING (true);

-- Update select policy
DROP POLICY IF EXISTS "Users can view own documents" ON documents;

CREATE POLICY "Users can view own documents" ON documents
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Demo allow select unauthenticated" ON documents
  FOR SELECT TO anon
  USING (true);

-- Update delete policy
DROP POLICY IF EXISTS "Users can delete own documents" ON documents;

CREATE POLICY "Users can delete own documents" ON documents
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Demo allow delete unauthenticated" ON documents
  FOR DELETE TO anon
  USING (true);
