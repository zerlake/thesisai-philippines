-- Add thesis_phase column to documents table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='thesis_phase') THEN
    ALTER TABLE documents
    ADD COLUMN thesis_phase TEXT NOT NULL DEFAULT 'write' 
      CHECK (thesis_phase IN ('conceptualize', 'research', 'write', 'submit'));
    
    -- Create index for phase queries
    CREATE INDEX IF NOT EXISTS idx_documents_phase ON documents(user_id, thesis_phase);
    
    -- Add comment
    COMMENT ON COLUMN documents.thesis_phase IS 'Current phase of the thesis: conceptualize, research, write, or submit';
  END IF;
END
$$;
