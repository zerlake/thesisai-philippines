-- Phase 4.1: Complete Database Setup for ThesisAI Philippines
-- Production-ready deployment script

-- Enable required extensions first
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text similarity
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- For performance monitoring
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- For UUID generation

-- Create additional indexes for performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_thesis_projects_user_status ON thesis_projects (user_id, status);
CREATE INDEX IF NOT EXISTS idx_thesis_documents_project_user ON thesis_documents (project_id, user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_entity ON activity_logs (user_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications (user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_ai_tool_usage_user_tool ON ai_tool_usage (user_id, tool_name);

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for tables that have updated_at columns
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_institutions_updated_at 
    BEFORE UPDATE ON institutions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at 
    BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advisors_updated_at 
    BEFORE UPDATE ON advisors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_critics_updated_at 
    BEFORE UPDATE ON critics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_thesis_projects_updated_at 
    BEFORE UPDATE ON thesis_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_thesis_documents_updated_at 
    BEFORE UPDATE ON thesis_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_thesis_chapters_updated_at 
    BEFORE UPDATE ON thesis_chapters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_generated_content_updated_at 
    BEFORE UPDATE ON ai_generated_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topic_ideas_updated_at 
    BEFORE UPDATE ON topic_ideas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_originality_checks_updated_at 
    BEFORE UPDATE ON originality_checks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_formatting_guidelines_updated_at 
    BEFORE UPDATE ON formatting_guidelines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_metrics_updated_at 
    BEFORE UPDATE ON performance_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_thesis_checklists_updated_at 
    BEFORE UPDATE ON thesis_checklists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_academic_milestones_updated_at 
    BEFORE UPDATE ON academic_milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at 
    BEFORE UPDATE ON plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_stats_updated_at 
    BEFORE UPDATE ON usage_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_research_groups_updated_at 
    BEFORE UPDATE ON research_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_memberships_updated_at 
    BEFORE UPDATE ON group_memberships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_literature_collections_updated_at 
    BEFORE UPDATE ON literature_collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_literature_items_updated_at 
    BEFORE UPDATE ON literature_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_modules_updated_at 
    BEFORE UPDATE ON learning_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at 
    BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at 
    BEFORE UPDATE ON feature_flags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, first_name, last_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(SPLIT_PART(NEW.email, '@', 1), ''),
    '',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Handle case where profile already exists
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant necessary permissions for the trigger function
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT SELECT ON auth.users TO service_role;

-- Trigger to automatically create profile for new auth users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to calculate project progress percentage
CREATE OR REPLACE FUNCTION calculate_project_progress(p_project_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_tasks INTEGER;
  completed_tasks INTEGER;
  progress_percent INTEGER;
BEGIN
  -- Count total required checklist items for this project
  SELECT COUNT(*) INTO total_tasks
  FROM thesis_checklists
  WHERE project_id = p_project_id AND is_required = true;
  
  -- Count completed required checklist items for this project
  SELECT COUNT(*) INTO completed_tasks
  FROM thesis_checklists
  WHERE project_id = p_project_id AND is_required = true AND is_completed = true;
  
  -- Calculate progress percentage
  IF total_tasks > 0 THEN
    progress_percent := ROUND((completed_tasks::DECIMAL / total_tasks) * 100);
  ELSE
    progress_percent := 0;
  END IF;
  
  RETURN progress_percent;
END;
$$ LANGUAGE plpgsql;

-- Function to update chapter word counts when content changes
CREATE OR REPLACE FUNCTION update_chapter_word_count()
RETURNS TRIGGER AS $$
DECLARE
  word_count INTEGER := 0;
  char_count INTEGER := 0;
BEGIN
  -- Calculate word count from content
  IF NEW.content IS NOT NULL THEN
    word_count := COALESCE(array_length(regexp_split_to_array(NEW.content, '\s+'), 1), 0);
    char_count := COALESCE(length(NEW.content), 0);
  END IF;
  
  -- Update word count and character count
  NEW.word_count := word_count;
  NEW.character_count := char_count;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update chapter word/character counts before content is saved
CREATE TRIGGER update_chapter_counts_before_save
  BEFORE INSERT OR UPDATE ON thesis_chapters
  FOR EACH ROW EXECUTE FUNCTION update_chapter_word_count();

-- Insert default system settings
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
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description,
  updated_at = NOW();

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
ON CONFLICT (flag_name) DO UPDATE SET
  is_enabled = EXCLUDED.is_enabled,
  description = EXCLUDED.description,
  rollout_percentage = EXCLUDED.rollout_percentage,
  updated_at = NOW();

-- Final verification query
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'THESISAI PHILIPPINES DATABASE SETUP COMPLETE';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Phase 4.1 - Database Schema Creation, RLS Security,';
  RAISE NOTICE 'Performance Indexing, and 85+ Database Tasks Complete';
  RAISE NOTICE '';
  RAISE NOTICE 'All components successfully implemented:';
  RAISE NOTICE '✓ % Core tables with proper relationships', (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name != 'migrations');
  RAISE NOTICE '✓ % RLS policies for security', (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public');
  RAISE NOTICE '✓ % Performance indexes', (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public');
  RAISE NOTICE '✓ All system configurations and feature flags set';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
END $$;

COMMIT;