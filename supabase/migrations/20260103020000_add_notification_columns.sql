-- Add missing columns to notifications table to support the notification bell
-- This migration adds the columns that are expected by the notification-bell component

-- Add title column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'title') THEN
    ALTER TABLE notifications ADD COLUMN title VARCHAR(255);
    RAISE NOTICE 'Added title column to notifications';
  ELSE
    RAISE NOTICE 'title column already exists';
  END IF;
END $$;

-- Add notification_type column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'notification_type') THEN
    ALTER TABLE notifications ADD COLUMN notification_type VARCHAR(50) DEFAULT 'system';
    RAISE NOTICE 'Added notification_type column to notifications';
  ELSE
    RAISE NOTICE 'notification_type column already exists';
  END IF;
END $$;

-- Add priority column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'priority') THEN
    ALTER TABLE notifications ADD COLUMN priority NUMERIC(1,0) DEFAULT 1;
    RAISE NOTICE 'Added priority column to notifications';
  ELSE
    RAISE NOTICE 'priority column already exists';
  END IF;
END $$;

-- Add channels column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'channels') THEN
    ALTER TABLE notifications ADD COLUMN channels TEXT[] DEFAULT '{in_app}';
    RAISE NOTICE 'Added channels column to notifications';
  ELSE
    RAISE NOTICE 'channels column already exists';
  END IF;
END $$;

-- Add data column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'data') THEN
    ALTER TABLE notifications ADD COLUMN data JSONB DEFAULT '{}';
    RAISE NOTICE 'Added data column to notifications';
  ELSE
    RAISE NOTICE 'data column already exists';
  END IF;
END $$;

-- Add delivered_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'delivered_at') THEN
    ALTER TABLE notifications ADD COLUMN delivered_at TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'Added delivered_at column to notifications';
  ELSE
    RAISE NOTICE 'delivered_at column already exists';
  END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'updated_at') THEN
    ALTER TABLE notifications ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE 'Added updated_at column to notifications';
  ELSE
    RAISE NOTICE 'updated_at column already exists';
  END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;
