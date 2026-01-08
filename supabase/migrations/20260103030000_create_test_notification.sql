-- Create test notification for notification bell verification
-- Note: The existing notifications table has a different column structure
DO $$
DECLARE
  test_user_id UUID;
  test_notif_id UUID;
BEGIN
  -- Get first demo user
  SELECT id INTO test_user_id
  FROM profiles
  WHERE is_demo_account = true
  LIMIT 1;

  -- If no demo user in profiles, try auth.users
  IF test_user_id IS NULL THEN
    SELECT id INTO test_user_id
    FROM auth.users
    LIMIT 1;
  END IF;

  -- Create test notification - use the actual column names that exist
  IF test_user_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, notification_type, priority, channels, data)
    VALUES (
      test_user_id,
      'info',
      'Test Notification - Bell Working',
      'Test notification created at ' || NOW()::text || '. This verifies the notification bell is working correctly!',
      'system',
      2,
      ARRAY['in_app'],
      '{"test": true}'::jsonb
    )
    RETURNING id INTO test_notif_id;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'Test notification created successfully!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Notification ID: %', test_notif_id;
    RAISE NOTICE 'User ID: %', test_user_id;
  ELSE
    RAISE NOTICE 'No users found to create notification for';
  END IF;
END $$;
