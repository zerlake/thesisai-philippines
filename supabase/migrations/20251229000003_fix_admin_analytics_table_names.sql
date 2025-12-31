-- Fix Admin Analytics Table Names
-- Created: 2025-12-29
-- Purpose: Update admin analytics functions to use correct table names

-- Drop old view and recreate with correct table names
DROP VIEW IF EXISTS admin_system_stats CASCADE;

CREATE OR REPLACE VIEW admin_system_stats AS
SELECT
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM profiles WHERE role = 'user') as total_students,
  (SELECT COUNT(*) FROM profiles WHERE role = 'advisor') as total_advisors,
  (SELECT COUNT(*) FROM profiles WHERE role = 'critic') as total_critics,
  (SELECT COUNT(*) FROM profiles WHERE role = 'admin') as total_admins,
  (SELECT COUNT(*) FROM documents) as total_documents,
  (SELECT COALESCE(COUNT(*), 0) FROM advisor_requests WHERE status = 'pending') as pending_advisor_requests,
  (SELECT COALESCE(COUNT(*), 0) FROM critic_requests WHERE status = 'pending') as pending_critic_requests,
  (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_users_week,
  (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_month,
  (SELECT COUNT(*) FROM documents WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_documents_week,
  NOW() as stats_generated_at;

-- Update admin dashboard analytics function
DROP FUNCTION IF EXISTS get_admin_dashboard_analytics() CASCADE;

CREATE OR REPLACE FUNCTION get_admin_dashboard_analytics()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'users', json_build_object(
      'total', (SELECT COUNT(*) FROM profiles),
      'students', (SELECT COUNT(*) FROM profiles WHERE role = 'user'),
      'advisors', (SELECT COUNT(*) FROM profiles WHERE role = 'advisor'),
      'critics', (SELECT COUNT(*) FROM profiles WHERE role = 'critic'),
      'admins', (SELECT COUNT(*) FROM profiles WHERE role = 'admin'),
      'new_this_week', (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
      'new_this_month', (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE - INTERVAL '30 days')
    ),
    'documents', json_build_object(
      'total', (SELECT COUNT(*) FROM documents),
      'new_this_week', (SELECT COUNT(*) FROM documents WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
      'new_this_month', (SELECT COUNT(*) FROM documents WHERE created_at >= CURRENT_DATE - INTERVAL '30 days')
    ),
    'pending', json_build_object(
      'advisor_requests', (SELECT COALESCE(COUNT(*), 0) FROM advisor_requests WHERE status = 'pending'),
      'critic_requests', (SELECT COALESCE(COUNT(*), 0) FROM critic_requests WHERE status = 'pending')
    ),
    'activity', json_build_object(
      'messages_today', (SELECT COALESCE(COUNT(*), 0) FROM advisor_student_messages WHERE created_at >= CURRENT_DATE),
      'messages_this_week', (SELECT COALESCE(COUNT(*), 0) FROM advisor_student_messages WHERE created_at >= CURRENT_DATE - INTERVAL '7 days')
    ),
    'generated_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$;

-- Update document activity stats function
DROP FUNCTION IF EXISTS get_document_activity_stats(INTEGER) CASCADE;

CREATE OR REPLACE FUNCTION get_document_activity_stats(days_back INTEGER DEFAULT 30)
RETURNS TABLE(
  date DATE,
  documents_created BIGINT,
  documents_updated BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - (days_back || ' days')::INTERVAL,
      CURRENT_DATE,
      '1 day'::INTERVAL
    )::DATE as date
  ),
  created_docs AS (
    SELECT DATE(created_at) as doc_date, COUNT(*) as count
    FROM documents
    WHERE created_at >= CURRENT_DATE - (days_back || ' days')::INTERVAL
    GROUP BY DATE(created_at)
  ),
  updated_docs AS (
    SELECT DATE(updated_at) as doc_date, COUNT(*) as count
    FROM documents
    WHERE updated_at >= CURRENT_DATE - (days_back || ' days')::INTERVAL
      AND updated_at != created_at
    GROUP BY DATE(updated_at)
  )
  SELECT
    ds.date,
    COALESCE(c.count, 0) as documents_created,
    COALESCE(u.count, 0) as documents_updated
  FROM date_series ds
  LEFT JOIN created_docs c ON ds.date = c.doc_date
  LEFT JOIN updated_docs u ON ds.date = u.doc_date
  ORDER BY ds.date;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_admin_dashboard_analytics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_document_activity_stats(INTEGER) TO authenticated;
GRANT SELECT ON admin_system_stats TO authenticated;

-- Comments
COMMENT ON VIEW admin_system_stats IS 'Quick statistics view for admin dashboard using correct table names';
COMMENT ON FUNCTION get_admin_dashboard_analytics() IS 'Returns comprehensive admin dashboard analytics as JSON with correct table references';
COMMENT ON FUNCTION get_document_activity_stats(INTEGER) IS 'Returns document activity statistics using thesis_documents table';
