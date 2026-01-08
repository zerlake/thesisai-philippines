-- Create RPC function to get at-risk students for an advisor
-- Created: 2026-01-02
-- Purpose: Retrieve students who have overdue milestones for advisors to monitor

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
AS $$
DECLARE
  v_advisor_user_id UUID;
BEGIN
  -- Get the user_id for the advisor (from advisor_profiles table)
  SELECT user_id INTO v_advisor_user_id
  FROM advisor_profiles
  WHERE id = p_advisor_id;

  -- If not found in advisor_profiles, try profiles directly
  IF v_advisor_user_id IS NULL THEN
    SELECT id INTO v_advisor_user_id
    FROM profiles
    WHERE id = p_advisor_id;
  END IF;

  RETURN QUERY
  SELECT
    p.id as student_id,
    p.first_name,
    p.last_name,
    p.avatar_url,
    COUNT(am.id) as overdue_milestone_count
  FROM profiles p
  INNER JOIN student_advisor_relationships sar
    ON p.id = sar.student_id
  LEFT JOIN academic_milestones am
    ON p.id = am.user_id
    AND am.completed = FALSE
    AND am.target_date < CURRENT_DATE
  WHERE sar.advisor_id = v_advisor_user_id
    AND sar.status = 'active'
  GROUP BY p.id, p.first_name, p.last_name, p.avatar_url
  HAVING COUNT(am.id) > 0
  ORDER BY overdue_milestone_count DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_at_risk_students_for_advisor(UUID) TO authenticated;
