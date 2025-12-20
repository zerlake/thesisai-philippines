-- Phase 4.1: Final Database Setup and Optimization

-- Set up default values for system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('thesisai.version', '"1.0.0"', 'Current ThesisAI Platform Version'),
('thesisai.maintenance_mode', 'false', 'Whether the system is in maintenance mode'),
('thesisai.default_ai_credits', '100', 'Default AI credits for new users'),
('thesisai.storage_limit_per_user_mb', '1024', 'Storage limit per user in MB'),
('thesisai.max_document_size_mb', '25', 'Maximum document size allowed'),
('thesisai.ai_tool_rate_limit_per_minute', '10', 'Rate limit for AI tools per minute'),
('thesisai.max_concurrent_edits', '5', 'Maximum concurrent document edits'),
('thesisai.autosave_interval_seconds', '30', 'Interval for document autosave'),
('thesisai.notification_retention_days', '180', 'Days to retain notifications'),
('thesisai.activity_log_retention_days', '365', 'Days to retain activity logs'),
('thesisai.backup_retention_days', '90', 'Days to retain backups'),
('thesisai.document_conversion_enabled', 'true', 'Whether document conversion is enabled'),
('thesisai.plagiarism_detection_enabled', 'true', 'Whether plagiarism detection is enabled'),
('thesisai.email_notifications_enabled', 'true', 'Whether email notifications are enabled'),
('thesisai.sms_notifications_enabled', 'false', 'Whether SMS notifications are enabled'),
('thesisai.collaboration_enabled', 'true', 'Whether collaboration features are enabled'),
('thesisai.public_sharing_enabled', 'true', 'Whether public document sharing is enabled'),
('thesisai.api_access_enabled', 'true', 'Whether API access is enabled'),
('thesisai.advanced_analytics_enabled', 'true', 'Whether advanced analytics are enabled'),
('thesisai.ai_assistant_enabled', 'true', 'Whether AI assistant is enabled')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default feature flags
INSERT INTO feature_flags (flag_name, is_enabled, description, rollout_percentage) VALUES
('ai-enhanced-writing', true, 'Enable AI-enhanced writing features', 100),
('collaboration-tools', true, 'Enable collaboration tools', 100),
('advanced-formatters', true, 'Enable advanced formatting tools', 100),
('defensive-q&a', true, 'Enable defensive Q&A preparation', 100),
('research-gaps-identifier', true, 'Enable research gaps identifier', 100),
('literature-analyzer', true, 'Enable literature analyzer', 100),
('peer-review-network', false, 'Enable peer review network (beta)', 5),
('automated-citations', true, 'Enable automated citation generation', 100),
('plagiarism-detection', true, 'Enable plagiarism detection', 100),
('auto-backup', true, 'Enable automatic backup', 100),
('realtime-collaboration', true, 'Enable real-time collaboration', 75),
('advanced-analytics', true, 'Enable advanced analytics dashboard', 100),
('mobile-app-sync', false, 'Enable mobile app synchronization', 0),
('voice-input', false, 'Enable voice input for drafting', 10),
('ar-vr-preview', false, 'Enable AR/VR preview modes', 0),
('blockchain-certification', false, 'Enable blockchain-based certification', 0),
('multi-language-support', false, 'Enable multi-language support', 5),
('offline-mode', false, 'Enable offline document editing', 0),
('advanced-ai-models', true, 'Enable access to advanced AI models', 100),
('institutional-integrations', true, 'Enable institutional system integrations', 25),
('custom-workflows', true, 'Enable custom research workflow creator', 100)
ON CONFLICT (flag_name) DO NOTHING;

-- Create a procedure to run periodic database optimizations
CREATE OR REPLACE PROCEDURE optimize_database_performance()
LANGUAGE plpgsql AS $$
BEGIN
  -- Update table statistics (equivalent to ANALYZE)
  -- This helps PostgreSQL optimizer make better decisions
  RAISE NOTICE 'Updating table statistics...';
  ANALYZE;
  
  -- Perform vacuuming operations (this would normally be done outside of transaction)
  -- Since we're in a function/procedure context, we can't execute these directly
  -- In a real deployment, these would be scheduled separately
  RAISE NOTICE 'Database optimization complete.';
  
  -- Log the optimization event
  INSERT INTO performance_metrics (metric_name, metric_value, context, recorded_at)
  VALUES ('database_optimization_run', 1, jsonb_build_object('timestamp', NOW(), 'user', SESSION_USER), NOW());
