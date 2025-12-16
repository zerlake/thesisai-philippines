-- Phase 4.1: Additional Database Utilities and Cleanup Functions

-- Function to cleanup temporary or old data
CREATE OR REPLACE FUNCTION cleanup_old_temp_data()
RETURNS TABLE(deleted_rows INTEGER, cleanup_operation TEXT) AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete temporary or old draft documents older than 30 days without content
  WITH deleted AS (
    DELETE FROM thesis_documents 
    WHERE status = 'draft' 
      AND updated_at < NOW() - INTERVAL '30 days' 
      AND (content IS NULL OR content = '')
    RETURNING *
  )
  SELECT COUNT(*) FROM deleted INTO deleted_count;
  
  RETURN QUERY SELECT deleted_count, 'Old empty draft documents';
  
  -- Delete expired collaboration invites
  WITH deleted AS (
    DELETE FROM collaboration_invites 
    WHERE status = 'pending' AND expires_at < NOW()
    RETURNING *
  )
  SELECT COUNT(*) FROM deleted INTO deleted_count;
  
  RETURN QUERY SELECT deleted_count, 'Expired collaboration invites';
  
  -- Delete failed AI tool usage records older than 7 days
  WITH deleted AS (
    DELETE FROM ai_tool_usage 
    WHERE success = false AND created_at < NOW() - INTERVAL '7 days'
    RETURNING *
  )
  SELECT COUNT(*) FROM deleted INTO deleted_count;
  
  RETURN QUERY SELECT deleted_count, 'Failed AI tool usage records';
  
  -- Clean up orphaned records (without valid references)
  -- This would require careful consideration to avoid deleting valid data
  
  -- Clean up notifications older than 6 months that are read
  WITH deleted AS (
    DELETE FROM notifications 
    WHERE is_read = true AND created_at < NOW() - INTERVAL '6 months'
    RETURNING *
  )
  SELECT COUNT(*) FROM deleted INTO deleted_count;
  
  RETURN QUERY SELECT deleted_count, 'Old read notifications';
  
  -- Clean up messages older than 1 year that are read
  WITH deleted AS (
    DELETE FROM messages 
    WHERE is_read = true AND created_at < NOW() - INTERVAL '1 year'
    RETURNING *
  )
  SELECT COUNT(*) FROM deleted INTO deleted_count;
  
  RETURN QUERY SELECT deleted_count, 'Old read messages';
  
  -- Clean up activity logs older than 1 year (keep for audit purposes but archive old ones)
  -- This is commented out as activity logs might be important for audit trails
  /*
  WITH deleted AS (
    DELETE FROM activity_logs 
    WHERE created_at < NOW() - INTERVAL '1 year'
    RETURNING *
  )
  SELECT COUNT(*) FROM deleted INTO deleted_count;
  
  RETURN QUERY SELECT deleted_count, 'Old activity logs';
  */
END;
$$ LANGUAGE plpgsql;

-- Function to reset user quotas at the beginning of each month
CREATE OR REPLACE FUNCTION reset_monthly_quotas()
RETURNS VOID AS $$
BEGIN
  -- Reset usage stats for the new month
  INSERT INTO usage_stats (user_id, period_start, period_end, ai_credits_used, documents_created, originality_checks_used)
  SELECT 
    p.id,
    DATE_TRUNC('month', CURRENT_DATE) as period_start,
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day' as period_end,
    0,
    0,
    0
  FROM profiles p
  WHERE p.id NOT IN (
    SELECT user_id 
    FROM usage_stats 
    WHERE period_start = DATE_TRUNC('month', CURRENT_DATE)
  );
  
  -- Log the quota reset
  INSERT INTO activity_logs (user_id, entity_type, entity_id, action, metadata)
  SELECT 
    p.id,
    'system_event',
    NULL,
    'monthly_quota_reset',
    jsonb_build_object('event', 'reset_monthly_quota', 'period', DATE_TRUNC('month', CURRENT_DATE)::text)
  FROM profiles p;
  
  RAISE NOTICE 'Monthly quotas reset for % users', (SELECT COUNT(*) FROM profiles);
