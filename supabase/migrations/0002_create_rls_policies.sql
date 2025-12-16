-- Phase 4.1: RLS Security Policies

-- Policies for Profiles table
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT TO service_role
  USING (true);

CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL TO service_role
  USING (true);

-- Policies for Institutions table
CREATE POLICY "Everyone can view institutions" ON institutions
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Staff can manage institutions" ON institutions
  FOR ALL TO service_role
  USING (true);

-- Policies for Thesis Projects table
CREATE POLICY "Users can view own projects" ON thesis_projects
  FOR SELECT TO authenticated
  USING (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can create own projects" ON thesis_projects
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can update own projects" ON thesis_projects
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT id FROM profiles WHERE auth.uid() = id))
  WITH CHECK (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Advisor can view assigned projects" ON thesis_projects
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT tp.id 
      FROM thesis_projects tp
      JOIN advisors a ON tp.advisor_id = a.id
      JOIN profiles p ON a.profile_id = p.id
      WHERE p.id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  );

CREATE POLICY "Admins can manage all projects" ON thesis_projects
  FOR ALL TO service_role
  USING (true);

-- Policies for Thesis Documents table
CREATE POLICY "Users can view own documents" ON thesis_documents
  FOR SELECT TO authenticated
  USING (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can create own documents" ON thesis_documents
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can update own documents" ON thesis_documents
  FOR UPDATE TO authenticated
  USING (
    user_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    OR
    -- Allow if document is linked to a project where user is advisor
    id IN (
      SELECT td.id
      FROM thesis_documents td
      JOIN thesis_projects tp ON td.project_id = tp.id
      JOIN advisors a ON tp.advisor_id = a.id
      JOIN profiles p ON a.profile_id = p.id
      WHERE p.id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  )
  WITH CHECK (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Advisor can edit assigned documents" ON thesis_documents
  FOR UPDATE TO authenticated
  USING (
    id IN (
      SELECT td.id
      FROM thesis_documents td
      JOIN thesis_projects tp ON td.project_id = tp.id
      JOIN advisors a ON tp.advisor_id = a.id
      JOIN profiles p ON a.profile_id = p.id
      WHERE p.id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  )
  WITH CHECK (true);

CREATE POLICY "Admins can manage all documents" ON thesis_documents
  FOR ALL TO service_role
  USING (true);

-- Policies for Advisor Feedback table
CREATE POLICY "Users can view feedback on their documents" ON advisor_feedback
  FOR SELECT TO authenticated
  USING (
    document_id IN (
      SELECT id 
      FROM thesis_documents 
      WHERE user_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  );

CREATE POLICY "Student can see feedback on their work" ON advisor_feedback
  FOR SELECT TO authenticated
  USING (student_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Advisor can create feedback" ON advisor_feedback
  FOR INSERT TO authenticated
  WITH CHECK (
    reviewer_id IN (
      SELECT id 
      FROM advisors 
      WHERE profile_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  );

CREATE POLICY "Advisor can update own feedback" ON advisor_feedback
  FOR UPDATE TO authenticated
  USING (
    reviewer_id IN (
      SELECT id 
      FROM advisors 
      WHERE profile_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  )
  WITH CHECK (
    reviewer_id IN (
      SELECT id 
      FROM advisors 
      WHERE profile_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  );

CREATE POLICY "Admins can manage all feedback" ON advisor_feedback
  FOR ALL TO service_role
  USING (true);

-- Policies for Critic Reviews table
CREATE POLICY "Students can view reviews on their projects" ON critic_reviews
  FOR SELECT TO authenticated
  USING (
    project_id IN (
      SELECT id 
      FROM thesis_projects 
      WHERE user_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  );

CREATE POLICY "Critics can create reviews" ON critic_reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    critic_id IN (
      SELECT id 
      FROM critics 
      WHERE profile_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  );

CREATE POLICY "Critics can update own reviews" ON critic_reviews
  FOR UPDATE TO authenticated
  USING (
    critic_id IN (
      SELECT id 
      FROM critics 
      WHERE profile_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  )
  WITH CHECK (
    critic_id IN (
      SELECT id 
      FROM critics 
      WHERE profile_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  );

CREATE POLICY "Admins can manage all reviews" ON critic_reviews
  FOR ALL TO service_role
  USING (true);

-- Policies for Notifications table
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT TO authenticated
  USING (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can update own notification status" ON notifications
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT id FROM profiles WHERE auth.uid() = id))
  WITH CHECK (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Admins can manage all notifications" ON notifications
  FOR ALL TO service_role
  USING (true);

-- Policies for Messages table
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT TO authenticated
  USING (sender_id = (SELECT id FROM profiles WHERE auth.uid() = id) OR recipient_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE TO authenticated
  USING (sender_id = (SELECT id FROM profiles WHERE auth.uid() = id))
  WITH CHECK (sender_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Admins can manage all messages" ON messages
  FOR ALL TO service_role
  USING (true);

-- Policies for AI Tool Usage table
CREATE POLICY "Users can view own AI usage" ON ai_tool_usage
  FOR SELECT TO authenticated
  USING (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can create AI usage records" ON ai_tool_usage
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Admins can view all AI usage" ON ai_tool_usage
  FOR SELECT TO service_role
  USING (true);

-- Policies for AI Generated Content table
CREATE POLICY "Users can view own generated content" ON ai_generated_content
  FOR SELECT TO authenticated
  USING (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can create own generated content" ON ai_generated_content
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can update own generated content" ON ai_generated_content
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT id FROM profiles WHERE auth.uid() = id))
  WITH CHECK (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Admins can manage all generated content" ON ai_generated_content
  FOR ALL TO service_role
  USING (true);

-- Policies for Originality Checks table
CREATE POLICY "Users can view own originality checks" ON originality_checks
  FOR SELECT TO authenticated
  USING (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can create own originality checks" ON originality_checks
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can update own originality checks" ON originality_checks
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT id FROM profiles WHERE auth.uid() = id))
  WITH CHECK (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Admins can manage all originality checks" ON originality_checks
  FOR ALL TO service_role
  USING (true);

-- Policies for Activity Logs table
CREATE POLICY "Users can view own activities" ON activity_logs
  FOR SELECT TO authenticated
  USING (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can create activity logs" ON activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Admins can view all activities" ON activity_logs
  FOR SELECT TO service_role
  USING (true);

CREATE POLICY "Admins can manage all activities" ON activity_logs
  FOR ALL TO service_role
  USING (true);

-- Policies for Thesis Phases table
CREATE POLICY "Users can view phases for own projects" ON thesis_phases
  FOR SELECT TO authenticated
  USING (
    project_id IN (
      SELECT id 
      FROM thesis_projects 
      WHERE user_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  );

CREATE POLICY "Users can create phases for own projects" ON thesis_phases
  FOR INSERT TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id 
      FROM thesis_projects 
      WHERE user_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  );

CREATE POLICY "Users can update phases for own projects" ON thesis_phases
  FOR UPDATE TO authenticated
  USING (
    project_id IN (
      SELECT id 
      FROM thesis_projects 
      WHERE user_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id 
      FROM thesis_projects 
      WHERE user_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  );

CREATE POLICY "Advisor can view phases for assigned projects" ON thesis_phases
  FOR SELECT TO authenticated
  USING (
    project_id IN (
      SELECT tp.id 
      FROM thesis_projects tp
      JOIN advisors a ON tp.advisor_id = a.id
      JOIN profiles p ON a.profile_id = p.id
      WHERE p.id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  );

CREATE POLICY "Admins can manage all phases" ON thesis_phases
  FOR ALL TO service_role
  USING (true);

-- Policies for Thesis Chapters table
CREATE POLICY "Users can view own chapters" ON thesis_chapters
  FOR SELECT TO authenticated
  USING (
    project_id IN (
      SELECT id 
      FROM thesis_projects 
      WHERE user_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  );

CREATE POLICY "Users can create own chapters" ON thesis_chapters
  FOR INSERT TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id 
      FROM thesis_projects 
      WHERE user_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  );

CREATE POLICY "Users can update own chapters" ON thesis_chapters
  FOR UPDATE TO authenticated
  USING (
    project_id IN (
      SELECT id 
      FROM thesis_projects 
      WHERE user_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id 
      FROM thesis_projects 
      WHERE user_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  );

CREATE POLICY "Advisor can view chapters for assigned projects" ON thesis_chapters
  FOR SELECT TO authenticated
  USING (
    project_id IN (
      SELECT tp.id 
      FROM thesis_projects tp
      JOIN advisors a ON tp.advisor_id = a.id
      JOIN profiles p ON a.profile_id = p.id
      WHERE p.id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  );

CREATE POLICY "Admins can manage all chapters" ON thesis_chapters
  FOR ALL TO service_role
  USING (true);

-- Policies for Citations table
CREATE POLICY "Users can view own citations" ON citations
  FOR SELECT TO authenticated
  USING (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can create own citations" ON citations
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can update own citations" ON citations
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT id FROM profiles WHERE auth.uid() = id))
  WITH CHECK (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Admins can manage all citations" ON citations
  FOR ALL TO service_role
  USING (true);

-- Policies for Research Gaps table
CREATE POLICY "Users can view own research gaps" ON research_gaps
  FOR SELECT TO authenticated
  USING (
    project_id IN (
      SELECT id 
      FROM thesis_projects 
      WHERE user_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  );

CREATE POLICY "Users can create own research gaps" ON research_gaps
  FOR INSERT TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id 
      FROM thesis_projects 
      WHERE user_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    ) AND
    identified_by = (SELECT id FROM profiles WHERE auth.uid() = id)
  );

CREATE POLICY "Users can update own research gaps" ON research_gaps
  FOR UPDATE TO authenticated
  USING (
    project_id IN (
      SELECT id 
      FROM thesis_projects 
      WHERE user_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    ) AND
    identified_by = (SELECT id FROM profiles WHERE auth.uid() = id)
  )
  WITH CHECK (
    project_id IN (
      SELECT id 
      FROM thesis_projects 
      WHERE user_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    ) AND
    identified_by = (SELECT id FROM profiles WHERE auth.uid() = id)
  );

CREATE POLICY "Admins can manage all research gaps" ON research_gaps
  FOR ALL TO service_role
  USING (true);

-- Policies for Topic Ideas table
CREATE POLICY "Users can view own topic ideas" ON topic_ideas
  FOR SELECT TO authenticated
  USING (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can create own topic ideas" ON topic_ideas
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can update own topic ideas" ON topic_ideas
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT id FROM profiles WHERE auth.uid() = id))
  WITH CHECK (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Admins can manage all topic ideas" ON topic_ideas
  FOR ALL TO service_role
  USING (true);

-- Policies for Thesis Checklists table
CREATE POLICY "Users can view checklists for own projects" ON thesis_checklists
  FOR SELECT TO authenticated
  USING (
    project_id IN (
      SELECT id 
      FROM thesis_projects 
      WHERE user_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  );

CREATE POLICY "Users can create checklists for own projects" ON thesis_checklists
  FOR INSERT TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id 
      FROM thesis_projects 
      WHERE user_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  );

CREATE POLICY "Users can update checklists for own projects" ON thesis_checklists
  FOR UPDATE TO authenticated
  USING (
    project_id IN (
      SELECT id 
      FROM thesis_projects 
      WHERE user_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id 
      FROM thesis_projects 
      WHERE user_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    ) OR
    -- Allow if user is completing the checklist item
    completed_by = (SELECT id FROM profiles WHERE auth.uid() = id)
  );

CREATE POLICY "Advisor can view checklists for assigned projects" ON thesis_checklists
  FOR SELECT TO authenticated
  USING (
    project_id IN (
      SELECT tp.id 
      FROM thesis_projects tp
      JOIN advisors a ON tp.advisor_id = a.id
      JOIN profiles p ON a.profile_id = p.id
      WHERE p.id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  );

CREATE POLICY "Admins can manage all checklists" ON thesis_checklists
  FOR ALL TO service_role
  USING (true);

-- Policies for Academic Milestones table
CREATE POLICY "Users can view milestones for own projects" ON academic_milestones
  FOR SELECT TO authenticated
  USING (
    project_id IN (
      SELECT id 
      FROM thesis_projects 
      WHERE user_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  );

CREATE POLICY "Users can create milestones for own projects" ON academic_milestones
  FOR INSERT TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id 
      FROM thesis_projects 
      WHERE user_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  );

CREATE POLICY "Users can update milestones for own projects" ON academic_milestones
  FOR UPDATE TO authenticated
  USING (
    project_id IN (
      SELECT id 
      FROM thesis_projects 
      WHERE user_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id 
      FROM thesis_projects 
      WHERE user_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    ) OR
    completed_by = (SELECT id FROM profiles WHERE auth.uid() = id)
  );

CREATE POLICY "Advisor can view milestones for assigned projects" ON academic_milestones
  FOR SELECT TO authenticated
  USING (
    project_id IN (
      SELECT tp.id 
      FROM thesis_projects tp
      JOIN advisors a ON tp.advisor_id = a.id
      JOIN profiles p ON a.profile_id = p.id
      WHERE p.id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  );

CREATE POLICY "Admins can manage all milestones" ON academic_milestones
  FOR ALL TO service_role
  USING (true);

-- Policies for Research Groups table
CREATE POLICY "Members can view groups they belong to" ON research_groups
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT gm.group_id
      FROM group_memberships gm
      JOIN profiles p ON gm.user_id = p.id
      WHERE p.id = (SELECT id FROM profiles WHERE auth.uid() = id) AND gm.status = 'active'
    )
  );

CREATE POLICY "Leaders can create groups" ON research_groups
  FOR INSERT TO authenticated
  WITH CHECK (leader_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Leaders can update own groups" ON research_groups
  FOR UPDATE TO authenticated
  USING (leader_id = (SELECT id FROM profiles WHERE auth.uid() = id))
  WITH CHECK (leader_id = (SELECT id FROM profiles WHERE auth.uid() = id));

-- Policies for Group Memberships table
CREATE POLICY "Users can view own membership" ON group_memberships
  FOR SELECT TO authenticated
  USING (user_id = (SELECT id FROM profiles WHERE auth.uid() = id) OR
         group_id IN (
           SELECT rg.id
           FROM research_groups rg
           WHERE rg.leader_id = (SELECT id FROM profiles WHERE auth.uid() = id)
         ));

CREATE POLICY "Leaders can manage memberships" ON group_memberships
  FOR ALL TO authenticated
  USING (
    group_id IN (
      SELECT rg.id
      FROM research_groups rg
      WHERE rg.leader_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  );

-- Policies for Group Documents table
CREATE POLICY "Members can view group documents" ON group_documents
  FOR SELECT TO authenticated
  USING (
    group_id IN (
      SELECT gm.group_id
      FROM group_memberships gm
      JOIN profiles p ON gm.user_id = p.id
      WHERE p.id = (SELECT id FROM profiles WHERE auth.uid() = id) AND gm.status = 'active'
    )
  );

CREATE POLICY "Leaders can manage all group documents" ON group_documents
  FOR ALL TO authenticated
  USING (
    group_id IN (
      SELECT rg.id
      FROM research_groups rg
      WHERE rg.leader_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  );

-- Policies for Literature Collections table
CREATE POLICY "Users can view own collections" ON literature_collections
  FOR SELECT TO authenticated
  USING (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can create own collections" ON literature_collections
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can update own collections" ON literature_collections
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT id FROM profiles WHERE auth.uid() = id))
  WITH CHECK (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Admins can manage all collections" ON literature_collections
  FOR ALL TO service_role
  USING (true);

-- Policies for Literature Items table
CREATE POLICY "Users can view items in their collections" ON literature_items
  FOR SELECT TO authenticated
  USING (
    collection_id IN (
      SELECT id
      FROM literature_collections
      WHERE user_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  );

CREATE POLICY "Users can create items in their collections" ON literature_items
  FOR INSERT TO authenticated
  WITH CHECK (
    collection_id IN (
      SELECT id
      FROM literature_collections
      WHERE user_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  );

CREATE POLICY "Users can update items in their collections" ON literature_items
  FOR UPDATE TO authenticated
  USING (
    collection_id IN (
      SELECT id
      FROM literature_collections
      WHERE user_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  )
  WITH CHECK (
    collection_id IN (
      SELECT id
      FROM literature_collections
      WHERE user_id = (SELECT id FROM profiles WHERE auth.uid() = id)
    )
  );

CREATE POLICY "Admins can manage all literature items" ON literature_items
  FOR ALL TO service_role
  USING (true);

-- Policies for Peer Reviews table
CREATE POLICY "Users can view their own reviews" ON peer_reviews
  FOR SELECT TO authenticated
  USING (reviewer_id = (SELECT id FROM profiles WHERE auth.uid() = id) OR
         reviewee_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can create peer reviews" ON peer_reviews
  FOR INSERT TO authenticated
  WITH CHECK (reviewer_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can update own peer reviews" ON peer_reviews
  FOR UPDATE TO authenticated
  USING (reviewer_id = (SELECT id FROM profiles WHERE auth.uid() = id))
  WITH CHECK (reviewer_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Admins can manage all peer reviews" ON peer_reviews
  FOR ALL TO service_role
  USING (true);

-- Policies for Learning Modules table
CREATE POLICY "Everyone can view published modules" ON learning_modules
  FOR SELECT TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Staff can manage all modules" ON learning_modules
  FOR ALL TO service_role
  USING (true);

-- Policies for User Progress table
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT TO authenticated
  USING (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can create own progress" ON user_progress
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT id FROM profiles WHERE auth.uid() = id))
  WITH CHECK (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Admins can manage all progress" ON user_progress
  FOR ALL TO service_role
  USING (true);

-- Policies for Subscriptions and Usage Stats table
CREATE POLICY "Users can view own subscription and usage" ON subscriptions
  FOR SELECT TO authenticated
  USING (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can view own usage stats" ON usage_stats
  FOR SELECT TO authenticated
  USING (user_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Admins can manage all subscriptions" ON subscriptions
  FOR ALL TO service_role
  USING (true);

CREATE POLICY "Admins can manage all usage stats" ON usage_stats
  FOR ALL TO service_role
  USING (true);

-- Policies for Moderation Reports table
CREATE POLICY "Users can submit reports" ON moderation_reports
  FOR INSERT TO authenticated
  WITH CHECK (reporter_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Admins can view all reports" ON moderation_reports
  FOR SELECT TO service_role
  USING (true);

CREATE POLICY "Admins can manage all reports" ON moderation_reports
  FOR ALL TO service_role
  USING (true);

COMMIT;