-- Add indexes to optimize queries for the notification bell component

-- Indexes for notifications table (only add if columns exist)
DO $$
BEGIN
  -- Only create these indexes if the columns exist
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'user_id') THEN
    CREATE INDEX IF NOT EXISTS idx_notifications_user_created_at ON notifications (user_id, created_at DESC);
  END IF;

  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'read_at') THEN
    CREATE INDEX IF NOT EXISTS idx_notifications_user_is_read ON notifications (user_id, (read_at IS NULL)) WHERE read_at IS NULL;
  END IF;
END $$;

-- Indexes for advisor_student_messages table
CREATE INDEX IF NOT EXISTS idx_advisor_student_messages_recipient_created_at ON advisor_student_messages (recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_advisor_student_messages_recipient_is_read ON advisor_student_messages (recipient_id, is_read) WHERE is_read = false; -- For unread messages

-- Indexes for general messages table
CREATE INDEX IF NOT EXISTS idx_messages_recipient_created_at ON messages (recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_is_read ON messages (recipient_id, is_read) WHERE is_read = false; -- For unread messages