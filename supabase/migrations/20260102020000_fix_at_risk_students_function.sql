-- Fix at-risk students function to remove dependency on advisor_profiles table
-- Created: 2026-01-02
-- Purpose: Update the get_at_risk_students_for_advisor function to work without advisor_profiles table

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
BEGIN
  RETURN QUERY
  SELECT
    p.id as student_id,
    p.first_name,
    p.last_name,
    p.avatar_url,
    COUNT(am.id) as overdue_milestone_count
  FROM profiles p
  INNER JOIN advisor_student_relationships sar
    ON p.id = sar.student_id
  LEFT JOIN academic_milestones am
    ON p.id = am.user_id
    AND am.completed = FALSE
    AND am.target_date < CURRENT_DATE
  WHERE sar.advisor_id = p_advisor_id
    AND sar.status = 'active'
  GROUP BY p.id, p.first_name, p.last_name, p.avatar_url
  HAVING COUNT(am.id) > 0
  ORDER BY overdue_milestone_count DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_at_risk_students_for_advisor(UUID) TO authenticated;