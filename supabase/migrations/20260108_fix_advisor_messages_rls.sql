-- Fix RLS policies for advisor_student_messages to allow service role and demo users
-- The service role key is used by the API to insert messages on behalf of demo users

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their messages" ON advisor_student_messages;
DROP POLICY IF EXISTS "Users can send messages" ON advisor_student_messages;
DROP POLICY IF EXISTS "Authenticated users can send messages" ON advisor_student_messages;
DROP POLICY IF EXISTS "Users can update their messages" ON advisor_student_messages;
DROP POLICY IF EXISTS "Service role can insert messages" ON advisor_student_messages;

-- Users can view messages where they are sender or recipient
CREATE POLICY "Users can view their messages" ON advisor_student_messages
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Users can insert their own messages (authenticated users)
CREATE POLICY "Authenticated users can send messages" ON advisor_student_messages
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Allow service role to insert (bypasses RLS entirely, which is what we want for the API)
-- Service role is only used server-side in the API
CREATE POLICY "Service role can insert messages" ON advisor_student_messages
  FOR INSERT 
  TO service_role
  WITH CHECK (true);

-- Users can update their own sent messages
CREATE POLICY "Users can update their messages" ON advisor_student_messages
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);
