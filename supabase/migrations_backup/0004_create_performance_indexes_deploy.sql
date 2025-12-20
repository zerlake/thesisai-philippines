-- Phase 4.1: Performance Indexes for Deployment

-- Composite indexes for frequently queried column combinations
-- Thesis projects with user and status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thesis_projects_user_status ON thesis_projects (user_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thesis_projects_advisor_status ON thesis_projects (advisor_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thesis_projects_status_academic_year ON thesis_projects (status, academic_year);

-- Thesis documents with project and user
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thesis_documents_project_user ON thesis_documents (project_id, user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thesis_documents_project_type ON thesis_documents (project_id, type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thesis_documents_user_status ON thesis_documents (user_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thesis_documents_project_status ON thesis_documents (project_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thesis_documents_project_updated_at ON thesis_documents (project_id, updated_at DESC);

-- Advisor feedback with document and reviewer
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_advisor_feedback_document_reviewer ON advisor_feedback (document_id, reviewer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_advisor_feedback_reviewer_resolved ON advisor_feedback (reviewer_id, resolved);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_advisor_feedback_student_resolved ON advisor_feedback (student_id, resolved);

-- Critic reviews with project and critic
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_critic_reviews_project_critic ON critic_reviews (project_id, critic_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_critic_reviews_critic_status ON critic_reviews (critic_id, approval_status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_critic_reviews_project_status ON critic_reviews (project_id, approval_status);

-- Notifications with user and read status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_read ON notifications (user_id, is_read);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_type ON notifications (user_id, type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_created_at ON notifications (user_id, created_at DESC);

-- Messages with sender and recipient
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender_recipient ON messages (sender_id, recipient_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_recipient_read ON messages (recipient_id, is_read);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_thread_created_at ON messages (thread_id, created_at DESC);

-- AI tool usage with user and tool
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_tool_usage_user_tool ON ai_tool_usage (user_id, tool_name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_tool_usage_user_created_at ON ai_tool_usage (user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_tool_usage_tool_created_at ON ai_tool_usage (tool_name, created_at DESC);

-- Originality checks with document and status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_originality_checks_document_status ON originality_checks (document_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_originality_checks_user_created_at ON originality_checks (user_id, created_at DESC);

-- Activity logs with user and entity
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_user_entity ON activity_logs (user_id, entity_type, entity_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_user_action ON activity_logs (user_id, action);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_entity_type_id ON activity_logs (entity_type, entity_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_created_at_desc ON activity_logs (created_at DESC);

-- Thesis phases with project and status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thesis_phases_project_status ON thesis_phases (project_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thesis_phases_project_order ON thesis_phases (project_id, phase_order);

-- Thesis chapters with project and type
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thesis_chapters_project_type ON thesis_chapters (project_id, chapter_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thesis_chapters_project_status ON thesis_chapters (project_id, status);

-- Citations with project and user
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_citations_project_user ON citations (project_id, user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_citations_user_year ON citations (user_id, publication_year);

-- Research gaps with project and user
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_research_gaps_project_user ON research_gaps (project_id, identified_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_research_gaps_project_addressed ON research_gaps (project_id, addressed);

-- Topic ideas with user and project
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_topic_ideas_user_project ON topic_ideas (user_id, project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_topic_ideas_user_status ON topic_ideas (user_id, status);

-- Thesis checklists with project and completion
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thesis_checklists_project_required ON thesis_checklists (project_id, is_required);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thesis_checklists_project_completed ON thesis_checklists (project_id, is_completed);

-- Academic milestones with project and status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_academic_milestones_project_status ON academic_milestones (project_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_academic_milestones_project_progress ON academic_milestones (project_id, progress_percentage);

-- Group related indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_memberships_group_user ON group_memberships (group_id, user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_memberships_user_status ON group_memberships (user_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_documents_group_document ON group_documents (group_id, document_id);

-- Literature collections with user
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_literature_collections_user_type ON literature_collections (user_id, collection_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_literature_items_collection_status ON literature_items (collection_id, read_status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_literature_items_collection_added_at ON literature_items (collection_id, added_at DESC);

-- Peer reviews with participants
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_peer_reviews_reviewer_doc ON peer_reviews (reviewer_id, document_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_peer_reviews_reviewee_doc ON peer_reviews (reviewee_id, document_id);

-- User progress with user and module
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_user_module ON user_progress (user_id, module_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_user_status ON user_progress (user_id, status);

-- Usage stats with user and period
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usage_stats_user_period ON usage_stats (user_id, period_start, period_end);

-- Moderation reports with status and reporter
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_moderation_reports_status ON moderation_reports (status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_moderation_reports_reporter ON moderation_reports (reporter_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_moderation_reports_entity ON moderation_reports (reported_entity_type, reported_entity_id);

-- Functional indexes for computed/generated columns
-- Already handled by the generated column definition

-- Partial indexes for frequently filtered data
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_unread_only ON notifications (user_id, created_at DESC) WHERE is_read = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_unread_only ON messages (recipient_id, created_at DESC) WHERE is_read = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_unread_by_sender ON messages (recipient_id, sender_id) WHERE is_read = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thesis_documents_draft_only ON thesis_documents (project_id, updated_at DESC) WHERE status = 'draft';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thesis_documents_locked_by_user ON thesis_documents (locked_by) WHERE locked_by IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_tool_usage_successful ON ai_tool_usage (user_id, created_at DESC) WHERE success = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_generated_content_accepted ON ai_generated_content (user_id) WHERE acceptance_status = 'accepted';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_topic_ideas_saved ON topic_ideas (user_id) WHERE status = 'saved';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_originality_checks_completed ON originality_checks (document_id) WHERE status = 'completed';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_research_gaps_not_addressed ON research_gaps (project_id, created_at DESC) WHERE addressed = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_academic_milestones_unfinished ON academic_milestones (project_id) WHERE status != 'completed';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_memberships_active ON group_memberships (group_id) WHERE status = 'active';

-- Expression indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thesis_projects_year_semester ON thesis_projects ((academic_year || '-' || semester));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_citations_year_type ON citations (publication_year, citation_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_action_summary ON activity_logs ((action || ':' || entity_type));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_priority_thread ON messages (priority, thread_id) WHERE thread_id IS NOT NULL;

-- BRIN indexes for time-series data (good for large historical tables)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activity_logs_brin ON activity_logs USING brin(created_at) WITH (pages_per_range = 32);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_brin ON notifications USING brin(created_at) WITH (pages_per_range = 32);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_tool_usage_brin ON ai_tool_usage USING brin(created_at) WITH (pages_per_range = 32);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_brin ON messages USING brin(created_at) WITH (pages_per_range = 32);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_originality_checks_brin ON originality_checks USING brin(created_at) WITH (pages_per_range = 32);

-- Indexes to support foreign key relationships and joins
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thesis_documents_project_fkey ON thesis_documents (project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thesis_documents_user_fkey ON thesis_documents (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_advisor_feedback_document_fkey ON advisor_feedback (document_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_advisor_feedback_reviewer_fkey ON advisor_feedback (reviewer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_advisor_feedback_student_fkey ON advisor_feedback (student_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_critic_reviews_project_fkey ON critic_reviews (project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_critic_reviews_critic_fkey ON critic_reviews (critic_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_critic_reviews_document_fkey ON critic_reviews (document_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_fkey ON notifications (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender_fkey ON messages (sender_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_recipient_fkey ON messages (recipient_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_tool_usage_user_fkey ON ai_tool_usage (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_generated_content_user_fkey ON ai_generated_content (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_generated_content_project_fkey ON ai_generated_content (project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_generated_content_document_fkey ON ai_generated_content (document_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_topic_ideas_user_fkey ON topic_ideas (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_topic_ideas_project_fkey ON topic_ideas (project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_originality_checks_document_fkey ON originality_checks (document_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_originality_checks_user_fkey ON originality_checks (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thesis_phases_project_fkey ON thesis_phases (project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thesis_chapters_project_fkey ON thesis_chapters (project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thesis_chapters_document_fkey ON thesis_chapters (document_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_citations_project_fkey ON citations (project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_citations_user_fkey ON citations (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_research_gaps_project_fkey ON research_gaps (project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_research_gaps_user_fkey ON research_gaps (identified_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thesis_checklists_project_fkey ON thesis_checklists (project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_thesis_checklists_completer_fkey ON thesis_checklists (completed_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_academic_milestones_project_fkey ON academic_milestones (project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_academic_milestones_completer_fkey ON academic_milestones (completed_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_user_fkey ON subscriptions (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_plan_fkey ON subscriptions (plan_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usage_stats_user_fkey ON usage_stats (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_research_groups_leader_fkey ON research_groups (leader_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_research_groups_institution_fkey ON research_groups (institution_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_research_groups_department_fkey ON research_groups (department_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_memberships_group_fkey ON group_memberships (group_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_memberships_user_fkey ON group_memberships (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_documents_group_fkey ON group_documents (group_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_documents_document_fkey ON group_documents (document_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_documents_shared_by_fkey ON group_documents (shared_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_literature_collections_user_fkey ON literature_collections (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_literature_items_collection_fkey ON literature_items (collection_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_peer_reviews_reviewer_fkey ON peer_reviews (reviewer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_peer_reviews_reviewee_fkey ON peer_reviews (reviewee_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_peer_reviews_document_fkey ON peer_reviews (document_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_peer_reviews_project_fkey ON peer_reviews (project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_user_fkey ON user_progress (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_progress_module_fkey ON user_progress (module_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_moderation_reports_reporter_fkey ON moderation_reports (reporter_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_moderation_reports_resolved_by_fkey ON moderation_reports (resolved_by);

-- Commit transaction
COMMIT;