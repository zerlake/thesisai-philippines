-- ============================================================================
-- Migration: Add Dashboard Notification Preferences to Profiles Table
-- Date: January 6, 2025
-- Purpose: Enable users to control email notification preferences for dashboards
-- ============================================================================

-- Add dashboard_notifications column to profiles table
-- This column stores JSON configuration for notification preferences
-- Default: All notification types enabled
ALTER TABLE profiles 
ADD COLUMN dashboard_notifications JSONB DEFAULT '{
  "enabled": true,
  "emailOnSubmission": true,
  "emailOnFeedback": true,
  "emailOnMilestone": true,
  "emailOnGroupActivity": true
}'::jsonb;

-- ============================================================================
-- Create GIN index for efficient JSONB queries
-- This improves performance when querying notification preferences
-- ============================================================================

CREATE INDEX idx_profiles_dashboard_notifications ON profiles USING GIN (dashboard_notifications);

-- ============================================================================
-- Add comment to document the column purpose
-- ============================================================================

COMMENT ON COLUMN profiles.dashboard_notifications IS 'JSON configuration for email notifications across dashboards (student, advisor, critic, group-leader). Default: all notifications enabled. Structure: { "enabled": boolean, "emailOnSubmission": boolean, "emailOnFeedback": boolean, "emailOnMilestone": boolean, "emailOnGroupActivity": boolean }';

-- ============================================================================
-- End of Migration
-- ============================================================================