END;
$$ LANGUAGE plpgsql;

-- Function to update advisor ratings based on feedback completion
CREATE OR REPLACE FUNCTION update_all_advisor_ratings()
RETURNS TABLE (
  advisor_id UUID,
  advisor_name TEXT,
  new_rating NUMERIC,
  review_count INTEGER
) AS $$
BEGIN
  -- Update advisor ratings based on resolved feedback
  UPDATE advisors 
  SET 
    rating = (
      SELECT COALESCE(AVG(
        CASE 
          WHEN af.severity = 'critical' THEN 1
          WHEN af.severity = 'major' THEN 2
          WHEN af.severity = 'moderate' THEN 3
          WHEN af.severity = 'minor' THEN 4
          ELSE 3  -- Default rating
        END
      ), 0)
      FROM advisor_feedback af
      JOIN thesis_documents td ON af.document_id = td.id
      JOIN thesis_projects tp ON td.project_id = tp.id
      WHERE tp.advisor_id = advisors.id AND af.resolved = true
    ),
    review_count = (
      SELECT COUNT(*) 
      FROM advisor_feedback af
      JOIN thesis_documents td ON af.document_id = td.id
      JOIN thesis_projects tp ON td.project_id = tp.id
      WHERE tp.advisor_id = advisors.id AND af.resolved = true
    );
    
  -- Return updated ratings
  RETURN QUERY
  SELECT 
    a.id,
    p.full_name,
    a.rating,
    a.review_count
  FROM advisors a
  JOIN profiles p ON a.profile_id = p.id;
END;
$$ LANGUAGE plpgsql;

-- Function to anonymize a user's personal data (for data privacy rights like GDPR)
CREATE OR REPLACE FUNCTION anonymize_user_data(user_id_param UUID)
RETURNS TABLE (
  status TEXT,
  affected_tables TEXT[]
) AS $$
DECLARE
  tables_affected TEXT[];
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = user_id_param) THEN
    RETURN QUERY SELECT 'User not found'::TEXT, ARRAY[]::TEXT[];
    RETURN;
  END IF;

  -- Anonymize the user's profile
  UPDATE profiles 
  SET 
    first_name = 'Anonymous',
    last_name = 'User',
    email = 'anonymous+' || user_id_param || '@thesisai.example.com',
    bio = NULL,
    avatar_url = NULL
  WHERE id = user_id_param;

  -- Add user ID to the array of affected tables
  tables_affected := tables_affected || 'profiles';

  -- Anonymize or mark for removal other personal data
  -- For sensitive operations like this, in real implementation you might want to
  -- mark records for deletion instead of immediate deletion
  
  -- Mark documents for archival/deletion
  UPDATE thesis_documents 
  SET 
    title = 'Archived Document - ' || id,
    file_name = NULL,
    file_path = NULL
  WHERE user_id = user_id_param;
  
  IF FOUND THEN
    tables_affected := tables_affected || 'thesis_documents';
  END IF;

  -- Return success status
  RETURN QUERY SELECT 'User data anonymized'::TEXT, tables_affected;
END;
$$ LANGUAGE plpgsql;

