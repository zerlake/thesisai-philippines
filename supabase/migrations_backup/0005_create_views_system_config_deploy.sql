-- Phase 4.1: Views and System Configurations for Deployment

-- View to get student project summary
CREATE OR REPLACE VIEW student_project_summary AS
SELECT 
  tp.id as project_id,
  tp.title,
  tp.status,
  tp.abstract,
  tp.academic_year,
  tp.semester,
  p.full_name as student_name,
  p.email as student_email,
  a.full_name as advisor_name,
  tc.chapter_number,
  tc.title as chapter_title,
  tc.status as chapter_status,
  td.version_number,
  td.status as document_status,
  td.updated_at as last_modified,
  tc.word_count,
  tc.pages_actual,
  -- Calculate overall progress
  (SELECT COUNT(*) FROM thesis_checklists tc2 WHERE tc2.project_id = tp.id AND tc2.is_required = true) as total_checklist_items,
  (SELECT COUNT(*) FROM thesis_checklists tc3 WHERE tc3.project_id = tp.id AND tc3.is_required = true AND tc3.is_completed = true) as completed_checklist_items,
  -- Calculate feedback stats
  (SELECT COUNT(*) FROM advisor_feedback af WHERE af.student_id = p.id) as feedback_count,
  (SELECT COUNT(*) FROM advisor_feedback af2 WHERE af2.student_id = p.id AND af2.resolved = false) as unresolved_feedback_count
FROM thesis_projects tp
JOIN profiles p ON tp.user_id = p.id
LEFT JOIN advisors adv ON tp.advisor_id = adv.id
LEFT JOIN profiles a ON adv.profile_id = a.id
LEFT JOIN thesis_chapters tc ON tp.id = tc.project_id
LEFT JOIN thesis_documents td ON tc.document_id = td.id;

-- View to get advisor workload
CREATE OR REPLACE VIEW advisor_workload_view AS
SELECT 
  a.id as advisor_id,
  p.full_name as advisor_name,
  p.email as advisor_email,
  d.name as department_name,
  inst.name as institution_name,
  a.years_experience,
  a.max_students,
  -- Get number of active projects assigned
  (SELECT COUNT(*) 
   FROM thesis_projects tp2 
   WHERE tp2.advisor_id = a.id 
   AND tp2.status IN ('draft', 'in_review', 'revisions', 'approved')) as assigned_projects,
  -- Get number of projects needing feedback
  (SELECT COUNT(DISTINCT td.project_id)
   FROM thesis_documents td
   JOIN thesis_projects tp3 ON td.project_id = tp3.id
   WHERE tp3.advisor_id = a.id
   AND td.status = 'review_requested') as projects_needing_feedback,
  -- Get pending feedback count
  (SELECT COUNT(*)
   FROM advisor_feedback af
   JOIN thesis_documents td2 ON af.document_id = td2.id
   JOIN thesis_projects tp4 ON td2.project_id = tp4.id
   WHERE tp4.advisor_id = a.id
   AND af.resolved = false) as pending_feedback
FROM advisors a
JOIN profiles p ON a.profile_id = p.id
LEFT JOIN departments d ON a.department_id = d.id
LEFT JOIN institutions inst ON d.institution_id = inst.id;

-- View to get document collaboration status
CREATE OR REPLACE VIEW document_collaboration_status AS
SELECT 
  td.id as document_id,
  td.title as document_title,
  td.type as document_type,
  td.status as document_status,
  p.full_name as owner_name,
  tp.title as project_title,
  -- Get count of feedback items
  (SELECT COUNT(*) FROM advisor_feedback af WHERE af.document_id = td.id) as feedback_count,
  (SELECT COUNT(*) FROM advisor_feedback af2 WHERE af2.document_id = td.id AND af2.resolved = false) as unresolved_feedback_count,
  -- Get critic reviews if any
  (SELECT COUNT(*) FROM critic_reviews cr WHERE cr.document_id = td.id) as critic_review_count,
  -- Get collaborators (other than owner)
  (SELECT COUNT(DISTINCT gm.user_id) 
   FROM group_documents gd
   JOIN group_memberships gm ON gd.group_id = gm.group_id
   WHERE gd.document_id = td.id AND gm.user_id != td.user_id) as collaborator_count
