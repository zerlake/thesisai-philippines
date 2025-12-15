-- Run this SQL in Supabase Dashboard > SQL Editor
-- This adds the thesis_phase column to the documents table

-- Add thesis_phase column to documents table
ALTER TABLE documents
ADD COLUMN thesis_phase TEXT NOT NULL DEFAULT 'write' 
  CHECK (thesis_phase IN ('conceptualize', 'research', 'write', 'submit'));

-- Create index for phase queries
CREATE INDEX IF NOT EXISTS idx_documents_phase ON documents(user_id, thesis_phase);

-- Add comment
COMMENT ON COLUMN documents.thesis_phase IS 'Current phase of the thesis: conceptualize, research, write, or submit';