-- Function to validate and update user roles
CREATE OR REPLACE FUNCTION update_user_role(user_id_param UUID, new_role TEXT)
RETURNS TABLE (
  user_id UUID,
  old_role TEXT,
  new_role TEXT,
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  old_role_val TEXT;
BEGIN
  -- Get existing role
  SELECT role INTO old_role_val FROM profiles WHERE id = user_id_param;
  
  -- Validate role
  IF new_role NOT IN ('user', 'advisor', 'critic', 'admin', 'moderator', 'guest') THEN
    RETURN QUERY SELECT user_id_param, old_role_val, new_role, false, 'Invalid role specified';
    RETURN;
  END IF;
  
  -- Update role
  UPDATE profiles SET role = new_role WHERE id = user_id_param;
  
  IF FOUND THEN
    -- Log the role change
    INSERT INTO activity_logs (user_id, entity_type, entity_id, action, metadata)
    VALUES (user_id_param, 'profile', user_id_param, 'role_changed', 
            jsonb_build_object('old_role', old_role_val, 'new_role', new_role));
            
    RETURN QUERY SELECT user_id_param, old_role_val, new_role, true, 'Role updated successfully';
  ELSE
    RETURN QUERY SELECT user_id_param, old_role_val, new_role, false, 'Failed to update role';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to generate various system reports
CREATE OR REPLACE FUNCTION generate_system_report(report_type TEXT, start_date DATE, end_date DATE)
RETURNS TABLE (
  report_section TEXT,
  metric_name TEXT,
  metric_value TEXT,
  details JSONB
) AS $$
BEGIN
  -- Usage report
  IF report_type = 'usage' OR report_type = 'all' THEN
    RETURN QUERY
    SELECT 
      'Usage Summary'::TEXT as report_section,
      'total_users'::TEXT as metric_name,
      COUNT(DISTINCT p.id)::TEXT as metric_value,
      jsonb_build_object(
        'start_date', start_date::text,
        'end_date', end_date::text
      ) as details
    FROM profiles p
    WHERE p.created_at BETWEEN start_date AND end_date + INTERVAL '1 day'
    
    UNION ALL
    
    SELECT 
      'Usage Summary'::TEXT,
      'projects_created'::TEXT,
      COUNT(DISTINCT tp.id)::TEXT,
      jsonb_build_object(
        'start_date', start_date::text,
        'end_date', end_date::text
      )
    FROM thesis_projects tp
    WHERE tp.created_at BETWEEN start_date AND end_date + INTERVAL '1 day'
    
    UNION ALL
    
    SELECT 
      'Usage Summary'::TEXT,
      'documents_uploaded'::TEXT,
      COUNT(DISTINCT td.id)::TEXT,
      jsonb_build_object(
        'start_date', start_date::text,
        'end_date', end_date::text
      )
    FROM thesis_documents td
    WHERE td.created_at BETWEEN start_date AND end_date + INTERVAL '1 day'
    
    UNION ALL
    
    SELECT 
      'Usage Summary'::TEXT,
      'ai_tool_uses'::TEXT,
      COUNT(DISTINCT atu.id)::TEXT,
      jsonb_build_object(
        'start_date', start_date::text,
        'end_date', end_date::text
      )
    FROM ai_tool_usage atu
    WHERE atu.created_at BETWEEN start_date AND end_date + INTERVAL '1 day';
  END IF;
  
  -- Engagement report
  IF report_type = 'engagement' OR report_type = 'all' THEN
    RETURN QUERY
    SELECT 
      'Engagement Metrics'::TEXT as report_section,
      'active_users'::TEXT as metric_name,
      COUNT(DISTINCT al.user_id)::TEXT as metric_value,
      jsonb_build_object(
        'start_date', start_date::text,
        'end_date', end_date::text
      ) as details
    FROM activity_logs al
    WHERE al.created_at BETWEEN start_date AND end_date + INTERVAL '1 day'
    
    UNION ALL
    
    SELECT 
      'Engagement Metrics'::TEXT,
      'total_activities'::TEXT,
      COUNT(al2.id)::TEXT,
      jsonb_build_object(
        'start_date', start_date::text,
        'end_date', end_date::text
      )
    FROM activity_logs al2
    WHERE al2.created_at BETWEEN start_date AND end_date + INTERVAL '1 day';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to optimize database tables and indexes
CREATE OR REPLACE FUNCTION optimize_database()
RETURNS TABLE (
  operation TEXT,
  table_name TEXT,
  status TEXT,
  details TEXT
) AS $$
BEGIN
  -- This would normally require superuser privileges
  -- For demonstration purposes, we'll just return what operations would run
  RETURN QUERY SELECT 'VACUUM ANALYZE'::TEXT, 'thesis_documents'::TEXT, 'scheduled'::TEXT, 'Planned optimization operation'::TEXT
  UNION ALL
  SELECT 'REINDEX'::TEXT, 'idx_thesis_documents_project_user'::TEXT, 'scheduled'::TEXT, 'Planned reindex operation'::TEXT
  UNION ALL
  SELECT 'ANALYZE'::TEXT, 'advisor_feedback'::TEXT, 'scheduled'::TEXT, 'Statistics update planned'::TEXT;
  
  -- In a real system, you would call:
  -- PERFORM dblink_exec('host=localhost port=5432 dbname=' || current_database() || ' user=some_superuser', 'VACUUM ANALYZE thesis_documents;');
END;
$$ LANGUAGE plpgsql;

-- Function to get user data export (for data portability rights)
CREATE OR REPLACE FUNCTION export_user_data(user_id_param UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'user_profile', (
      SELECT jsonb_build_object(
        'id', p.id,
        'email', p.email,
        'first_name', p.first_name,
        'last_name', p.last_name,
        'full_name', p.full_name,
        'role', p.role,
        'university_id', p.university_id,
        'academic_level', p.academic_level,
        'bio', p.bio,
        'timezone', p.timezone,
        'created_at', p.created_at,
        'updated_at', p.updated_at
      )
      FROM profiles p
      WHERE p.id = user_id_param
    ),
    'thesis_projects', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', tp.id,
          'title', tp.title,
          'subtitle', tp.subtitle,
          'abstract', tp.abstract,
          'status', tp.status,
          'academic_year', tp.academic_year,
          'semester', tp.semester,
          'created_at', tp.created_at,
          'updated_at', tp.updated_at
        )
      )
      FROM thesis_projects tp
      WHERE tp.user_id = user_id_param
    ),
    'thesis_documents', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', td.id,
          'title', td.title,
          'type', td.type,
          'version_number', td.version_number,
          'status', td.status,
          'file_name', td.file_name,
          'file_size', td.file_size,
          'created_at', td.created_at,
          'updated_at', td.updated_at
        )
      )
      FROM thesis_documents td
      WHERE td.user_id = user_id_param
    ),
    'topic_ideas', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', ti.id,
          'topic', ti.topic,
          'description', ti.description,
          'status', ti.status,
          'created_at', ti.created_at,
          'updated_at', ti.updated_at
        )
      )
      FROM topic_ideas ti
      WHERE ti.user_id = user_id_param
    ),
    'ai_tool_usage', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', atu.id,
          'tool_name', atu.tool_name,
          'action_type', atu.action_type,
          'input_data', atu.input_data,
          'output_data', atu.output_data,
          'tokens_used', atu.tokens_used,
          'cost_credits', atu.cost_credits,
          'created_at', atu.created_at
        )
      )
      FROM ai_tool_usage atu
      WHERE atu.user_id = user_id_param
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to validate data integrity
CREATE OR REPLACE FUNCTION validate_data_integrity()
RETURNS TABLE (
  table_name TEXT,
  check_name TEXT,
  passed BOOLEAN,
  error_details TEXT
) AS $$
BEGIN
  -- Check for orphaned thesis documents (documents without valid user or project)
  RETURN QUERY
  SELECT 
    'thesis_documents'::TEXT as table_name,
    'orphaned_documents'::TEXT as check_name,
    NOT EXISTS (
      SELECT 1 FROM thesis_documents td
      LEFT JOIN profiles p ON td.user_id = p.id
      LEFT JOIN thesis_projects tp ON td.project_id = tp.id
      WHERE p.id IS NULL OR tp.id IS NULL
    ) as passed,
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM thesis_documents td
        LEFT JOIN profiles p ON td.user_id = p.id
        LEFT JOIN thesis_projects tp ON td.project_id = tp.id
        WHERE p.id IS NULL OR tp.id IS NULL
      ) THEN 'Found orphaned thesis documents'
      ELSE 'No orphaned thesis documents'
    END as error_details;
    
  -- Check for invalid advisor references in thesis projects
  RETURN QUERY
  SELECT 
    'thesis_projects'::TEXT,
    'invalid_advisor_refs'::TEXT,
    NOT EXISTS (
      SELECT 1 FROM thesis_projects tp
      LEFT JOIN advisors a ON tp.advisor_id = a.id
      WHERE tp.advisor_id IS NOT NULL AND a.id IS NULL
    ) as passed,
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM thesis_projects tp
        LEFT JOIN advisors a ON tp.advisor_id = a.id
        WHERE tp.advisor_id IS NOT NULL AND a.id IS NULL
      ) THEN 'Found thesis projects with invalid advisor references'
      ELSE 'All advisor references are valid'
    END as error_details;
    
  -- Check for missing profile references
  RETURN QUERY
  SELECT 
    'advisors'::TEXT,
    'missing_profile_refs'::TEXT,
    NOT EXISTS (
      SELECT 1 FROM advisors a
      LEFT JOIN profiles p ON a.profile_id = p.id
      WHERE p.id IS NULL
    ) as passed,
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM advisors a
        LEFT JOIN profiles p ON a.profile_id = p.id
        WHERE p.id IS NULL
      ) THEN 'Found advisors with missing profile references'
      ELSE 'All advisor profile references are valid'
    END as error_details;
