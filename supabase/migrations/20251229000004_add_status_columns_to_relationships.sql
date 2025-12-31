-- Add Status Columns to Relationship Tables
-- Created: 2025-12-29
-- Purpose: Add status tracking to advisor and critic relationship tables

-- Add status column to advisor_student_relationships
ALTER TABLE advisor_student_relationships
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive', 'completed'));

-- Add status column to critic_student_relationships
ALTER TABLE critic_student_relationships
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive', 'completed'));

-- Create index for filtering by status
CREATE INDEX IF NOT EXISTS idx_advisor_student_relationships_status
  ON advisor_student_relationships(advisor_id, status);

CREATE INDEX IF NOT EXISTS idx_critic_student_relationships_status
  ON critic_student_relationships(critic_id, status);

-- Comments
COMMENT ON COLUMN advisor_student_relationships.status IS 'Status of the advisor-student relationship: pending, active, inactive, or completed';
COMMENT ON COLUMN critic_student_relationships.status IS 'Status of the critic-student relationship: pending, active, inactive, or completed';
