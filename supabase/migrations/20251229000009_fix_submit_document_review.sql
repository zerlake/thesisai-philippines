-- Fix submit_document_review Function Signature
-- Created: 2025-12-29
-- Purpose: Update function signature to match component expectations

-- Drop existing function with any signature
DROP FUNCTION IF EXISTS submit_document_review(UUID, UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS submit_document_review(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS submit_document_review(UUID, TEXT, TEXT, TEXT) CASCADE;

-- Create function with correct parameter order matching advisor-review-panel.tsx
CREATE OR REPLACE FUNCTION submit_document_review(
  p_document_id UUID,
  p_advisor_id UUID,
  p_comments TEXT,
  p_new_status TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id UUID;
  v_feedback_id UUID;
BEGIN
  -- Get the student ID from the document
  SELECT user_id INTO v_student_id
  FROM documents
  WHERE id = p_document_id;

  IF v_student_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Document not found');
  END IF;

  -- Insert feedback record
  INSERT INTO advisor_feedback (
    advisor_id,
    student_id,
    document_id,
    feedback,
    status,
    responded_at
  ) VALUES (
    p_advisor_id,
    v_student_id,
    p_document_id,
    p_comments,
    p_new_status,
    NOW()
  )
  RETURNING id INTO v_feedback_id;

  -- Update document status if provided
  IF p_new_status IS NOT NULL THEN
    UPDATE documents
    SET status = p_new_status,
        updated_at = NOW()
    WHERE id = p_document_id;
  END IF;

  -- Create notification for student
  INSERT INTO notifications (
    user_id,
    message,
    link,
    created_at
  ) VALUES (
    v_student_id,
    'Your advisor has reviewed your document',
    '/documents/' || p_document_id,
    NOW()
  );

  RETURN json_build_object(
    'success', true,
    'feedback_id', v_feedback_id
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION submit_document_review(UUID, UUID, TEXT, TEXT) TO authenticated;

-- Comment
COMMENT ON FUNCTION submit_document_review(UUID, UUID, TEXT, TEXT) IS 'Submit advisor feedback/review for a document with correct parameter order';
