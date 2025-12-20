-- Writing sessions table
CREATE TABLE IF NOT EXISTS writing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  words_written INTEGER DEFAULT 0,
  focus_score INTEGER CHECK (focus_score >= 0 AND focus_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Writing goals table
CREATE TABLE IF NOT EXISTS writing_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('word_count', 'time_based', 'task_based')),
  target INTEGER NOT NULL,
  achieved INTEGER DEFAULT 0,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_writing_sessions_user_date ON writing_sessions(user_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_writing_goals_user_date ON writing_goals(user_id, created_at DESC);

-- Function to auto-complete goals
CREATE OR REPLACE FUNCTION check_goal_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.achieved >= NEW.target THEN
    NEW.completed = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_trigger 
    WHERE tgname = 'goal_completion_trigger'
  ) THEN
    CREATE TRIGGER goal_completion_trigger
    BEFORE UPDATE ON writing_goals
    FOR EACH ROW
    EXECUTE FUNCTION check_goal_completion();
  END IF;
END $$;

-- Enable Row Level Security (RLS) if needed
ALTER TABLE writing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing_goals ENABLE ROW LEVEL SECURITY;

-- Create policies to allow users to access their own data
CREATE POLICY "Users can view own writing sessions" ON writing_sessions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own writing sessions" ON writing_sessions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own writing sessions" ON writing_sessions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own writing goals" ON writing_goals
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own writing goals" ON writing_goals
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own writing goals" ON writing_goals
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);