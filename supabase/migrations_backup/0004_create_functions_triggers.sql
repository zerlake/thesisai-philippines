-- Phase 4.1: Database Functions and Triggers

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for tables that have updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_institutions_updated_at BEFORE UPDATE ON institutions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advisors_updated_at BEFORE UPDATE ON advisors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_critics_updated_at BEFORE UPDATE ON critics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_thesis_projects_updated_at BEFORE UPDATE ON thesis_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_thesis_documents_updated_at BEFORE UPDATE ON thesis_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_thesis_chapters_updated_at BEFORE UPDATE ON thesis_chapters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_generated_content_updated_at BEFORE UPDATE ON ai_generated_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topic_ideas_updated_at BEFORE UPDATE ON topic_ideas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_originality_checks_updated_at BEFORE UPDATE ON originality_checks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_formatting_guidelines_updated_at BEFORE UPDATE ON formatting_guidelines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_metrics_updated_at BEFORE UPDATE ON performance_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_thesis_checklists_updated_at BEFORE UPDATE ON thesis_checklists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_academic_milestones_updated_at BEFORE UPDATE ON academic_milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_stats_updated_at BEFORE UPDATE ON usage_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_research_groups_updated_at BEFORE UPDATE ON research_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_memberships_updated_at BEFORE UPDATE ON group_memberships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_literature_collections_updated_at BEFORE UPDATE ON literature_collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_literature_items_updated_at BEFORE UPDATE ON literature_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_modules_updated_at BEFORE UPDATE ON learning_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags
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

-- Trigger to automatically create profile for new users
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

-- Function to notify when a document needs review
CREATE OR REPLACE FUNCTION notify_document_review()
RETURNS TRIGGER AS $$
DECLARE
  student_id UUID;
  advisor_id UUID;
