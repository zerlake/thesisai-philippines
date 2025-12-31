-- Fix RPC Function Signatures
-- Created: 2025-12-29
-- Purpose: Update RPC function signatures to match frontend component expectations

-- ========================================
-- 1. Fix submit_document_review function
-- Frontend expects: p_document_id, p_advisor_id, p_comments, p_new_status
-- ========================================
DROP FUNCTION IF EXISTS submit_document_review(UUID, UUID, TEXT, TEXT) CASCADE;

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
    responded_at,
    created_at
  ) VALUES (
    p_advisor_id,
    v_student_id,
    p_document_id,
    p_comments,
    p_new_status,
    NOW(),
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
END;
$$;

-- ========================================
-- 2. Fix submit_critic_review function
-- Frontend expects: p_document_id, p_new_status, p_comments, p_fee
-- Drop all possible overloaded versions
-- ========================================
-- Drop the existing function that was created in the previous migration
DROP FUNCTION IF EXISTS submit_critic_review(UUID, UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS submit_critic_review(UUID, TEXT, TEXT, NUMERIC) CASCADE;

CREATE OR REPLACE FUNCTION submit_critic_review(
  p_document_id UUID,
  p_new_status TEXT,
  p_comments TEXT,
  p_fee NUMERIC DEFAULT 0
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id UUID;
  v_critic_id UUID;
  v_review_id UUID;
BEGIN
  -- Get critic ID from session (will be passed via RLS context)
  v_critic_id := auth.uid();

  -- Get the student ID from the document
  SELECT user_id INTO v_student_id
  FROM documents
  WHERE id = p_document_id;

  IF v_student_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Document not found');
  END IF;

  -- Insert critic review
  INSERT INTO critic_reviews (
    critic_id,
    student_id,
    document_id,
    review,
    certification_status,
    fee,
    created_at
  ) VALUES (
    v_critic_id,
    v_student_id,
    p_document_id,
    p_comments,
    p_new_status,
    p_fee,
    NOW()
  )
  RETURNING id INTO v_review_id;

  -- Update document status
  UPDATE documents
  SET status = p_new_status,
      updated_at = NOW()
  WHERE id = p_document_id;

  -- Create notification for student
  INSERT INTO notifications (
    user_id,
    message,
    link,
    created_at
  ) VALUES (
    v_student_id,
    'Your document has been reviewed by a critic panel member',
    '/documents/' || p_document_id,
    NOW()
  );

  RETURN json_build_object(
    'success', true,
    'review_id', v_review_id
  );
END;
$$;

-- ========================================
-- Grant necessary permissions
-- ========================================
GRANT EXECUTE ON FUNCTION submit_document_review(UUID, UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_critic_review(UUID, TEXT, TEXT, NUMERIC) TO authenticated;

-- ========================================
-- Comments
-- ========================================
COMMENT ON FUNCTION submit_document_review(UUID, UUID, TEXT, TEXT) IS 'Submit advisor feedback/review for a document with correct parameter order: document_id, advisor_id, comments, new_status';
COMMENT ON FUNCTION submit_critic_review(UUID, TEXT, TEXT, NUMERIC) IS 'Submit critic review for a document with parameters: document_id, new_status, comments, fee';
