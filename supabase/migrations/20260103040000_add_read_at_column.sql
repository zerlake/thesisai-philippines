-- Add read_at column to notifications if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'read_at') THEN
    ALTER TABLE notifications ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'Added read_at column to notifications';
  ELSE
    RAISE NOTICE 'read_at column already exists';
  END IF;
END $$;

-- Verify the notification was created
SELECT id, user_id, title, message, type, notification_type, priority, created_at
FROM notifications
ORDER BY created_at DESC
LIMIT 5;
