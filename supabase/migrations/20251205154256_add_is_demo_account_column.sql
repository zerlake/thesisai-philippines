-- Add is_demo_account column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'is_demo_account'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_demo_account BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_profiles_is_demo ON profiles(is_demo_account);
