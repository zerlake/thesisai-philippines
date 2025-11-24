-- Final fix for group_memberships table RLS policy
-- This migration addresses the specific issue with fetching memberships

-- Drop and recreate the policy for group_memberships to be as simple as possible
DROP POLICY IF EXISTS "Members can view their group memberships" ON group_memberships;
DROP POLICY IF EXISTS "Group leaders can manage memberships" ON group_memberships;

-- Create the most basic policy that just allows users to access their own memberships
CREATE POLICY "Users can view and manage their own memberships" ON group_memberships
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Also update research_groups to make sure it allows basic access
DROP POLICY IF EXISTS "Users can view their own research groups" ON research_groups;
CREATE POLICY "Users can view their own research groups" ON research_groups
  FOR SELECT TO authenticated
  USING (
    auth.uid() = created_by OR
    id IN (
      SELECT DISTINCT group_id FROM group_memberships
      WHERE user_id = auth.uid() AND accepted_invite = true
    )
  );