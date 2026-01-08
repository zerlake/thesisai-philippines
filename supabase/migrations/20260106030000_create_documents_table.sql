-- Create Documents Table
-- Created: 2026-01-06
-- Purpose: Main documents table for user thesis documents

-- Enable pgcrypto extension for gen_random_uuid function
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB DEFAULT '{"type":"doc","content":[]}',
  status TEXT DEFAULT 'draft'
    CHECK (status IN (
      'draft',
      'pending_review',
      'needs_revision',
      'approved',
      'certified',
      'critic_revision_requested'
    )),
  word_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_updated ON documents(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(user_id, status);
CREATE INDEX IF NOT EXISTS idx_documents_status_updated ON documents(status, updated_at DESC);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create their own documents" ON documents;
DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;
DROP POLICY IF EXISTS "Advisors can view student documents" ON documents;
DROP POLICY IF EXISTS "Critics can view student documents" ON documents;

-- Create policies
CREATE POLICY "Users can create their own documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  TO authenticated
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can update their own documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can delete their own documents"
  ON documents FOR DELETE
  TO authenticated
  USING (auth.uid()::TEXT = user_id);

-- Note: Advisor and critic viewing policies can be added once their relationship tables are created
-- CREATE POLICY "Advisors can view student documents"
--   ON documents FOR SELECT
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM advisor_student_relationships
--       WHERE advisor_id = auth.uid()
--       AND student_id::TEXT = documents.user_id
--       AND status = 'active'
--     )
--   );

-- CREATE POLICY "Critics can view student documents"
--   ON documents FOR SELECT
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM critic_student_relationships
--       WHERE critic_id = auth.uid()
--       AND student_id::TEXT = documents.user_id
--       AND status = 'active'
--     )
--   );

-- Comments
COMMENT ON TABLE documents IS 'User documents including thesis chapters and drafts';
COMMENT ON COLUMN documents.user_id IS 'User ID as TEXT for consistency with auth.uid()';
COMMENT ON COLUMN documents.status IS 'Document review status: draft -> pending_review -> needs_revision/approved -> certified';
COMMENT ON COLUMN documents.content IS 'Document content as JSONB with structure {type:doc,content:[...]}';
