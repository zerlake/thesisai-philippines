-- Change documents id column from UUID to TEXT to support chapter-based IDs
-- First, create a new documents table with TEXT id
CREATE TABLE documents_new (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  content_json JSONB,
  word_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  is_autosave BOOLEAN DEFAULT false,
  thesis_phase TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indices
CREATE INDEX IF NOT EXISTS idx_documents_new_user_updated ON documents_new(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_new_content_json ON documents_new USING GIN(content_json);

-- Copy data from old table (only if there's data to copy)
INSERT INTO documents_new 
SELECT 
  id::text,
  user_id,
  title,
  content,
  jsonb_build_object('type', 'doc', 'content', jsonb_build_array()),
  0,
  'draft',
  false,
  NULL,
  NOW(),
  NOW()
FROM documents;

-- Drop old table
DROP TABLE IF EXISTS documents CASCADE;

-- Rename new table
ALTER TABLE documents_new RENAME TO documents;

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies
CREATE POLICY "Users can view own documents" ON documents
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON documents
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON documents
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON documents
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Demo mode policies (allow unauthenticated access)
CREATE POLICY "Demo allow insert unauthenticated" ON documents
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Demo allow update unauthenticated" ON documents
  FOR UPDATE TO anon
  USING (true);

CREATE POLICY "Demo allow select unauthenticated" ON documents
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Demo allow delete unauthenticated" ON documents
  FOR DELETE TO anon
  USING (true);
