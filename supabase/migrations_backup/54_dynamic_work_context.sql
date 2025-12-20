-- Add tracking columns to documents table
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS current_chapter VARCHAR,
ADD COLUMN IF NOT EXISTS phase_key VARCHAR,
ADD COLUMN IF NOT EXISTS completion_percentage NUMERIC DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP DEFAULT NOW();

-- Create student work context table
CREATE TABLE IF NOT EXISTS student_work_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_chapter VARCHAR,
  current_phase VARCHAR,
  active_document_id TEXT REFERENCES documents(id) ON DELETE SET NULL,
  context_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_student_context UNIQUE (student_id)
);

-- Create index for fast lookups
CREATE INDEX idx_student_work_context_student_id 
ON student_work_context(student_id);

-- Enable RLS
ALTER TABLE student_work_context ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Students can view their own work context"
ON student_work_context FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "Students can update their own work context"
ON student_work_context FOR UPDATE
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can insert their own work context"
ON student_work_context FOR INSERT
WITH CHECK (student_id = auth.uid());

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_student_work_context_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_student_work_context_timestamp ON student_work_context;

CREATE TRIGGER trigger_student_work_context_timestamp
BEFORE UPDATE ON student_work_context
FOR EACH ROW
EXECUTE FUNCTION update_student_work_context_timestamp();
