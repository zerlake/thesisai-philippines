-- Admin Dashboard Analytics Migration
-- Purpose: Add views and functions for admin dashboard statistics and analytics

-- Create admin_system_stats view for quick dashboard overview
CREATE OR REPLACE VIEW admin_system_stats AS
SELECT
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM profiles WHERE role = 'user') as total_students,
  (SELECT COUNT(*) FROM profiles WHERE role = 'advisor') as total_advisors,
  (SELECT COUNT(*) FROM profiles WHERE role = 'critic') as total_critics,
  (SELECT COUNT(*) FROM profiles WHERE role = 'admin') as total_admins,
  (SELECT COUNT(*) FROM documents) as total_documents,
  (SELECT COUNT(*) FROM institution_requests WHERE status = 'pending') as pending_institution_requests,
  (SELECT COUNT(*) FROM testimonials WHERE status = 'pending') as pending_testimonials,
  (SELECT COUNT(*) FROM payout_requests WHERE status = 'pending') as pending_payouts,
  (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_users_week,
  (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_month,
  (SELECT COUNT(*) FROM documents WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_documents_week,
  NOW() as stats_generated_at;

-- Create function to get admin dashboard analytics
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
      'institution_requests', (SELECT COUNT(*) FROM institution_requests WHERE status = 'pending'),
      'testimonials', (SELECT COUNT(*) FROM testimonials WHERE status = 'pending'),
      'payouts', (SELECT COUNT(*) FROM payout_requests WHERE status = 'pending')
    ),
    'activity', json_build_object(
      'messages_today', (SELECT COUNT(*) FROM messages WHERE created_at >= CURRENT_DATE),
      'messages_this_week', (SELECT COUNT(*) FROM messages WHERE created_at >= CURRENT_DATE - INTERVAL '7 days')
    ),
    'generated_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$;

-- Create function to get user growth stats for charting
CREATE OR REPLACE FUNCTION get_user_growth_stats(days_back INTEGER DEFAULT 30)
RETURNS TABLE(
  date DATE,
  new_users BIGINT,
  cumulative_users BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH daily_signups AS (
    SELECT
      DATE(created_at) as signup_date,
      COUNT(*) as count
    FROM profiles
    WHERE created_at >= CURRENT_DATE - (days_back || ' days')::INTERVAL
    GROUP BY DATE(created_at)
  ),
  date_series AS (
    SELECT generate_series(
      CURRENT_DATE - (days_back || ' days')::INTERVAL,
      CURRENT_DATE,
      '1 day'::INTERVAL
    )::DATE as date
  )
  SELECT
    ds.date,
    COALESCE(d.count, 0) as new_users,
    SUM(COALESCE(d.count, 0)) OVER (ORDER BY ds.date) +
      (SELECT COUNT(*) FROM profiles WHERE DATE(created_at) < CURRENT_DATE - (days_back || ' days')::INTERVAL) as cumulative_users
  FROM date_series ds
  LEFT JOIN daily_signups d ON ds.date = d.signup_date
  ORDER BY ds.date;
END;
$$;

-- Create function to get document activity stats
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

-- Create function to get role distribution
CREATE OR REPLACE FUNCTION get_user_role_distribution()
RETURNS TABLE(
  role TEXT,
  count BIGINT,
  percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_users BIGINT;
BEGIN
  SELECT COUNT(*) INTO total_users FROM profiles;

  RETURN QUERY
  SELECT
    p.role,
    COUNT(*) as count,
    ROUND((COUNT(*)::NUMERIC / NULLIF(total_users, 0)) * 100, 2) as percentage
  FROM profiles p
  GROUP BY p.role
  ORDER BY count DESC;
END;
$$;

-- Grant execute permissions to authenticated users (admin check should be done in RLS or app layer)
GRANT EXECUTE ON FUNCTION get_admin_dashboard_analytics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_growth_stats(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_document_activity_stats(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role_distribution() TO authenticated;

-- Grant select on the view to authenticated users
GRANT SELECT ON admin_system_stats TO authenticated;

-- Add comment
COMMENT ON VIEW admin_system_stats IS 'Quick statistics view for admin dashboard';
COMMENT ON FUNCTION get_admin_dashboard_analytics() IS 'Returns comprehensive admin dashboard analytics as JSON';
COMMENT ON FUNCTION get_user_growth_stats(INTEGER) IS 'Returns user growth statistics for the specified number of days';
COMMENT ON FUNCTION get_document_activity_stats(INTEGER) IS 'Returns document activity statistics for the specified number of days';
COMMENT ON FUNCTION get_user_role_distribution() IS 'Returns distribution of users by role';