END;
$$ LANGUAGE plpgsql;

-- Function to get usage statistics for a specific user
CREATE OR REPLACE FUNCTION get_user_usage_stats(user_id_param UUID)
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'user_id', user_id_param,
    'total_projects', (SELECT COUNT(*) FROM thesis_projects WHERE user_id = user_id_param),
    'total_documents', (SELECT COUNT(*) FROM thesis_documents WHERE user_id = user_id_param),
    'total_ai_uses', (SELECT COUNT(*) FROM ai_tool_usage WHERE user_id = user_id_param),
    'total_feedback_received', (
      SELECT COUNT(*) 
      FROM advisor_feedback af
      JOIN thesis_documents td ON af.document_id = td.id
      WHERE td.user_id = user_id_param
    ),
    'total_chapters_written', (SELECT COUNT(*) FROM thesis_chapters WHERE project_id IN (SELECT id FROM thesis_projects WHERE user_id = user_id_param)),
    'storage_used_mb', (SELECT COALESCE(SUM(file_size), 0)/POWER(1024, 2) FROM thesis_documents WHERE user_id = user_id_param AND file_size IS NOT NULL),
    'current_month_ai_usage', (
      SELECT jsonb_build_object(
        'uses', COUNT(*),
        'tokens_used', COALESCE(SUM(tokens_used), 0),
        'cost_credits', COALESCE(SUM(cost_credits), 0)
      )
      FROM ai_tool_usage 
      WHERE user_id = user_id_param 
        AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_TIMESTAMP)
    ),
    'current_month_document_creations', (
      SELECT COUNT(*)
      FROM thesis_documents
      WHERE user_id = user_id_param
        AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_TIMESTAMP)
    ),
    'current_month_originality_checks', (
      SELECT COUNT(*)
      FROM originality_checks
      WHERE user_id = user_id_param
        AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_TIMESTAMP)
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate project health score
CREATE OR REPLACE FUNCTION calculate_project_health(project_id_param UUID)
RETURNS TABLE (
  project_id UUID,
  health_score INTEGER,
  health_factors JSONB,
  recommendations TEXT[]
) AS $$
DECLARE
  score INTEGER := 100;
  factors JSONB;
  recs TEXT[];
