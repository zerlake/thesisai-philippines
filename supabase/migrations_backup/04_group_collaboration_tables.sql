-- Group collaboration tables

-- Groups table
CREATE TABLE IF NOT EXISTS research_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived'))
);

-- Group memberships table
CREATE TABLE IF NOT EXISTS group_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES research_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'co-leader', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  accepted_invite BOOLEAN DEFAULT FALSE,
  UNIQUE(group_id, user_id)
);

-- Group invitations table
CREATE TABLE IF NOT EXISTS group_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES research_groups(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days'
);

-- Group communications table
CREATE TABLE IF NOT EXISTS group_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES research_groups(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'message' CHECK (message_type IN ('message', 'announcement', 'task_update', 'document_share')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group tasks table
CREATE TABLE IF NOT EXISTS group_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES research_groups(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'completed', 'cancelled')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Group documents table
CREATE TABLE IF NOT EXISTS group_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES research_groups(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type VARCHAR(50),
  size INTEGER,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_research_groups_created_by ON research_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group_user ON group_memberships(group_id, user_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user ON group_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_group_invitations_group ON group_invitations(group_id);
CREATE INDEX IF NOT EXISTS idx_group_invitations_email ON group_invitations(email);
CREATE INDEX IF NOT EXISTS idx_group_communications_group ON group_communications(group_id);
CREATE INDEX IF NOT EXISTS idx_group_tasks_group ON group_tasks(group_id);
CREATE INDEX IF NOT EXISTS idx_group_documents_group ON group_documents(group_id);

-- Enable Row Level Security
ALTER TABLE research_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_documents ENABLE ROW LEVEL SECURITY;

-- Policies for research_groups
CREATE POLICY "Users can view their own research groups" ON research_groups
  FOR SELECT TO authenticated
  USING (
    auth.uid() = created_by OR
    id IN (
      SELECT group_id FROM group_memberships
      WHERE user_id = auth.uid() AND accepted_invite = true
    )
  );

CREATE POLICY "Users can insert their own research groups" ON research_groups
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group leaders can update their groups" ON research_groups
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = created_by OR
    id IN (
      SELECT group_id FROM group_memberships
      WHERE user_id = auth.uid() AND role IN ('leader', 'co-leader')
    )
  );

CREATE POLICY "Group leaders can delete their groups" ON research_groups
  FOR DELETE TO authenticated
  USING (
    auth.uid() = created_by OR
    id IN (
      SELECT group_id FROM group_memberships
      WHERE user_id = auth.uid() AND role = 'leader'
    )
  );

-- Policies for group_memberships
CREATE POLICY "Members can view group memberships" ON group_memberships
  FOR SELECT TO authenticated
  USING (
    group_id IN (
      SELECT id FROM research_groups WHERE created_by = auth.uid()
    ) OR
    group_id IN (
      SELECT group_id FROM group_memberships gm2
      WHERE gm2.user_id = auth.uid() AND gm2.accepted_invite = true
    )
  );

CREATE POLICY "Group leaders can manage memberships" ON group_memberships
  FOR ALL TO authenticated
  USING (
    group_id IN (
      SELECT id FROM research_groups WHERE created_by = auth.uid()
    ) OR
    group_id IN (
      SELECT group_id FROM group_memberships gm2
      WHERE gm2.user_id = auth.uid() AND gm2.role IN ('leader', 'co-leader')
    )
  );

-- Policies for group_invitations
CREATE POLICY "Group leaders can manage invitations" ON group_invitations
  FOR ALL TO authenticated
  USING (
    group_id IN (
      SELECT id FROM research_groups WHERE created_by = auth.uid()
    ) OR
    group_id IN (
      SELECT group_id FROM group_memberships
      WHERE user_id = auth.uid() AND role IN ('leader', 'co-leader')
    )
  );

CREATE POLICY "Users can view and respond to their own invitations" ON group_invitations
  FOR SELECT TO authenticated
  USING (auth.uid() = invited_by OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Policies for group_communications
CREATE POLICY "Group members can view communications" ON group_communications
  FOR SELECT TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM group_memberships
      WHERE user_id = auth.uid() AND accepted_invite = true
    )
  );

CREATE POLICY "Group members can insert communications" ON group_communications
  FOR INSERT TO authenticated
  WITH CHECK (
    group_id IN (
      SELECT group_id FROM group_memberships
      WHERE user_id = auth.uid() AND accepted_invite = true
    ) AND auth.uid() = sender_id
  );

-- Policies for group_tasks
CREATE POLICY "Group members can view tasks" ON group_tasks
  FOR SELECT TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM group_memberships
      WHERE user_id = auth.uid() AND accepted_invite = true
    )
  );

CREATE POLICY "Group members can manage tasks" ON group_tasks
  FOR ALL TO authenticated
  USING (
    (group_id IN (
      SELECT group_id FROM group_memberships
      WHERE user_id = auth.uid() AND accepted_invite = true AND role IN ('leader', 'co-leader')
    )) OR
    auth.uid() = assigned_to OR auth.uid() = assigned_by
  );

-- Policies for group_documents
CREATE POLICY "Group members can view documents" ON group_documents
  FOR SELECT TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM group_memberships
      WHERE user_id = auth.uid() AND accepted_invite = true
    )
  );

CREATE POLICY "Group members can manage documents" ON group_documents
  FOR ALL TO authenticated
  USING (
    (group_id IN (
      SELECT group_id FROM group_memberships
      WHERE user_id = auth.uid() AND accepted_invite = true
    ) AND auth.uid() = uploaded_by) OR
    group_id IN (
      SELECT group_id FROM group_memberships
      WHERE user_id = auth.uid() AND role IN ('leader', 'co-leader')
    )
  );