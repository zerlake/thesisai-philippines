-- Add proper RLS policies for messages tables to ensure they work with the notification bell

-- Drop existing policies if they exist for messages table
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON messages;

-- Make sure RLS is enabled on the messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for messages table
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE TO authenticated
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete own messages" ON messages
  FOR DELETE TO authenticated
  USING (auth.uid() = sender_id);

-- Drop existing policies if they exist for advisor_student_messages table
DROP POLICY IF EXISTS "Users can view their messages" ON advisor_student_messages;
DROP POLICY IF EXISTS "Users can send advisor_student messages" ON advisor_student_messages;
DROP POLICY IF EXISTS "Users can update their advisor_student messages" ON advisor_student_messages;

-- Make sure RLS is enabled on the advisor_student_messages table
ALTER TABLE advisor_student_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for advisor_student_messages table
CREATE POLICY "Users can view their messages" ON advisor_student_messages
  FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send advisor_student messages" ON advisor_student_messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their advisor_student messages" ON advisor_student_messages
  FOR UPDATE TO authenticated
  USING (auth.uid() = sender_id);

-- Drop existing policies if they exist for notifications table
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

-- Make sure RLS is enabled on the notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications table
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);