FROM thesis_documents td
JOIN profiles p ON td.user_id = p.id
JOIN thesis_projects tp ON td.project_id = tp.id;

-- View for AI tool analytics
CREATE OR REPLACE VIEW ai_tool_analytics AS
SELECT 
  atu.tool_name,
  COUNT(*) as usage_count,
  AVG(atu.tokens_used) as avg_tokens,
  SUM(atu.tokens_used) as total_tokens,
  AVG(atu.processing_time_ms) as avg_processing_time,
  SUM(atu.cost_credits) as total_cost_credits,
  COUNT(CASE WHEN atu.success = true THEN 1 END) as successful_executions,
  COUNT(CASE WHEN atu.success = false THEN 1 END) as failed_executions,
  COUNT(DISTINCT atu.user_id) as unique_users,
  DATE_TRUNC('day', atu.created_at) as usage_date
FROM ai_tool_usage atu
GROUP BY atu.tool_name, DATE_TRUNC('day', atu.created_at)
ORDER BY usage_date DESC, usage_count DESC;

-- View for thesis timeline tracking
CREATE OR REPLACE VIEW thesis_timeline_view AS
SELECT 
  tp.id as project_id,
  tp.title as project_title,
  p.full_name as student_name,
  tp.status as project_status,
  tp.academic_year,
  tp.semester,
  -- Phase tracking
  tp2.phase_name,
  tp2.status as phase_status,
  tp2.start_date,
  tp2.deadline,
  tp2.completion_date,
  -- Days until deadline
  CASE 
    WHEN tp2.deadline IS NOT NULL THEN tp2.deadline - CURRENT_DATE
    ELSE NULL
  END as days_until_deadline,
  -- Is deadline overdue?
  CASE 
    WHEN tp2.deadline IS NOT NULL AND tp2.deadline < CURRENT_DATE AND tp2.status != 'completed' 
    THEN true 
    ELSE false 
  END as is_overdue,
  -- Milestone tracking
  am.milestone_name,
  am.status as milestone_status,
  am.target_date,
  am.actual_completion_date,
  am.progress_percentage
FROM thesis_projects tp
JOIN profiles p ON tp.user_id = p.id
LEFT JOIN thesis_phases tp2 ON tp.id = tp2.project_id
LEFT JOIN academic_milestones am ON tp.id = am.project_id;

-- View for originality check analytics
CREATE OR REPLACE VIEW originality_check_analytics AS
SELECT 
  oc.status as check_status,
  oc.overall_similarity,
  CASE 
    WHEN oc.overall_similarity > 20 THEN 'High Risk'
    WHEN oc.overall_similarity BETWEEN 10 AND 20 THEN 'Medium Risk'
    WHEN oc.overall_similarity < 10 THEN 'Low Risk'
    ELSE 'Unknown'
  END as risk_level,
  td.title as document_title,
  td.type as document_type,
  p.full_name as student_name,
  tp.title as project_title,
  oc.started_at,
  oc.completed_at,
  -- Calculate processing duration
  CASE 
    WHEN oc.started_at IS NOT NULL AND oc.completed_at IS NOT NULL 
    THEN EXTRACT(EPOCH FROM (oc.completed_at - oc.started_at))/60  -- minutes
    ELSE NULL
  END as processing_minutes
FROM originality_checks oc
JOIN thesis_documents td ON oc.document_id = td.id
JOIN profiles p ON oc.user_id = p.id
JOIN thesis_projects tp ON td.project_id = tp.id;

