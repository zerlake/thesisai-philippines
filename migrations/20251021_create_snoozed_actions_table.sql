CREATE TABLE snoozed_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL,
  action_id TEXT NOT NULL, -- ID of the related feedback, milestone, or checklist item
  snoozed_until TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, action_type, action_id)
);

ALTER TABLE snoozed_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own snoozed actions." ON snoozed_actions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can insert their own snoozed actions." ON snoozed_actions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update their own snoozed actions." ON snoozed_actions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Students can delete their own snoozed actions." ON snoozed_actions
  FOR DELETE USING (auth.uid() = user_id);