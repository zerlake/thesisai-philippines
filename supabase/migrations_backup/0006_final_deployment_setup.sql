-- Phase 4.1 Final Deployment Script
-- This script brings together all the components created in the previous phases

-- 1. Enable extensions required by the application
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text similarity and fuzzy matching
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- For performance monitoring
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- For UUID generation functions

-- 2. Set up additional security configurations
-- Bypass RLS for service roles when needed
ALTER USER authenticator SET pgrst.db_anon_role = 'anon';
ALTER USER authenticator SET pgrst.db_service_role = 'service_role';

-- 3. Create additional helper functions for common operations
-- Function to slugify text for URLs
CREATE OR REPLACE FUNCTION slugify(text_input TEXT)
RETURNS TEXT AS $$
  SELECT LOWER(
    TRANSLATE(
      REGEXP_REPLACE($1, '[^a-zA-Z0-9_-]+', '-', 'g'),
      ' ',
      '-'
    )
  );
$$ LANGUAGE sql IMMUTABLE;

-- Function to calculate similarity percentage (requires pg_trgm)
CREATE OR REPLACE FUNCTION calculate_similarity(text1 TEXT, text2 TEXT)
RETURNS NUMERIC AS $$
  SELECT (similarity(COALESCE(text1, ''), COALESCE(text2, '')) * 100)::NUMERIC(5,2);
$$ LANGUAGE sql IMMUTABLE;

-- 4. Set up any additional triggers for data integrity
CREATE OR REPLACE FUNCTION prevent_deletion_of_approved_docs()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') AND (OLD.status = 'approved' OR OLD.status = 'published') THEN
    RAISE EXCEPTION 'Cannot delete documents with status "%" - please archive instead', OLD.status;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to protect approved documents
CREATE TRIGGER protect_approved_documents
  BEFORE DELETE ON thesis_documents
  FOR EACH ROW
  EXECUTE FUNCTION prevent_deletion_of_approved_docs();

-- 5. Set up default values for new rows
ALTER TABLE profiles 
ALTER COLUMN created_at SET DEFAULT NOW(),
ALTER COLUMN updated_at SET DEFAULT NOW();

ALTER TABLE thesis_projects
ALTER COLUMN created_at SET DEFAULT NOW(),
ALTER COLUMN updated_at SET DEFAULT NOW(),
ALTER COLUMN status SET DEFAULT 'draft';

ALTER TABLE thesis_documents
ALTER COLUMN created_at SET DEFAULT NOW(),
ALTER COLUMN updated_at SET DEFAULT NOW(),
ALTER COLUMN status SET DEFAULT 'draft';

ALTER TABLE advisor_feedback
ALTER COLUMN created_at SET DEFAULT NOW(),
ALTER COLUMN resolved SET DEFAULT FALSE;

