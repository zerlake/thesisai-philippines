-- Add Status Column to Documents Table
-- Created: 2025-12-29
-- Purpose: Add status tracking to documents for review workflow

-- Add status column to documents table
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft'
  CHECK (status IN (
    'draft',
    'pending_review',
    'needs_revision',
    'approved',
    'certified',
    'critic_revision_requested'
  ));

-- Create index for filtering by status
CREATE INDEX IF NOT EXISTS idx_documents_status
  ON documents(user_id, status);

CREATE INDEX IF NOT EXISTS idx_documents_status_updated
  ON documents(status, updated_at DESC);

-- Comment
COMMENT ON COLUMN documents.status IS 'Document review status: draft -> pending_review -> needs_revision/approved -> certified';
