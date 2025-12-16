-- Phase 4.1: Views and Helper Functions

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

-- Function to search across multiple tables
CREATE OR REPLACE FUNCTION search_thesis_data(search_term TEXT)
RETURNS TABLE (
  result_type TEXT,
  result_id UUID,
  title TEXT,
  description TEXT,
  relevance_score NUMERIC,
  matched_field TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'thesis_project'::TEXT as result_type,
    tp.id as result_id,
    tp.title as title,
    LEFT(tp.abstract, 200) as description,
    ts_rank(to_tsvector('english', tp.title || ' ' || COALESCE(tp.abstract, '')), plainto_tsquery('english', search_term)) as relevance_score,
    'title_abstract' as matched_field
  FROM thesis_projects tp
  WHERE to_tsvector('english', tp.title || ' ' || COALESCE(tp.abstract, '')) @@ plainto_tsquery('english', search_term)
  
  UNION ALL
  
  SELECT 
    'thesis_chapter'::TEXT as result_type,
    tc.id as result_id,
    tc.title as title,
    LEFT(tc.content, 200) as description,
    ts_rank(to_tsvector('english', tc.title || ' ' || COALESCE(tc.content, '')), plainto_tsquery('english', search_term)) as relevance_score,
    'chapter_content' as matched_field
  FROM thesis_chapters tc
  WHERE to_tsvector('english', tc.title || ' ' || COALESCE(tc.content, '')) @@ plainto_tsquery('english', search_term)
  
  UNION ALL
  
  SELECT 
    'topic_idea'::TEXT as result_type,
    ti.id as result_id,
    ti.topic as title,
    LEFT(ti.description, 200) as description,
    ts_rank(to_tsvector('english', ti.topic || ' ' || COALESCE(ti.description, '')), plainto_tsquery('english', search_term)) as relevance_score,
    'topic_description' as matched_field
  FROM topic_ideas ti
  WHERE to_tsvector('english', ti.topic || ' ' || COALESCE(ti.description, '')) @@ plainto_tsquery('english', search_term)
  
  ORDER BY relevance_score DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Function to get recent activity for a user
CREATE OR REPLACE FUNCTION get_recent_user_activity(user_id_param UUID, days_back INTEGER DEFAULT 7)
RETURNS TABLE (
  activity_type TEXT,
  entity_id UUID,
  entity_title TEXT,
  action TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.entity_type as activity_type,
    al.entity_id,
    CASE 
      WHEN al.entity_type = 'thesis_projects' THEN (SELECT title FROM thesis_projects WHERE id = al.entity_id)
      WHEN al.entity_type = 'thesis_documents' THEN (SELECT title FROM thesis_documents WHERE id = al.entity_id)
      WHEN al.entity_type = 'advisor_feedback' THEN 'Feedback Review'
      WHEN al.entity_type = 'messages' THEN 'Message'
      ELSE al.entity_type
    END as entity_title,
    al.action,
    al.created_at,
    al.metadata
  FROM activity_logs al
  WHERE al.user_id = user_id_param
    AND al.created_at >= NOW() - (days_back || ' days')::INTERVAL
  ORDER BY al.created_at DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Function to get project completion status
CREATE OR REPLACE FUNCTION get_project_completion_status(project_id_param UUID)
RETURNS TABLE (
  phase_name TEXT,
  phase_status TEXT,
  phase_order INTEGER,
  phase_completed BOOLEAN,
  total_checklist_items INTEGER,
  completed_checklist_items INTEGER,
  checklist_progress_percentage INTEGER,
  milestone_name TEXT,
  milestone_status TEXT,
  milestone_progress_percentage INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tp.phase_name,
    tp.status as phase_status,
    tp.phase_order,
    CASE WHEN tp.status = 'completed' THEN true ELSE false END as phase_completed,
    (SELECT COUNT(*) FROM thesis_checklists tc WHERE tc.project_id = project_id_param AND tc.phase_name = tp.phase_name AND tc.is_required = true) as total_checklist_items,
    (SELECT COUNT(*) FROM thesis_checklists tc WHERE tc.project_id = project_id_param AND tc.phase_name = tp.phase_name AND tc.is_required = true AND tc.is_completed = true) as completed_checklist_items,
    COALESCE(ROUND(
      (CASE WHEN (SELECT COUNT(*) FROM thesis_checklists tc WHERE tc.project_id = project_id_param AND tc.phase_name = tp.phase_name AND tc.is_required = true) > 0 THEN
        (SELECT COUNT(*) FROM thesis_checklists tc WHERE tc.project_id = project_id_param AND tc.phase_name = tp.phase_name AND tc.is_required = true AND tc.is_completed = true)::NUMERIC * 100.0 /
        (SELECT COUNT(*) FROM thesis_checklists tc WHERE tc.project_id = project_id_param AND tc.phase_name = tp.phase_name AND tc.is_required = true)
      ELSE 0 END)
    ), 0) as checklist_progress_percentage,
    am.milestone_name,
    am.status as milestone_status,
    COALESCE(am.progress_percentage, 0) as milestone_progress_percentage
  FROM thesis_phases tp
  LEFT JOIN academic_milestones am ON tp.project_id = am.project_id AND tp.phase_name = am.milestone_name  -- Simplified join condition
  WHERE tp.project_id = project_id_param
  ORDER BY tp.phase_order;
END;
$$ LANGUAGE plpgsql;

-- View for institutional analytics
CREATE OR REPLACE VIEW institutional_analytics AS
SELECT 
  inst.id as institution_id,
  inst.name as institution_name,
  inst.type as institution_type,
  inst.location,
  COUNT(DISTINCT p.id) as total_students,
  COUNT(DISTINCT tp.id) as total_projects,
  COUNT(DISTINCT td.id) as total_documents,
  -- Average project duration (simplified)
  AVG(EXTRACT(EPOCH FROM (tp.updated_at - tp.created_at))/86400) as avg_days_per_project,
  -- Completion rate
  ROUND(
    (COUNT(CASE WHEN tp.status = 'submitted' OR tp.status = 'published' THEN 1 END)::NUMERIC * 100.0 / 
    NULLIF(COUNT(tp.id), 0)
  ), 2) as completion_rate_percentage,
  -- Active users in the last month
  COUNT(DISTINCT CASE WHEN p.updated_at >= CURRENT_DATE - INTERVAL '30 days' THEN p.id END) as active_users_recently
FROM institutions inst
LEFT JOIN profiles p ON inst.id = p.university_id
LEFT JOIN thesis_projects tp ON p.id = tp.user_id
LEFT JOIN thesis_documents td ON tp.id = td.project_id
GROUP BY inst.id, inst.name, inst.type, inst.location;

-- Function to get advisor availability
CREATE OR REPLACE FUNCTION get_advisor_availability(advisor_id_param UUID)
RETURNS TABLE (
  student_capacity INTEGER,
  assigned_students INTEGER,
  available_spots INTEGER,
  current_workload TEXT,
  is_available_for_new_students BOOLEAN
) AS $$
DECLARE
  max_stu INTEGER;
  assigned_stu INTEGER;
BEGIN
  SELECT max_students INTO max_stu FROM advisors WHERE id = advisor_id_param;
  SELECT COUNT(*) INTO assigned_stu FROM thesis_projects WHERE advisor_id = advisor_id_param AND status != 'archived';
  
  RETURN QUERY
  SELECT 
    COALESCE(max_stu, 0) as student_capacity,
    COALESCE(assigned_stu, 0) as assigned_students,
    GREATEST(0, COALESCE(max_stu, 0) - COALESCE(assigned_stu, 0)) as available_spots,
    CASE 
      WHEN assigned_stu >= max_stu THEN 'Full Capacity'
      WHEN assigned_stu >= (max_stu * 0.8)::INTEGER THEN 'Near Capacity'
      WHEN assigned_stu > (max_stu * 0.5)::INTEGER THEN 'Moderate'
      WHEN assigned_stu > 0 THEN 'Light'
      ELSE 'Available'
    END as current_workload,
    CASE WHEN (max_stu - assigned_stu) > 0 THEN true ELSE false END as is_available_for_new_students;
END;
$$ LANGUAGE plpgsql;

-- Refresh materialized views (though we don't have any yet, this is a placeholder)
-- REFRESH MATERIALIZED VIEW IF EXISTS thesis_project_stats;

-- Commit transaction
COMMIT;