CREATE TABLE student_wellbeing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mood TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE student_wellbeing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own wellbeing data." ON student_wellbeing
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can insert their own wellbeing data." ON student_wellbeing
  FOR INSERT WITH CHECK (auth.uid() = user_id);