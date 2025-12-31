-- Create Feedback and Review Tables from Scratch
-- Created: 2025-12-29
-- Purpose: Create advisor_feedback and critic_reviews tables for document review workflow

-- ========================================
-- 1. Advisor Feedback Table
-- ========================================
CREATE TABLE IF NOT EXISTS advisor_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  feedback TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'needs_revision', 'approved')),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for advisor_feedback
CREATE INDEX IF NOT EXISTS idx_advisor_feedback_advisor
  ON advisor_feedback(advisor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_advisor_feedback_student
  ON advisor_feedback(student_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_advisor_feedback_document
  ON advisor_feedback(document_id);

CREATE INDEX IF NOT EXISTS idx_advisor_feedback_responded
  ON advisor_feedback(advisor_id, responded_at DESC)
  WHERE responded_at IS NOT NULL;

-- Enable RLS
ALTER TABLE advisor_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for advisor_feedback
CREATE POLICY "Advisors can view their own feedback"
  ON advisor_feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = advisor_id);

CREATE POLICY "Students can view feedback on their documents"
  ON advisor_feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Advisors can create feedback"
  ON advisor_feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = advisor_id);

CREATE POLICY "Advisors can update their own feedback"
  ON advisor_feedback FOR UPDATE
  TO authenticated
  USING (auth.uid() = advisor_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS advisor_feedback_updated_at ON advisor_feedback;
CREATE TRIGGER advisor_feedback_updated_at
  BEFORE UPDATE ON advisor_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 2. Update Critic Reviews Table (already exists)
-- ========================================
DO $$
BEGIN
  -- Add certification_status if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='critic_reviews' AND column_name='certification_status') THEN
    ALTER TABLE critic_reviews
    ADD COLUMN certification_status TEXT NOT NULL DEFAULT 'certified'
      CHECK (certification_status IN ('certified', 'critic_revision_requested'));
  END IF;

  -- Add fee if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='critic_reviews' AND column_name='fee') THEN
    ALTER TABLE critic_reviews
    ADD COLUMN fee NUMERIC(10, 2) DEFAULT 0;
  END IF;

  -- Add updated_at if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='critic_reviews' AND column_name='updated_at') THEN
    ALTER TABLE critic_reviews
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Create indexes after columns exist
CREATE INDEX IF NOT EXISTS idx_critic_reviews_certified
  ON critic_reviews(critic_id, certification_status)
  WHERE certification_status = 'certified';

-- Trigger for critic_reviews updated_at
DROP TRIGGER IF EXISTS critic_reviews_updated_at ON critic_reviews;
CREATE TRIGGER critic_reviews_updated_at
  BEFORE UPDATE ON critic_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Comments
-- ========================================
COMMENT ON TABLE advisor_feedback IS 'Stores advisor feedback and reviews for student documents';
COMMENT ON TABLE critic_reviews IS 'Stores critic panel reviews and certifications for approved documents';
COMMENT ON COLUMN advisor_feedback.status IS 'Review status: pending_review, needs_revision, or approved';
COMMENT ON COLUMN advisor_feedback.responded_at IS 'Timestamp when advisor provided feedback';
COMMENT ON COLUMN critic_reviews.certification_status IS 'Certification status: certified or critic_revision_requested';
COMMENT ON COLUMN critic_reviews.fee IS 'Review fee charged by critic (in PHP)';
