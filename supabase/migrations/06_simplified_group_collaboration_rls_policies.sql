-- Additional fix for RLS policies to ensure no recursion
-- This migration ensures clean, non-recursive policies

-- Drop all group collaboration policies again to ensure clean state
DROP POLICY IF EXISTS "Users can view their own research groups" ON research_groups;
DROP POLICY IF EXISTS "Users can insert their own research groups" ON research_groups;
DROP POLICY IF EXISTS "Group leaders can update their groups" ON research_groups;
DROP POLICY IF EXISTS "Group leaders can delete their groups" ON research_groups;

DROP POLICY IF EXISTS "Members can view group memberships" ON group_memberships;
DROP POLICY IF EXISTS "Group leaders can manage memberships" ON group_memberships;

DROP POLICY IF EXISTS "Group leaders can manage invitations" ON group_invitations;
DROP POLICY IF EXISTS "Users can view and respond to their own invitations" ON group_invitations;

DROP POLICY IF EXISTS "Group members can view communications" ON group_communications;
DROP POLICY IF EXISTS "Group members can insert communications" ON group_communications;

DROP POLICY IF EXISTS "Group members can view tasks" ON group_tasks;
DROP POLICY IF EXISTS "Group members can manage tasks" ON group_tasks;

DROP POLICY IF EXISTS "Group members can view documents" ON group_documents;
DROP POLICY IF EXISTS "Group members can manage documents" ON group_documents;

-- Create simplified policies for research_groups
CREATE POLICY "Users can view their own research groups" ON research_groups
  FOR SELECT TO authenticated
  USING (
    auth.uid() = created_by OR
    id IN (
      SELECT DISTINCT group_id FROM group_memberships
      WHERE user_id = auth.uid() AND accepted_invite = true
    )
  );

CREATE POLICY "Users can insert their own research groups" ON research_groups
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group leaders can update their groups" ON research_groups
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = created_by
  );

CREATE POLICY "Group leaders can delete their groups" ON research_groups
  FOR DELETE TO authenticated
  USING (
    auth.uid() = created_by
  );

-- Create simplified policies for group_memberships
CREATE POLICY "Members can view their group memberships" ON group_memberships
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    group_id IN (
      SELECT id FROM research_groups WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Group leaders can manage memberships" ON group_memberships
  FOR ALL TO authenticated
  USING (
    group_id IN (
      SELECT id FROM research_groups WHERE created_by = auth.uid()
    )
  );

-- Create simplified policies for group_invitations
CREATE POLICY "Group leaders can manage invitations" ON group_invitations
  FOR ALL TO authenticated
  USING (
    group_id IN (
      SELECT id FROM research_groups WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view and respond to their own invitations" ON group_invitations
  FOR SELECT TO authenticated
  USING (auth.uid() = invited_by);

-- Create simplified policies for group_communications
CREATE POLICY "Group members can view communications" ON group_communications
  FOR SELECT TO authenticated
  USING (
    group_id IN (
      SELECT DISTINCT group_id FROM group_memberships
      WHERE user_id = auth.uid() AND accepted_invite = true
    )
  );

CREATE POLICY "Group members can insert communications" ON group_communications
  FOR INSERT TO authenticated
  WITH CHECK (
    group_id IN (
      SELECT DISTINCT group_id FROM group_memberships
      WHERE user_id = auth.uid() AND accepted_invite = true
    ) AND auth.uid() = sender_id
  );

-- Create simplified policies for group_tasks
CREATE POLICY "Group members can view tasks" ON group_tasks
  FOR SELECT TO authenticated
  USING (
    group_id IN (
      SELECT DISTINCT group_id FROM group_memberships
      WHERE user_id = auth.uid() AND accepted_invite = true
    )
  );

CREATE POLICY "Group members can manage tasks" ON group_tasks
  FOR ALL TO authenticated
  USING (
    (group_id IN (
      SELECT DISTINCT group_id FROM group_memberships
      WHERE user_id = auth.uid() AND accepted_invite = true AND role IN ('leader', 'co-leader')
    )) OR
    auth.uid() = assigned_to
  );

-- Create simplified policies for group_documents
CREATE POLICY "Group members can view documents" ON group_documents
  FOR SELECT TO authenticated
  USING (
    group_id IN (
      SELECT DISTINCT group_id FROM group_memberships
      WHERE user_id = auth.uid() AND accepted_invite = true
    )
  );

CREATE POLICY "Group leaders can manage documents" ON group_documents
  FOR ALL TO authenticated
  USING (
    group_id IN (
      SELECT DISTINCT group_id FROM group_memberships
      WHERE user_id = auth.uid() AND role IN ('leader', 'co-leader')
    ) OR auth.uid() = uploaded_by
  );