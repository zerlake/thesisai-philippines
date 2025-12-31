-- Student Next Action RPC Function
-- Created: 2025-12-29
-- Purpose: Moved from migrations_backup to active migrations
-- Returns prioritized next action for student dashboard

-- Drop old function if exists
DROP FUNCTION IF EXISTS get_student_next_action(UUID) CASCADE;

-- Create enhanced RPC function
CREATE OR REPLACE FUNCTION get_student_next_action(p_student_id UUID)
RETURNS TABLE(
  type VARCHAR,
  title VARCHAR,
  detail VARCHAR,
  urgency VARCHAR,
  action_key VARCHAR,
  href VARCHAR,
  id TEXT,
  key VARCHAR,
  deadline TIMESTAMP,
  chapter VARCHAR,
  phase VARCHAR,
  completion_percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result RECORD;
  v_milestones_exist BOOLEAN;
BEGIN
  -- Check if academic_milestones table exists
  v_milestones_exist := EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'academic_milestones'
    AND table_schema = 'public'
  );

  -- 1. Check for advisor feedback (HIGHEST PRIORITY)
  SELECT
    'feedback' as type,
    'Revise "' || COALESCE(d.title, 'Untitled') || '"' as title,
    'Your advisor has requested revisions.' as detail,
    'high' as urgency,
    'advisor_feedback' as action_key,
    '/drafts/' || d.id as href,
    d.id,
    NULL::VARCHAR as key,
    NULL::TIMESTAMP as deadline,
    d.current_chapter,
    d.phase_key,
    d.completion_percentage
  INTO v_result
  FROM documents d
  WHERE d.user_id = p_student_id
    AND d.status = 'pending_review'
  ORDER BY d.updated_at DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN QUERY SELECT
      v_result.type, v_result.title, v_result.detail, v_result.urgency,
      v_result.action_key, v_result.href, v_result.id, v_result.key,
      v_result.deadline, v_result.chapter, v_result.phase,
      v_result.completion_percentage;
    RETURN;
  END IF;

  -- 2. Check for overdue milestones (CRITICAL) - only if table exists
  IF v_milestones_exist THEN
    SELECT
      'milestone_overdue' as type,
      'Overdue: ' || m.title as title,
      EXTRACT(DAY FROM NOW() - m.target_date)::INT || ' days overdue' as detail,
      'critical' as urgency,
      'milestone_overdue' as action_key,
      '/thesis-phases/chapters' as href,
      NULL::TEXT as id,
      m.id::VARCHAR as key,
      m.target_date as deadline,
      NULL::VARCHAR as chapter,
      NULL::VARCHAR as phase,
      NULL::NUMERIC as completion_percentage
    INTO v_result
    FROM academic_milestones m
    WHERE m.user_id = p_student_id
      AND m.target_date < NOW()
      AND m.completed = FALSE
    ORDER BY m.target_date DESC
    LIMIT 1;

    IF FOUND THEN
      RETURN QUERY SELECT
        v_result.type, v_result.title, v_result.detail, v_result.urgency,
        v_result.action_key, v_result.href, v_result.id, v_result.key,
        v_result.deadline, v_result.chapter, v_result.phase,
        v_result.completion_percentage;
      RETURN;
    END IF;

    -- 3. Check for upcoming milestones (HIGH PRIORITY) - only if table exists
    SELECT
      'milestone_upcoming' as type,
      'Upcoming: ' || m.title as title,
      'Due in ' || EXTRACT(DAY FROM m.target_date - NOW())::INT || ' days' as detail,
      'high' as urgency,
      'milestone_upcoming' as action_key,
      '/thesis-phases/chapters' as href,
      NULL::TEXT as id,
      m.id::VARCHAR as key,
      m.target_date as deadline,
      NULL::VARCHAR as chapter,
      NULL::VARCHAR as phase,
      NULL::NUMERIC as completion_percentage
    INTO v_result
    FROM academic_milestones m
    WHERE m.user_id = p_student_id
      AND m.target_date >= NOW()
      AND m.target_date <= NOW() + INTERVAL '7 days'
      AND m.completed = FALSE
    ORDER BY m.target_date ASC
    LIMIT 1;

    IF FOUND THEN
      RETURN QUERY SELECT
        v_result.type, v_result.title, v_result.detail, v_result.urgency,
        v_result.action_key, v_result.href, v_result.id, v_result.key,
        v_result.deadline, v_result.chapter, v_result.phase,
        v_result.completion_percentage;
      RETURN;
    END IF;
  END IF;

  -- 4. Check for active chapter work (NORMAL)
  SELECT
    'chapter_continuation' as type,
    'Continue: Chapter ' || COALESCE(d.id::TEXT, 'Work') as title,
    'Pick up where you left off.' as detail,
    'normal' as urgency,
    'chapter_continuation' as action_key,
    '/documents/' || d.id as href,
    d.id::TEXT,
    NULL::VARCHAR as key,
    NULL::TIMESTAMP as deadline,
    NULL::VARCHAR as chapter,
    NULL::VARCHAR as phase,
    NULL::NUMERIC as completion_percentage
  INTO v_result
  FROM documents d
  WHERE d.user_id = p_student_id
    AND d.updated_at > NOW() - INTERVAL '7 days'
    AND d.status != 'approved'
  ORDER BY d.updated_at DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN QUERY SELECT
      v_result.type, v_result.title, v_result.detail, v_result.urgency,
      v_result.action_key, v_result.href, v_result.id, v_result.key,
      v_result.deadline, v_result.chapter, v_result.phase,
      v_result.completion_percentage;
    RETURN;
  END IF;

  -- 5. Fallback: Next incomplete checklist item
  SELECT
    'task' as type,
    ci.title as title,
    ci.description as detail,
    'normal' as urgency,
    'checklist_task' as action_key,
    COALESCE(ci.action_url, '/dashboard') as href,
    NULL::TEXT as id,
    ci.id::VARCHAR as key,
    NULL::TIMESTAMP as deadline,
    NULL::VARCHAR as chapter,
    NULL::VARCHAR as phase,
    NULL::NUMERIC as completion_percentage
  INTO v_result
  FROM thesis_checklists ci
  LEFT JOIN checklist_progress cp ON ci.id = cp.item_id AND cp.user_id = p_student_id
  WHERE cp.user_id IS NULL
  ORDER BY ci.order_index ASC
  LIMIT 1;

  IF FOUND THEN
    RETURN QUERY SELECT
      v_result.type, v_result.title, v_result.detail, v_result.urgency,
      v_result.action_key, v_result.href, v_result.id, v_result.key,
      v_result.deadline, v_result.chapter, v_result.phase,
      v_result.completion_percentage;
    RETURN;
  END IF;

  -- 6. Everything complete - suggest final preparation
  RETURN QUERY SELECT
    'task'::VARCHAR as type,
    'Prepare for Submission'::VARCHAR as title,
    'Run a final check and prepare your defense presentation.'::VARCHAR as detail,
    'normal'::VARCHAR as urgency,
    'completion'::VARCHAR as action_key,
    '/originality-check'::VARCHAR as href,
    NULL::TEXT as id,
    'final_check'::VARCHAR as key,
    NULL::TIMESTAMP as deadline,
    NULL::VARCHAR as chapter,
    NULL::VARCHAR as phase,
    100::NUMERIC as completion_percentage;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_student_next_action(UUID) TO authenticated;

-- Comments
COMMENT ON FUNCTION get_student_next_action(UUID) IS 'Returns the next prioritized action for a student based on feedback, milestones, and checklist items';
