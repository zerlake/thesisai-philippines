-- Missing RPC Functions Migration
-- Created: 2025-12-29
-- Purpose: Create all missing RPC functions that are being called in the application

-- Drop existing functions if they exist with different signatures
DROP FUNCTION IF EXISTS get_advisor_dashboard_analytics(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_at_risk_students_for_advisor(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_critic_dashboard_analytics(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_students_for_critic_review(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_critic_students_details(UUID) CASCADE;
DROP FUNCTION IF EXISTS submit_document_review(UUID, UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS submit_critic_review(UUID, UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_payout_verification_status(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_referrer_details(UUID) CASCADE;

-- ========================================
-- 1. get_advisor_dashboard_analytics
-- Purpose: Get analytics data for advisor dashboard
-- ========================================
CREATE OR REPLACE FUNCTION get_advisor_dashboard_analytics(p_advisor_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  student_count INTEGER;
  avg_feedback_days NUMERIC;
BEGIN
  -- Count students assigned to this advisor
  SELECT COUNT(DISTINCT student_id)
  INTO student_count
  FROM advisor_student_relationships
  WHERE advisor_id = p_advisor_id
    AND status = 'active';

  -- Calculate average feedback turnaround time
  -- Using advisor_feedback table if it exists
  SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (responded_at - created_at)) / 86400), 0)
  INTO avg_feedback_days
  FROM advisor_feedback
  WHERE advisor_id = p_advisor_id
    AND responded_at IS NOT NULL
    AND created_at > NOW() - INTERVAL '90 days';

  -- Build JSON result
  result := json_build_object(
    'total_students', COALESCE(student_count, 0),
    'avg_feedback_days', ROUND(COALESCE(avg_feedback_days, 0), 1)
  );

  RETURN result;
END;
$$;

-- ========================================
-- 2. get_at_risk_students_for_advisor
-- Purpose: Get list of students with overdue milestones
-- ========================================
CREATE OR REPLACE FUNCTION get_at_risk_students_for_advisor(p_advisor_id UUID)
RETURNS TABLE (
  student_id UUID,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  overdue_milestone_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if academic_milestones table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'academic_milestones'
    AND table_schema = 'public'
  ) THEN
    RETURN QUERY
    SELECT
      p.id as student_id,
      p.first_name,
      p.last_name,
      p.avatar_url,
      COUNT(m.id) as overdue_milestone_count
    FROM profiles p
    INNER JOIN advisor_student_relationships asr
      ON p.id = asr.student_id
    INNER JOIN academic_milestones m
      ON p.id = m.user_id
    WHERE asr.advisor_id = p_advisor_id
      AND asr.status = 'active'
      AND m.completed = FALSE
      AND m.target_date < CURRENT_DATE
    GROUP BY p.id, p.first_name, p.last_name, p.avatar_url
    HAVING COUNT(m.id) > 0
    ORDER BY COUNT(m.id) DESC
    LIMIT 10;
  ELSE
    -- Return students without milestones if table doesn't exist
    RETURN QUERY
    SELECT
      p.id as student_id,
      p.first_name,
      p.last_name,
      p.avatar_url,
      0::BIGINT as overdue_milestone_count
    FROM profiles p
    INNER JOIN advisor_student_relationships asr
      ON p.id = asr.student_id
    WHERE asr.advisor_id = p_advisor_id
      AND asr.status = 'active'
    GROUP BY p.id, p.first_name, p.last_name, p.avatar_url
    LIMIT 10;
  END IF;
END;
$$;

-- ========================================
-- 3. get_critic_dashboard_analytics
-- Purpose: Get analytics data for critic dashboard
-- ========================================
CREATE OR REPLACE FUNCTION get_critic_dashboard_analytics(p_critic_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  student_count INTEGER;
  pending_reviews INTEGER;
  avg_turnaround NUMERIC;
  completed_month INTEGER;
BEGIN
  -- Count students assigned to this critic
  SELECT COUNT(DISTINCT student_id)
  INTO student_count
  FROM critic_student_relationships
  WHERE critic_id = p_critic_id
    AND status = 'active';

  -- Count pending reviews (approved documents waiting for critic review)
  SELECT COUNT(*)
  INTO pending_reviews
  FROM documents td
  INNER JOIN critic_student_relationships csr
    ON td.user_id = csr.student_id
  WHERE csr.critic_id = p_critic_id
    AND td.status = 'approved'
    AND NOT EXISTS (
      SELECT 1 FROM critic_reviews cr
      WHERE cr.document_id = td.id
        AND cr.critic_id = p_critic_id
    );

  -- Calculate average turnaround time for reviews
  SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (created_at - NOW())) / 86400), 0)
  INTO avg_turnaround
  FROM critic_reviews
  WHERE critic_id = p_critic_id
    AND created_at > NOW() - INTERVAL '90 days';

  -- Count completed reviews this month
  SELECT COUNT(*)
  INTO completed_month
  FROM critic_reviews
  WHERE critic_id = p_critic_id
    AND created_at >= DATE_TRUNC('month', CURRENT_DATE);

  -- Build JSON result
  result := json_build_object(
    'total_students', COALESCE(student_count, 0),
    'pending_reviews', COALESCE(pending_reviews, 0),
    'avg_turnaround_days', ABS(ROUND(COALESCE(avg_turnaround, 0), 1)),
    'completed_this_month', COALESCE(completed_month, 0)
  );

  RETURN result;
END;
$$;

-- ========================================
-- 4. get_students_for_critic_review
-- Purpose: Get list of students with documents ready for critic review
-- ========================================
CREATE OR REPLACE FUNCTION get_students_for_critic_review(p_critic_id UUID)
RETURNS TABLE (
  student_id UUID,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  document_id UUID,
  document_title TEXT,
  approved_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as student_id,
    p.first_name,
    p.last_name,
    p.avatar_url,
    td.id as document_id,
    td.title as document_title,
    td.updated_at as approved_at
  FROM profiles p
  INNER JOIN critic_student_relationships csr
    ON p.id = csr.student_id
  INNER JOIN documents td
    ON p.id = td.user_id
  WHERE csr.critic_id = p_critic_id
    AND csr.status = 'active'
    AND td.status = 'approved'
    AND NOT EXISTS (
      SELECT 1 FROM critic_reviews cr
      WHERE cr.document_id = td.id
        AND cr.critic_id = p_critic_id
    )
  ORDER BY td.updated_at ASC
  LIMIT 20;
END;
$$;

-- ========================================
-- 5. get_critic_students_details
-- Purpose: Get detailed list of all students assigned to a critic
-- ========================================
CREATE OR REPLACE FUNCTION get_critic_students_details(p_critic_id UUID)
RETURNS TABLE (
  student_id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  avatar_url TEXT,
  relationship_status TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE,
  total_documents INTEGER,
  pending_reviews INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as student_id,
    p.first_name,
    p.last_name,
    p.email,
    p.avatar_url,
    csr.status as relationship_status,
    csr.created_at as assigned_at,
    (SELECT COUNT(*)::INTEGER FROM documents WHERE user_id = p.id) as total_documents,
    (SELECT COUNT(*)::INTEGER FROM documents td
     WHERE td.user_id = p.id
       AND td.status = 'approved'
       AND NOT EXISTS (
         SELECT 1 FROM critic_reviews cr
         WHERE cr.document_id = td.id AND cr.critic_id = p_critic_id
       )
    ) as pending_reviews
  FROM profiles p
  INNER JOIN critic_student_relationships csr
    ON p.id = csr.student_id
  WHERE csr.critic_id = p_critic_id
  ORDER BY csr.created_at DESC;
END;
$$;

-- ========================================
-- 6. submit_document_review
-- Purpose: Submit advisor feedback/review for a document
-- Updated to match component parameter names
-- ========================================
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
END;
$$;

-- ========================================
-- 7. submit_critic_review
-- Purpose: Submit critic review for a document
-- ========================================
CREATE OR REPLACE FUNCTION submit_critic_review(
  p_critic_id UUID,
  p_document_id UUID,
  p_review_text TEXT,
  p_certification_status TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id UUID;
  v_review_id UUID;
BEGIN
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
    created_at
  ) VALUES (
    p_critic_id,
    v_student_id,
    p_document_id,
    p_review_text,
    p_certification_status,
    NOW()
  )
  RETURNING id INTO v_review_id;

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
-- 8. get_payout_verification_status
-- Purpose: Get payout verification status for a user
-- ========================================
CREATE OR REPLACE FUNCTION get_payout_verification_status(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  v_verified BOOLEAN;
  v_pending_amount NUMERIC;
BEGIN
  -- Check if user profile has payout verification fields
  SELECT
    COALESCE(payout_verified, false) as verified
  INTO v_verified
  FROM profiles
  WHERE id = p_user_id;

  -- Calculate pending payout amount (placeholder logic)
  v_pending_amount := 0;

  result := json_build_object(
    'verified', COALESCE(v_verified, false),
    'pending_amount', v_pending_amount
  );

  RETURN result;
END;
$$;

-- ========================================
-- 9. get_referrer_details
-- Purpose: Get details about a referrer user
-- ========================================
CREATE OR REPLACE FUNCTION get_referrer_details(p_referrer_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'id', p.id,
    'first_name', p.first_name,
    'last_name', p.last_name,
    'email', p.email,
    'avatar_url', p.avatar_url,
    'role', p.role,
    'referral_count', (
      SELECT COUNT(*)
      FROM profiles
      WHERE referred_by = p_referrer_id
    )
  )
  INTO result
  FROM profiles p
  WHERE p.id = p_referrer_id;

  RETURN COALESCE(result, '{}'::JSON);
END;
$$;

-- ========================================
-- Grant necessary permissions
-- ========================================
GRANT EXECUTE ON FUNCTION get_advisor_dashboard_analytics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_at_risk_students_for_advisor(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_critic_dashboard_analytics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_students_for_critic_review(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_critic_students_details(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_document_review(UUID, UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_critic_review(UUID, UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_payout_verification_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_referrer_details(UUID) TO authenticated;

-- ========================================
-- Comments
-- ========================================
COMMENT ON FUNCTION get_advisor_dashboard_analytics(UUID) IS 'Returns analytics data for advisor dashboard including student count and avg feedback turnaround';
COMMENT ON FUNCTION get_at_risk_students_for_advisor(UUID) IS 'Returns list of students with overdue milestones for a given advisor';
COMMENT ON FUNCTION get_critic_dashboard_analytics(UUID) IS 'Returns analytics data for critic dashboard including pending reviews and turnaround time';
COMMENT ON FUNCTION get_students_for_critic_review(UUID) IS 'Returns list of students with documents ready for critic review';
COMMENT ON FUNCTION get_critic_students_details(UUID) IS 'Returns detailed information about all students assigned to a critic';
COMMENT ON FUNCTION submit_document_review(UUID, UUID, TEXT, TEXT) IS 'Submit advisor feedback/review for a document and notify student';
COMMENT ON FUNCTION submit_critic_review(UUID, UUID, TEXT, TEXT) IS 'Submit critic review for a document and notify student';
COMMENT ON FUNCTION get_payout_verification_status(UUID) IS 'Returns payout verification status for a user';
COMMENT ON FUNCTION get_referrer_details(UUID) IS 'Returns detailed information about a referrer user';
