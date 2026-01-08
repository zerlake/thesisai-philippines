-- Add performance indexes for messages tables
-- Messages with sender and recipient
CREATE INDEX IF NOT EXISTS idx_messages_sender_recipient ON messages (sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_read ON messages (recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_messages_thread_created_at ON messages (thread_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread_only ON messages (recipient_id, created_at DESC) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_messages_unread_by_sender ON messages (recipient_id, sender_id) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_messages_priority_thread ON messages (priority, thread_id) WHERE thread_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_brin ON messages USING brin(created_at) WITH (pages_per_range = 32);
CREATE INDEX IF NOT EXISTS idx_messages_sender_fkey ON messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_fkey ON messages (recipient_id);

-- Advisor-student messages indexes
CREATE INDEX IF NOT EXISTS idx_advisor_student_messages_sender_name ON advisor_student_messages(sender_role);