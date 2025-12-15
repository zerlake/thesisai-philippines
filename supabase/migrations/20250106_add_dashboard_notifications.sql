-- Add dashboard notification preferences to profiles table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='dashboard_notifications') THEN
    ALTER TABLE profiles 
    ADD COLUMN dashboard_notifications JSONB DEFAULT '{
      "enabled": true,
      "emailOnSubmission": true,
      "emailOnFeedback": true,
      "emailOnMilestone": true,
      "emailOnGroupActivity": true
    }'::jsonb;
    
    -- Create index for better query performance
    CREATE INDEX idx_profiles_dashboard_notifications ON profiles USING GIN (dashboard_notifications);
    
    -- Add comment to explain the column
    COMMENT ON COLUMN profiles.dashboard_notifications IS 'JSON configuration for email notifications across dashboards (student, advisor, critic, group-leader)';
  END IF;
END
$$;
