CREATE TABLE student_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  milestone_name TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, milestone_name)
);

ALTER TABLE student_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own milestones." ON student_milestones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can insert their own milestones." ON student_milestones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update their own milestones." ON student_milestones
  FOR UPDATE USING (auth.uid() = user_id);