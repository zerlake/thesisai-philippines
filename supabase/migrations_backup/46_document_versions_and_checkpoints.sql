-- Document Versions table for storing document history and checkpoints
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content JSONB NOT NULL, -- Store Tiptap JSON structure
  title TEXT,
  version_type TEXT NOT NULL DEFAULT 'auto', -- 'auto', 'checkpoint', 'manual_save'
  checkpoint_label TEXT, -- For named checkpoints
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT -- Optional description for manual versions
);

-- Index for efficient version lookups
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_versions_user_id ON document_versions(user_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_checkpoint ON document_versions(document_id) WHERE checkpoint_label IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_versions
CREATE POLICY "Users can view own document versions" ON document_versions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own document versions" ON document_versions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own document versions" ON document_versions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Update documents table to store content as JSONB
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS content_json JSONB,
  ADD COLUMN IF NOT EXISTS last_checkpoint_id UUID REFERENCES document_versions(id),
  ADD COLUMN IF NOT EXISTS is_autosave BOOLEAN DEFAULT false;

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_documents_last_checkpoint ON documents(last_checkpoint_id);

-- Document Comments table for advisor feedback
CREATE TABLE IF NOT EXISTS document_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position_from INTEGER NOT NULL, -- Start position in text
  position_to INTEGER NOT NULL, -- End position in text
  text TEXT NOT NULL, -- Selected text being commented on
  comment TEXT NOT NULL, -- The comment content
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for comments
CREATE INDEX IF NOT EXISTS idx_document_comments_document ON document_comments(document_id);
CREATE INDEX IF NOT EXISTS idx_document_comments_user ON document_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_document_comments_unresolved ON document_comments(document_id) WHERE resolved = false;

-- Enable RLS for comments
ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;

-- RLS for comments - document owner and creator can read/write
CREATE POLICY "Users can view document comments for their documents" ON document_comments
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR 
    document_id IN (SELECT id FROM documents WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create comments on their documents" ON document_comments
  FOR INSERT TO authenticated
  WITH CHECK (
    document_id IN (SELECT id FROM documents WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their own comments" ON document_comments
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments" ON document_comments
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());
