-- Add status column to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- Add check constraint for valid status values (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'documents' 
    AND constraint_name = 'documents_status_check'
  ) THEN
    ALTER TABLE documents ADD CONSTRAINT documents_status_check 
      CHECK (status IN ('draft', 'submitted', 'approved', 'rejected'));
  END IF;
END
$$;
