-- Add missing columns to documents table for TipTap editor support
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS content_json JSONB,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS is_autosave BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS thesis_phase TEXT;

-- Create index on content_json for performance
CREATE INDEX IF NOT EXISTS idx_documents_content_json ON documents USING GIN(content_json);

-- Update existing rows to have default values
UPDATE documents SET content_json = CASE 
  WHEN content IS NOT NULL THEN jsonb_build_object('type', 'doc', 'content', jsonb_build_array(
    jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(
      jsonb_build_object('type', 'text', 'text', content)
    ))
  ))
  ELSE jsonb_build_object('type', 'doc', 'content', jsonb_build_array())
END
WHERE content_json IS NULL;