END;
$$;

-- Create a procedure to update advisor ratings periodically
CREATE OR REPLACE PROCEDURE update_all_advisor_ratings_procedure()
LANGUAGE plpgsql AS $$
BEGIN
  -- Run the function to update advisor ratings
  PERFORM update_all_advisor_ratings();
  
  -- Log the rating update event
  INSERT INTO performance_metrics (metric_name, metric_value, context, recorded_at)
  VALUES ('advisor_ratings_update', (SELECT COUNT(*) FROM advisors), jsonb_build_object('timestamp', NOW()), NOW());
END;
$$;

-- Create a function to run the entire cleanup routine
CREATE OR REPLACE FUNCTION run_full_cleanup()
RETURNS TABLE(operation TEXT, affected_rows INTEGER, status TEXT) AS $$
DECLARE
  result_row RECORD;
BEGIN
  -- Run the cleanup function
  FOR result_row IN SELECT * FROM cleanup_old_temp_data() LOOP
    RETURN QUERY SELECT result_row.cleanup_operation, result_row.deleted_rows, 'completed';
  END LOOP;
  
  -- Add other cleanup operations here as needed
  RETURN QUERY SELECT 'Cleanup completed', 0, 'success';
END;
$$ LANGUAGE plpgsql;

-- Set up a function to initialize new user data when profile is created
CREATE OR REPLACE FUNCTION initialize_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default plans for new users if they don't exist
  IF NOT EXISTS (SELECT 1 FROM subscriptions WHERE user_id = NEW.id) THEN
    INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
    SELECT 
      NEW.id,
      p.id as plan_id,
      'trial' as status,
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '14 days' as current_period_end
    FROM plans p 
    WHERE p.slug = 'free-trial'
    ON CONFLICT DO NOTHING;
  END IF;

  -- Create default usage stats entry
  INSERT INTO usage_stats (user_id, period_start, period_end, ai_credits_used, documents_created, originality_checks_used)
  VALUES (
    NEW.id,
    DATE_TRUNC('month', CURRENT_DATE),
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day',
    0,
    0,
    0
  )
  ON CONFLICT (user_id, period_start, period_end) DO NOTHING;

  -- Add welcome notification
  INSERT INTO notifications (user_id, title, message, type, action_required, action_url)
  VALUES (
    NEW.id,
    'Welcome to ThesisAI!',
    'We''re excited to have you on board. Check out our getting started guide.',
    'info',
    false,
    '/getting-started'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the trigger to use the new function
DROP TRIGGER IF EXISTS on_new_profile_init ON profiles;
CREATE TRIGGER on_new_profile_init
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION initialize_user_data();

-- Update existing profiles to ensure they have proper initialization
-- This is a one-time update for existing users
INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
SELECT 
  p.id,
  pl.id,
  'trial',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '14 days'
FROM profiles p
LEFT JOIN subscriptions s ON p.id = s.user_id
JOIN plans pl ON pl.slug = 'free-trial'
WHERE s.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO usage_stats (user_id, period_start, period_end, ai_credits_used, documents_created, originality_checks_used)
SELECT 
  p.id,
  DATE_TRUNC('month', CURRENT_DATE),
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day',
  0,
  0,
  0
FROM profiles p
LEFT JOIN usage_stats us ON p.id = us.user_id AND us.period_start = DATE_TRUNC('month', CURRENT_DATE)
WHERE us.user_id IS NULL
ON CONFLICT (user_id, period_start, period_end) DO NOTHING;

-- Create a view for admin dashboard with system stats
CREATE OR REPLACE VIEW admin_system_stats AS
SELECT 
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM thesis_projects) as total_projects,
  (SELECT COUNT(*) FROM thesis_documents) as total_documents,
  (SELECT COUNT(*) FROM advisors) as total_advisors,
  (SELECT COUNT(*) FROM critics) as total_critics,
  (SELECT COUNT(*) FROM ai_tool_usage WHERE created_at >= CURRENT_DATE - INTERVAL '1 day') as ai_uses_today,
  (SELECT COUNT(*) FROM ai_tool_usage WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as ai_uses_week,
  (SELECT COUNT(*) FROM notifications WHERE created_at >= CURRENT_DATE - INTERVAL '1 day') as notifications_today,
  (SELECT COUNT(*) FROM messages WHERE created_at >= CURRENT_DATE - INTERVAL '1 day') as messages_today,
  (SELECT COUNT(*) FROM originality_checks WHERE created_at >= CURRENT_DATE - INTERVAL '1 day') as originality_checks_today,
  (SELECT COALESCE(SUM(file_size), 0)/POWER(1024, 3) FROM thesis_documents WHERE file_size IS NOT NULL) as total_storage_gb,
  (SELECT AVG(EXTRACT(EPOCH FROM (completed_at - started_at))/60) 
   FROM originality_checks 
   WHERE started_at IS NOT NULL AND completed_at IS NOT NULL) as avg_check_duration_minutes,
  (SELECT COUNT(*) FROM feature_flags WHERE is_enabled = true) as active_features,
  NOW() as stats_generated_at;

-- Create a function to validate the database schema
CREATE OR REPLACE FUNCTION validate_schema_setup()
RETURNS TABLE(validation_check TEXT, passed BOOLEAN, details TEXT) AS $$
BEGIN
  -- Check if all required tables exist
  RETURN QUERY
  SELECT 'All core tables exist'::TEXT as validation_check,
         EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') AND
         EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'thesis_projects') AND
         EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'thesis_documents') AND
         EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'advisor_feedback') AND
         EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_tool_usage') as passed,
         'Checking existence of core tables' as details
  UNION ALL
  SELECT 'RLS policies enabled'::TEXT,
         (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') > 0,
         'Checking if RLS policies are created'
  UNION ALL
  SELECT 'Required indexes exist'::TEXT,
         EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_thesis_projects_user_status'),
         'Checking if performance indexes are created'
  UNION ALL
  SELECT 'System settings initialized'::TEXT,
         EXISTS (SELECT 1 FROM system_settings WHERE setting_key = 'thesisai.version'),
         'Checking if system settings are initialized'
  UNION ALL
  SELECT 'Feature flags initialized'::TEXT,
         EXISTS (SELECT 1 FROM feature_flags WHERE flag_name = 'ai-enhanced-writing'),
         'Checking if feature flags are initialized';
END;
$$ LANGUAGE plpgsql;

-- Run initial validation to confirm setup
-- This would normally be called after all migrations are complete
-- SELECT * FROM validate_schema_setup();

-- Schedule periodic updates using pg_cron if available
-- This would be done in production environments for regular maintenance
/*
DO $$ 
BEGIN
  IF (SELECT count(*) FROM pg_available_extensions WHERE name = 'pg_cron') > 0 THEN
    -- Schedule daily cleanup job
    SELECT cron.schedule('thesisai-daily-cleanup', '0 2 * * *', 'SELECT run_full_cleanup();');
    
    -- Schedule weekly advisor rating update
    SELECT cron.schedule('thesisai-weekly-rating-update', '0 3 * * 0', 'CALL update_all_advisor_ratings_procedure();');
    
    -- Schedule monthly quota reset
    SELECT cron.schedule('thesisai-monthly-quota-reset', '0 0 1 * *', 'SELECT reset_monthly_quotas();');
  END IF;
EXCEPTION
  WHEN undefined_table OR undefined_function THEN
    RAISE NOTICE 'pg_cron extension not available, skipping scheduled jobs';
END $$;
*/

-- Final validation and status check
SELECT 'Database Setup Complete!' as status, NOW() as timestamp, 
       (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
       (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_policies,
       (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as total_indexes;

-- Commit transaction
COMMIT;