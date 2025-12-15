-- Advisor-Student messages table for two-way conversations
CREATE TABLE IF NOT EXISTS advisor_student_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('student', 'advisor', 'critic')),
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  subject TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_advisor_student_messages_document ON advisor_student_messages(document_id);
CREATE INDEX IF NOT EXISTS idx_advisor_student_messages_sender ON advisor_student_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_advisor_student_messages_recipient ON advisor_student_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_advisor_student_messages_created ON advisor_student_messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE advisor_student_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages where they are sender or recipient
CREATE POLICY "Users can view their messages" ON advisor_student_messages
  FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Users can insert their own messages
CREATE POLICY "Users can send messages" ON advisor_student_messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Users can update their own sent messages
CREATE POLICY "Users can update their messages" ON advisor_student_messages
  FOR UPDATE TO authenticated
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);