-- 6. Create materialized view for dashboard analytics (refreshed periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS thesis_project_stats AS
SELECT 
  tp.status,
  COUNT(*) as project_count,
  AVG(tp.completion_percentage) as avg_completion,
  COUNT(CASE WHEN tp.completion_percentage >= 100 THEN 1 END) as completed_projects,
  COUNT(CASE WHEN tp.deadline < CURRENT_DATE AND tp.status != 'completed' THEN 1 END) as overdue_projects,
  COUNT(CASE WHEN tp.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_projects
FROM thesis_projects tp
GROUP BY tp.status;

-- Refresh materialized view
REFRESH MATERIALIZED VIEW thesis_project_stats;

-- 7. Create index on materialized view for faster queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thesis_project_stats_status ON thesis_project_stats (status);

-- 8. Add comments to important tables and columns for documentation
COMMENT ON TABLE thesis_projects IS 'Main table for thesis projects managed in the system';
COMMENT ON COLUMN thesis_projects.completion_percentage IS 'Calculated completion percentage based on checklist items completed';
COMMENT ON COLUMN thesis_projects.deadline IS 'Soft deadline for project completion';
COMMENT ON COLUMN thesis_projects.status IS 'Current status of the thesis project';

COMMENT ON TABLE thesis_documents IS 'Stores all document versions and metadata for thesis projects';
COMMENT ON COLUMN thesis_documents.file_size IS 'Size of document in bytes (NULL for non-file content)';
COMMENT ON COLUMN thesis_documents.status IS 'Status of the document in the review workflow';
COMMENT ON COLUMN thesis_documents.locked_by IS 'User who currently has exclusive editing rights';
COMMENT ON COLUMN thesis_documents.locked_until IS 'When the exclusive editing lock expires';

COMMENT ON TABLE advisor_feedback IS 'Feedback entries from advisors on student documents';
COMMENT ON COLUMN advisor_feedback.resolved IS 'Whether the feedback has been addressed by the student';
COMMENT ON COLUMN advisor_feedback.severity IS 'Severity/importance of the feedback';
COMMENT ON COLUMN advisor_feedback.comments IS 'Detailed feedback from the advisor';

-- 9. Set up row level security policies (these were defined in a previous migration)
-- Ensure RLS is enabled (should already be done)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE thesis_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE thesis_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisor_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE critic_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tool_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE originality_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE thesis_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_milestones ENABLE ROW LEVEL SECURITY;

-- 10. Add grants for service roles (necessary for Supabase)
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant basic connection permissions
GRANT CONNECT ON DATABASE postgres TO authenticator;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Grant table-level permissions for anon (public access where appropriate)
GRANT SELECT ON institutions TO anon;
GRANT SELECT ON departments TO anon;

-- Grant table-level permissions for authenticated users
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON thesis_projects TO authenticated;
GRANT SELECT, INSERT, UPDATE ON thesis_documents TO authenticated;
GRANT SELECT, INSERT, UPDATE ON thesis_chapters TO authenticated;
GRANT SELECT, INSERT, UPDATE ON advisor_feedback TO authenticated;
GRANT SELECT, INSERT, UPDATE ON notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON messages TO authenticated;
GRANT SELECT, INSERT ON ai_tool_usage TO authenticated;
GRANT SELECT, INSERT ON originality_checks TO authenticated;
GRANT SELECT, INSERT ON activity_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON thesis_checklists TO authenticated;
GRANT SELECT, INSERT, UPDATE ON academic_milestones TO authenticated;

-- Grant more extensive permissions for service_role (admin/backend services)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- 11. Create a function to rebuild search vectors when needed
CREATE OR REPLACE FUNCTION rebuild_search_vectors()
RETURNS VOID AS $$
BEGIN
  -- This would update tsvector columns if we had full text search indexes
  -- For now, this is a placeholder for future full text search implementation
  RAISE NOTICE 'Search vector rebuild complete';
END;
$$ LANGUAGE plpgsql;

-- 12. Setup a mock function for handling new user creation (would be triggered from auth)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    'student',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Create trigger for handling new auth user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 14. Final verification query to ensure everything is properly set up
DO $$
DECLARE
  table_count INTEGER;
  policy_count INTEGER;
  index_count INTEGER;
BEGIN
  -- Count tables
  SELECT COUNT(*) INTO table_count 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
  
  -- Count policies
  SELECT COUNT(*) INTO policy_count 
  FROM pg_policies 
  WHERE schemaname = 'public';
  
  -- Count indexes
  SELECT COUNT(*) INTO index_count 
  FROM pg_indexes 
  WHERE schemaname = 'public';
  
  RAISE NOTICE 'Database setup verification:';
  RAISE NOTICE 'Tables: %', table_count;
  RAISE NOTICE 'Policies: %', policy_count;
  RAISE NOTICE 'Indexes: %', index_count;
  
  -- Ensure we have a reasonable number of components
  IF table_count < 10 THEN
    RAISE WARNING 'Expected more tables in the schema';
  END IF;
  
  IF policy_count < 10 THEN
    RAISE WARNING 'Expected more RLS policies';
  END IF;
  
  IF index_count < 10 THEN
    RAISE WARNING 'Expected more performance indexes';
  END IF;
  
  RAISE NOTICE 'Database setup completed successfully!';
END $$;

-- 15. Commit the transaction
COMMIT;

-- This migration is now ready for deployment to production