BEGIN
  -- Only send notification if status changes to 'review_requested'
  IF (NEW.status = 'review_requested' AND OLD.status != 'review_requested') THEN
    -- Get the student and advisor IDs
    SELECT user_id INTO student_id FROM thesis_documents WHERE id = NEW.id;
    SELECT advisor_id INTO advisor_id FROM thesis_projects WHERE id = NEW.project_id;
    
    -- Create notification for advisor
    IF advisor_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, message, type, action_required, action_url, created_at)
      VALUES (
        advisor_id,
        'Document Ready for Review',
        'A student has submitted a document for your review',
        'urgent',
        true,
        '/documents/' || NEW.id || '/review',
        NOW()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to notify advisor when document review is requested
CREATE TRIGGER notify_advisor_when_review_requested
  AFTER UPDATE ON thesis_documents
  FOR EACH ROW EXECUTE FUNCTION notify_document_review();

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
  AFTER INSERT OR DELETE ON ai_tool_usage
  FOR EACH ROW EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER update_stats_on_originality_check
  AFTER INSERT OR DELETE ON originality_checks
  FOR EACH ROW EXECUTE FUNCTION update_user_stats();

-- Function to validate document locking (prevents simultaneous editing)
CREATE OR REPLACE FUNCTION validate_document_lock()
RETURNS TRIGGER AS $$
DECLARE
  conflicting_doc RECORD;
BEGIN
  -- Check if there's a lock on this document by a different user
  SELECT * INTO conflicting_doc
  FROM thesis_documents
  WHERE id = NEW.id
    AND locked_by IS NOT NULL
    AND locked_by != NEW.locked_by
    AND locked_until > NOW();

  -- If there's a conflicting lock, raise an exception
  IF FOUND THEN
    RAISE EXCEPTION 'Document is already locked by another user';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate document locks before updating
CREATE TRIGGER validate_document_lock_before_update
  BEFORE UPDATE OF locked_by ON thesis_documents
  FOR EACH ROW EXECUTE FUNCTION validate_document_lock();

-- Function to manage group invitations
CREATE OR REPLACE FUNCTION handle_group_invite_acceptance()
RETURNS TRIGGER AS $$
DECLARE
  invite_email TEXT;
  user_profile_id UUID;
BEGIN
  -- If the invite status changed to 'accepted'
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    -- Get the email that was invited
    SELECT invitee_email INTO invite_email FROM collaboration_invites WHERE id = NEW.id;
    
    -- Find the profile ID for the email
    SELECT id INTO user_profile_id FROM profiles WHERE email = invite_email;
    
    -- Add the user to the group members if not already added
    IF user_profile_id IS NOT NULL THEN
      INSERT INTO group_memberships (group_id, user_id, role, status)
      VALUES (NEW.project_id, user_profile_id, 'member', 'active')
      ON CONFLICT (group_id, user_id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired invites
CREATE OR REPLACE FUNCTION cleanup_expired_invites()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark expired invites as expired
  UPDATE collaboration_invites
  SET status = 'expired'
  WHERE expires_at < NOW() AND status = 'pending';
  
  RETURN NULL; -- Event trigger, return value is ignored
END;
$$ LANGUAGE plpgsql;

-- Function to calculate advisor rating when feedback is resolved
CREATE OR REPLACE FUNCTION update_advisor_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating NUMERIC(3,2);
  review_count INTEGER;
BEGIN
  -- Only update rating when feedback is resolved
  IF (NEW.resolved = true AND OLD.resolved != true) THEN
    -- Calculate new average rating and count for the advisor
    -- (Assuming we have a rating field that gets captured elsewhere)
    UPDATE advisors
    SET 
      review_count = (
        SELECT COUNT(*)
        FROM advisor_feedback af
        JOIN thesis_documents td ON af.document_id = td.id
        JOIN thesis_projects tp ON td.project_id = tp.id
        WHERE tp.advisor_id = advisors.id AND af.resolved = true
      )
    WHERE id = (
      SELECT tp.advisor_id
      FROM advisor_feedback af
      JOIN thesis_documents td ON af.document_id = td.id
      JOIN thesis_projects tp ON td.project_id = tp.id
      WHERE af.id = NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update advisor rating when feedback is resolved
CREATE TRIGGER update_advisor_rating_on_resolution
  AFTER UPDATE ON advisor_feedback
  FOR EACH ROW EXECUTE FUNCTION update_advisor_rating();

-- Function to generate automatic notifications for important events
CREATE OR REPLACE FUNCTION generate_auto_notifications()
RETURNS TRIGGER AS $$
DECLARE
  student_id UUID;
  message TEXT;
  title TEXT;
BEGIN
  CASE TG_TABLE_NAME
    WHEN 'advisor_feedback' THEN
      -- When advisor gives feedback, notify the student
      IF TG_OP = 'INSERT' THEN
        SELECT td.user_id INTO student_id
        FROM advisor_feedback af
        JOIN thesis_documents td ON af.document_id = td.id
        WHERE af.id = NEW.id;
        
        title := 'New Advisor Feedback Received';
        message := 'Your advisor has provided feedback on your document "' || 
                  (SELECT title FROM thesis_documents WHERE id = NEW.document_id) || '"';
        
        INSERT INTO notifications (user_id, title, message, type, action_required, action_url, created_at)
        VALUES (student_id, title, message, 'info', true, '/feedback/' || NEW.id, NOW());
      END IF;
    
    WHEN 'critic_reviews' THEN
      -- When critic completes review, notify the student
      IF TG_OP = 'INSERT' AND NEW.completed_at IS NOT NULL THEN
        SELECT tp.user_id INTO student_id
        FROM critic_reviews cr
        JOIN thesis_projects tp ON cr.project_id = tp.id
        WHERE cr.id = NEW.id;
        
        title := 'Manuscript Critic Review Completed';
        message := 'Your manuscript critic has completed their review.';
        
        INSERT INTO notifications (user_id, title, message, type, action_required, action_url, created_at)
        VALUES (student_id, title, message, 'info', true, '/reviews/' || NEW.id, NOW());
      END IF;
    
    WHEN 'collaboration_invites' THEN
      -- When invite is sent, notify the invitee (would require sending email outside DB)
      IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
        -- In a real implementation, this would trigger an email
        -- For now, we'll just create a notification
        -- NOTE: We can't easily get recipient profile ID from email address alone
      END IF;
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic notifications
CREATE TRIGGER notify_on_advisor_feedback
  AFTER INSERT ON advisor_feedback
  FOR EACH ROW EXECUTE FUNCTION generate_auto_notifications();

CREATE TRIGGER notify_on_critic_review
  AFTER INSERT ON critic_reviews
  FOR EACH ROW EXECUTE FUNCTION generate_auto_notifications();

-- Function to maintain activity logs
CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS TRIGGER AS $$
DECLARE
  action_text TEXT;
  entity_type_text TEXT;
BEGIN
  -- Determine the entity type and action
  entity_type_text := TG_TABLE_NAME;
  
  CASE TG_OP
    WHEN 'INSERT' THEN action_text := 'created';
    WHEN 'UPDATE' THEN action_text := 'updated';
    WHEN 'DELETE' THEN action_text := 'deleted';
    ELSE action_text := TG_OP;
  END CASE;

  -- Log the activity
  INSERT INTO activity_logs (user_id, entity_type, entity_id, action, metadata, ip_address, user_agent)
  VALUES (
    auth.uid(), -- Get current user ID from auth
    entity_type_text,
    COALESCE(NEW.id, OLD.id),
    action_text,
    jsonb_build_object(
      'new', CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE '{}' END,
      'old', CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE '{}' END
    ),
    inet(client_addr()), -- Get client IP (may not work in all environments)
    text(client_hostname()) -- Get client hostname
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Enable logging for important user actions
-- (We won't create triggers for all tables to avoid too much logging overhead)
CREATE TRIGGER log_thesis_project_changes
  AFTER INSERT OR UPDATE OR DELETE ON thesis_projects
  FOR EACH ROW EXECUTE FUNCTION log_user_activity();

CREATE TRIGGER log_thesis_document_changes
  AFTER INSERT OR UPDATE OR DELETE ON thesis_documents
  FOR EACH ROW EXECUTE FUNCTION log_user_activity();

CREATE TRIGGER log_thesis_chapter_changes
  AFTER INSERT OR UPDATE OR DELETE ON thesis_chapters
  FOR EACH ROW EXECUTE FUNCTION log_user_activity();

CREATE TRIGGER log_ai_tool_usage
  AFTER INSERT ON ai_tool_usage
  FOR EACH ROW EXECUTE FUNCTION log_user_activity();

-- Function to calculate document similarity scores
CREATE OR REPLACE FUNCTION calculate_content_similarity(new_content TEXT, existing_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  existing_content TEXT;
  similarity_score NUMERIC;
BEGIN
  -- Get the existing content
  SELECT content INTO existing_content FROM thesis_chapters WHERE id = existing_id;
  
  -- Use pg_trgm to calculate similarity (requires pg_trgm extension)
  -- This is a simplified approach - full implementation would be more sophisticated
  similarity_score := (SELECT similarity(COALESCE(new_content, ''), COALESCE(existing_content, '')));
  
  RETURN similarity_score;
END;
$$ LANGUAGE plpgsql;

-- Function to validate and normalize email addresses
CREATE OR REPLACE FUNCTION validate_email(email_address TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email_address ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql;

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(input_text, '[^a-zA-Z0-9\s-]', '', 'g'), -- Remove special chars
      '\s+', '-', 'g' -- Replace spaces with hyphens
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Function to archive old records periodically
CREATE OR REPLACE FUNCTION archive_old_records()
RETURNS VOID AS $$
BEGIN
  -- Archive notifications older than 6 months (move to archive table)
  -- This would require creating an archive table first
  -- INSERT INTO notifications_archive SELECT * FROM notifications WHERE created_at < NOW() - INTERVAL '6 months';
  -- DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '6 months';
  
  -- Add more archiving logic as needed
  
  RAISE NOTICE 'Old records archived';
END;
$$ LANGUAGE plpgsql;

-- Function to maintain referential integrity for soft deletes
-- (If we had soft delete functionality)
/*
CREATE OR REPLACE FUNCTION mark_as_deleted()
RETURNS TRIGGER AS $$
BEGIN
  NEW.deleted_at = NOW();
  NEW.status = 'deleted';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
*/

-- Function to enforce business rules
CREATE OR REPLACE FUNCTION enforce_document_rules()
RETURNS TRIGGER AS $$
BEGIN
  -- Rule: Prevent document status change if locked by another user
  IF (NEW.status != OLD.status AND NEW.locked_by IS DISTINCT FROM auth.uid()) THEN
    RAISE EXCEPTION 'Cannot change status of document locked by another user';
  END IF;
  
  -- Rule: Prevent deletion of documents in 'approved' status
  IF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
    RAISE EXCEPTION 'Approved documents cannot be deleted';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for document business rules
CREATE TRIGGER enforce_document_business_rules
  BEFORE UPDATE OR DELETE ON thesis_documents
  FOR EACH ROW EXECUTE FUNCTION enforce_document_rules();

-- Commit transaction
COMMIT;