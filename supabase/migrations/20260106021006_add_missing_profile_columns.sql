-- Add missing columns to the profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS is_pro_user BOOLEAN DEFAULT FALSE;