-- View for user dashboard information
CREATE OR REPLACE VIEW user_dashboard_view AS
SELECT 
  p.id as user_id,
  p.full_name,
  p.email,
  p.role,
  inst.name as institution_name,
  d.name as department_name,
  -- Active projects count
  (SELECT COUNT(*) FROM thesis_projects tp WHERE tp.user_id = p.id AND tp.status != 'archived') as active_projects,
  -- Documents count
  (SELECT COUNT(*) FROM thesis_documents td WHERE td.user_id = p.id) as document_count,
  -- Pending feedback
  (SELECT COUNT(*) FROM advisor_feedback af JOIN thesis_documents td2 ON af.document_id = td2.id WHERE td2.user_id = p.id AND af.resolved = false) as pending_feedback,
  -- Unread notifications
  (SELECT COUNT(*) FROM notifications n WHERE n.user_id = p.id AND n.is_read = false) as unread_notifications,
  -- Recently accessed documents
  (SELECT STRING_AGG(td3.title, ', ')
   FROM thesis_documents td3
   WHERE td3.user_id = p.id
   ORDER BY td3.updated_at DESC
   LIMIT 3) as recent_documents,
  -- AI tool usage this month
  (SELECT COUNT(*) FROM ai_tool_usage atu WHERE atu.user_id = p.id AND DATE_TRUNC('month', atu.created_at) = DATE_TRUNC('month', CURRENT_TIMESTAMP)) as monthly_ai_uses,
  -- Storage used (approximate)
  (SELECT COALESCE(SUM(file_size), 0)/POWER(1024, 2) FROM thesis_documents WHERE user_id = p.id AND file_size IS NOT NULL) as storage_used_mb
FROM profiles p
LEFT JOIN institutions inst ON p.university_id = inst.id
LEFT JOIN departments d ON p.department = d.name;  -- This join might need adjustment based on actual relationship

-- View for advisor dashboard
CREATE OR REPLACE VIEW advisor_dashboard_view AS
SELECT 
  adv.id as advisor_id,
  ap.full_name as advisor_name,
  ap.email as advisor_email,
  d.name as department_name,
  inst.name as institution_name,
  -- Assigned students/projects
  (SELECT COUNT(*) FROM thesis_projects tp WHERE tp.advisor_id = adv.id) as assigned_projects,
  -- Projects needing attention
  (SELECT COUNT(DISTINCT tp2.id) 
   FROM thesis_projects tp2
   JOIN thesis_documents td ON tp2.id = td.project_id
   WHERE tp2.advisor_id = adv.id AND td.status = 'review_requested') as projects_needing_attention,
  -- Pending feedback requests
  (SELECT COUNT(*) FROM advisor_feedback af WHERE af.reviewer_id = adv.id AND af.resolved = false) as pending_feedback_requests,
  -- Average response time (simplified calculation)
  (SELECT AVG(EXTRACT(EPOCH FROM (af.updated_at - af.created_at))/3600) 
   FROM advisor_feedback af 
   WHERE af.reviewer_id = adv.id AND af.resolved = true) as avg_response_hours,
  -- Upcoming deadlines within 7 days
  (SELECT COUNT(*) 
   FROM academic_milestones am
   JOIN thesis_projects tp3 ON am.project_id = tp3.id
   WHERE tp3.advisor_id = adv.id 
   AND am.target_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
   AND am.status != 'completed') as upcoming_deadlines
FROM advisors adv
JOIN profiles ap ON adv.profile_id = ap.id
LEFT JOIN departments d ON adv.department_id = d.id
LEFT JOIN institutions inst ON d.institution_id = inst.id;

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
('thesisai.advance_analytics_enabled', 'true', 'Whether advanced analytics are enabled'),
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

-- Create a procedure to run periodic database optimizations
CREATE OR REPLACE PROCEDURE optimize_database_performance()
LANGUAGE plpgsql AS $$
BEGIN
  -- Update table statistics (equivalent to ANALYZE)
  RAISE NOTICE 'Updating table statistics...';
  ANALYZE;
  
  -- Log the optimization event
  INSERT INTO performance_metrics (metric_name, metric_value, context, recorded_at)
  VALUES ('database_optimization_run', 1, jsonb_build_object('timestamp', NOW(), 'user', SESSION_USER), NOW());
END;
$$;

-- Commit transaction
COMMIT;