-- Add Missing Columns to Tables
-- Created: 2025-12-29
-- Purpose: Fix integration test failures by adding missing columns

-- Add additional_notes column to advisor_requests if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'advisor_requests'
    AND column_name = 'additional_notes'
  ) THEN
    ALTER TABLE advisor_requests
    ADD COLUMN additional_notes TEXT;
  END IF;

  -- Add preferred_expertise column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'advisor_requests'
    AND column_name = 'preferred_expertise'
  ) THEN
    ALTER TABLE advisor_requests
    ADD COLUMN preferred_expertise TEXT;
  END IF;
END $$;

-- Add missing columns to critic_requests if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'critic_requests'
    AND column_name = 'additional_notes'
  ) THEN
    ALTER TABLE critic_requests
    ADD COLUMN additional_notes TEXT;
  END IF;

  -- Add preferred_expertise column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'critic_requests'
    AND column_name = 'preferred_expertise'
  ) THEN
    ALTER TABLE critic_requests
    ADD COLUMN preferred_expertise TEXT;
  END IF;
END $$;