BEGIN
  -- Calculate health score based on multiple factors
  -- Start with 100 points and deduct for issues
  
  -- Deduct for overdue milestones
  SELECT score - (COUNT(*) * 10) INTO score
  FROM academic_milestones
  WHERE project_id = project_id_param
    AND status != 'completed'
    AND target_date < CURRENT_DATE;
  
  -- Deduct for incomplete required checklist items
  SELECT score - (COUNT(*) * 2) INTO score
  FROM thesis_checklists
  WHERE project_id = project_id_param
    AND is_required = true
    AND is_completed = false;
  
  -- Deduct for too many unresolved feedback items
  SELECT score - (COUNT(*) * 3) INTO score
  FROM advisor_feedback af
  JOIN thesis_documents td ON af.document_id = td.id
  WHERE td.project_id = project_id_param
    AND af.resolved = false;
  
  -- Check if project hasn't been updated in a while (stalled)
  IF EXISTS (
    SELECT 1 
    FROM thesis_projects 
    WHERE id = project_id_param 
      AND updated_at < CURRENT_DATE - INTERVAL '30 days'
  ) THEN
    score := score - 15;
  END IF;
  
  -- Cap score between 0 and 100
  score := GREATEST(0, LEAST(100, score));
  
  -- Compile health factors
  SELECT jsonb_build_object(
    'on_time_completion_rate', (
      SELECT 
        CASE 
          WHEN COUNT(*) > 0 THEN 
            ROUND((COUNT(CASE WHEN target_date >= actual_completion_date AND actual_completion_date IS NOT NULL THEN 1 END)::NUMERIC * 100.0) / COUNT(*), 2)
          ELSE 100.00
        END
      FROM academic_milestones
      WHERE project_id = project_id_param AND actual_completion_date IS NOT NULL
    ),
    'completed_checklist_percent', (
      SELECT 
        CASE 
          WHEN COUNT(*) > 0 THEN 
            ROUND((COUNT(CASE WHEN is_completed = true THEN 1 END)::NUMERIC * 100.0) / COUNT(*), 2)
          ELSE 0.00
        END
      FROM thesis_checklists
      WHERE project_id = project_id_param AND is_required = true
    ),
    'unresolved_feedback_count', (
      SELECT COUNT(*)
      FROM advisor_feedback af
      JOIN thesis_documents td ON af.document_id = td.id
      WHERE td.project_id = project_id_param AND af.resolved = false
    ),
    'days_since_last_update', (
      SELECT EXTRACT(DAY FROM (CURRENT_TIMESTAMP - updated_at))::INTEGER
      FROM thesis_projects WHERE id = project_id_param
    )
  ) INTO factors;
  
  -- Generate recommendations based on issues
  IF (SELECT COUNT(*) FROM academic_milestones WHERE project_id = project_id_param AND status != 'completed' AND target_date < CURRENT_DATE) > 0 THEN
    recs := recs || 'Address overdue milestones promptly';
  END IF;
  
  IF (SELECT COUNT(*) FROM thesis_checklists WHERE project_id = project_id_param AND is_required = true AND is_completed = false) > 5 THEN
    recs := recs || 'Complete required checklist items to stay on track';
  END IF;
  
  IF (SELECT COUNT(*) FROM advisor_feedback af JOIN thesis_documents td ON af.document_id = td.id WHERE td.project_id = project_id_param AND af.resolved = false) > 3 THEN
    recs := recs || 'Address advisor feedback to avoid delays';
  END IF;
  
  IF (SELECT EXTRACT(DAY FROM (CURRENT_TIMESTAMP - updated_at)) FROM thesis_projects WHERE id = project_id_param) > 30 THEN
    recs := recs || 'Resume active work on your project';
  END IF;
  
  IF array_length(recs, 1) IS NULL THEN
    recs := ARRAY['Project is in good standing'];
  END IF;
  
  RETURN QUERY SELECT project_id_param, score, factors, recs;
END;
$$ LANGUAGE plpgsql;

-- Commit transaction
COMMIT;