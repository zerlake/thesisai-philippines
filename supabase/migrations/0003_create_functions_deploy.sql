-- Phase 4.1: Functions and Triggers for Deployment

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
  INSERT INTO profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(SPLIT_PART(NEW.email, '@', 1), ''),
    ''
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Function to update project progress when checklist items change
CREATE OR REPLACE FUNCTION update_project_progress()
RETURNS TRIGGER AS $$
DECLARE
  progress_percent INTEGER;
BEGIN
  -- Only update if this is a required checklist item
  IF (NEW.is_required = true) OR (OLD.is_required = true) THEN
    progress_percent := calculate_project_progress(COALESCE(NEW.project_id, OLD.project_id));
    
    -- Update the project's progress percentage
    UPDATE thesis_projects
    SET progress_percentage = progress_percent
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update project progress when checklist items are modified
CREATE TRIGGER update_progress_on_checklist_change
  AFTER INSERT OR UPDATE OR DELETE ON thesis_checklists
  FOR EACH ROW EXECUTE FUNCTION update_project_progress();

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

-- Function to maintain user statistics
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Determine which user to update based on the table
  CASE TG_TABLE_NAME
    WHEN 'thesis_documents' THEN
      user_id := COALESCE(NEW.user_id, OLD.user_id);
    WHEN 'ai_tool_usage' THEN
      user_id := COALESCE(NEW.user_id, OLD.user_id);
    WHEN 'originality_checks' THEN
      user_id := COALESCE(NEW.user_id, OLD.user_id);
    ELSE
      user_id := NULL;
  END CASE;

  -- Update or create usage stats record for the current month
  INSERT INTO usage_stats (user_id, period_start, period_end, documents_created, ai_credits_used, originality_checks_used)
  VALUES (
    user_id,
    DATE_TRUNC('month', CURRENT_DATE),
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day',
    CASE WHEN TG_OP = 'INSERT' AND TG_TABLE_NAME = 'thesis_documents' THEN 1 ELSE 0 END,
    CASE WHEN TG_OP = 'INSERT' AND TG_TABLE_NAME = 'ai_tool_usage' THEN COALESCE(NEW.tokens_used, 0)/1000 ELSE 0 END,
    CASE WHEN TG_OP = 'INSERT' AND TG_TABLE_NAME = 'originality_checks' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id, period_start, period_end)
  DO UPDATE SET
    documents_created = usage_stats.documents_created + 
      CASE WHEN TG_OP = 'INSERT' AND TG_TABLE_NAME = 'thesis_documents' THEN 1 
           WHEN TG_OP = 'DELETE' AND TG_TABLE_NAME = 'thesis_documents' THEN -1 
           ELSE 0 END,
    ai_credits_used = usage_stats.ai_credits_used + 
      CASE WHEN TG_OP = 'INSERT' AND TG_TABLE_NAME = 'ai_tool_usage' THEN COALESCE(NEW.tokens_used, 0)/1000
           WHEN TG_OP = 'DELETE' AND TG_TABLE_NAME = 'ai_tool_usage' THEN -(COALESCE(OLD.tokens_used, 0)/1000)
           ELSE 0 END,
    originality_checks_used = usage_stats.originality_checks_used + 
      CASE WHEN TG_OP = 'INSERT' AND TG_TABLE_NAME = 'originality_checks' THEN 1
           WHEN TG_OP = 'DELETE' AND TG_TABLE_NAME = 'originality_checks' THEN -1
           ELSE 0 END;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating user statistics
CREATE TRIGGER update_stats_on_document_change
  AFTER INSERT OR UPDATE OR DELETE ON thesis_documents
  FOR EACH ROW EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER update_stats_on_ai_usage
  AFTER INSERT OR UPDATE OR DELETE ON ai_tool_usage
  FOR EACH ROW EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER update_stats_on_originality_check
  AFTER INSERT OR UPDATE OR DELETE ON originality_checks
  FOR EACH ROW EXECUTE FUNCTION update_user_stats();

-- Commit transaction
COMMIT;