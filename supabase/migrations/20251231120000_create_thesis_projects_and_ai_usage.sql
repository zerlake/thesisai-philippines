-- Migration: Create thesis_projects and ai_tool_usage tables for system analytics
-- Created: 2025-12-31
-- Purpose: Add missing tables required for admin system analytics dashboard

-- 1. Create thesis_projects table
CREATE TABLE IF NOT EXISTS thesis_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  advisor_id UUID,  -- Nullable UUID, can reference advisors table when it exists
  title TEXT NOT NULL,
  subtitle TEXT,
  abstract TEXT,
  keywords TEXT[],
  language TEXT DEFAULT 'en',
  status TEXT CHECK (status IN ('initiated', 'draft', 'in_review', 'in_progress', 'revisions', 'approved', 'submitted', 'published', 'archived')) DEFAULT 'initiated',
  academic_year TEXT,
  semester TEXT CHECK (semester IN ('1st', '2nd', 'summer')),
  defense_date DATE,
  defense_result TEXT CHECK (defense_result IN ('passed', 'passed_with_revisions', 'failed', 'postponed')),
  grade NUMERIC(4,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  defense_scheduled_at TIMESTAMP WITH TIME ZONE
);

-- 2. Create ai_tool_usage table
CREATE TABLE IF NOT EXISTS ai_tool_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  tool_name TEXT NOT NULL,
  action_type TEXT CHECK (action_type IN ('create', 'modify', 'analyze', 'suggest', 'generate', 'summarize', 'translate', 'other')),
  input_data JSONB,
  output_data JSONB,
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  cost_credits DECIMAL(10,2) DEFAULT 0.00,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Row Level Security
ALTER TABLE thesis_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tool_usage ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for thesis_projects
-- Allow users to view their own projects
CREATE POLICY "Users can view own thesis projects"
  ON thesis_projects FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to create their own projects
CREATE POLICY "Users can create own thesis projects"
  ON thesis_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own projects
CREATE POLICY "Users can update own thesis projects"
  ON thesis_projects FOR UPDATE
  USING (auth.uid() = user_id);

-- Note: Advisor policy will be added when advisors table is created
-- Allow advisors to view their assigned projects (requires advisors table)
-- CREATE POLICY "Advisors can view assigned projects"
--   ON thesis_projects FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM advisors
--       WHERE advisors.profile_id = auth.uid()
--       AND advisors.id = thesis_projects.advisor_id
--     )
--   );

-- Allow admins to view all projects
CREATE POLICY "Admins can view all projects"
  ON thesis_projects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 5. Create RLS Policies for ai_tool_usage
-- Allow users to view their own usage
CREATE POLICY "Users can view own AI tool usage"
  ON ai_tool_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own usage records
CREATE POLICY "Users can insert own AI tool usage"
  ON ai_tool_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow admins to view all usage
CREATE POLICY "Admins can view all AI tool usage"
  ON ai_tool_usage FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS thesis_projects_user_id_idx ON thesis_projects(user_id);
CREATE INDEX IF NOT EXISTS thesis_projects_advisor_id_idx ON thesis_projects(advisor_id);
CREATE INDEX IF NOT EXISTS thesis_projects_status_idx ON thesis_projects(status);
CREATE INDEX IF NOT EXISTS thesis_projects_created_at_idx ON thesis_projects(created_at DESC);

CREATE INDEX IF NOT EXISTS ai_tool_usage_user_id_idx ON ai_tool_usage(user_id);
CREATE INDEX IF NOT EXISTS ai_tool_usage_tool_name_idx ON ai_tool_usage(tool_name);
CREATE INDEX IF NOT EXISTS ai_tool_usage_created_at_idx ON ai_tool_usage(created_at DESC);

-- 7. Add comments for documentation
COMMENT ON TABLE thesis_projects IS 'Stores thesis project information for students';
COMMENT ON TABLE ai_tool_usage IS 'Tracks AI tool usage for analytics and billing';
