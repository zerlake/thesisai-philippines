-- Add sample notifications for testing if the table exists and is empty
-- Only run if the 'title' column exists (new schema)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications')
  AND NOT EXISTS (SELECT FROM notifications LIMIT 1)
  AND EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'title') THEN

    -- Insert sample notification for testing
    INSERT INTO notifications (
      user_id,
      title,
      message,
      notification_type,
      priority,
      channels,
      read_at
    )
    SELECT
      id,
      'Welcome to ThesisAI',
      'Thank you for joining our platform. Check out the documentation to get started!',
      'system',
      1,
      '{in_app}',
      NULL
    FROM auth.users
    LIMIT 1;

    INSERT INTO notifications (
      user_id,
      title,
      message,
      notification_type,
      priority,
      channels,
      read_at
    )
    SELECT
      id,
      'New Feature Available',
      'We have launched a new AI writing assistant. Try it out in your dashboard!',
      'feature',
      2,
      '{in_app}',
      NULL
    FROM auth.users
    LIMIT 1;

  END IF;
END $$;
