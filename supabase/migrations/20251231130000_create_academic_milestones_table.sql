-- Create academic_milestones table
-- Created: 2025-12-31
-- Purpose: Store academic milestones for students to track progress and deadlines

CREATE TABLE IF NOT EXISTS academic_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance on user_id
CREATE INDEX IF NOT EXISTS idx_academic_milestones_user_id ON academic_milestones(user_id);

-- Create index for filtering by completion status
CREATE INDEX IF NOT EXISTS idx_academic_milestones_completed ON academic_milestones(completed);

-- Create index for filtering by target date (common for finding overdue milestones)
CREATE INDEX IF NOT EXISTS idx_academic_milestones_target_date ON academic_milestones(target_date);

-- Create index for filtering by completion date
CREATE INDEX IF NOT EXISTS idx_academic_milestones_completed_at ON academic_milestones(completed_at);

-- Create trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_academic_milestones_updated_at
  BEFORE UPDATE ON academic_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
CREATE POLICY "Users can view their own milestones" ON academic_milestones
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own milestones" ON academic_milestones
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own milestones" ON academic_milestones
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own milestones" ON academic_milestones
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON academic_milestones TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;