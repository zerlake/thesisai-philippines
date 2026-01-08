-- Update demo users to have premium access for development/testing
-- This ensures admin/developer users can access all premium features

-- Update all demo users to have premium plan and appropriate roles
-- This includes all fields checked by the premium access logic
-- Admin users get access to all premium features for development/testing purposes
UPDATE profiles 
SET 
    role = CASE 
        WHEN email ILIKE '%demo-admin%' THEN 'admin'
        WHEN email ILIKE '%admin%' AND email NOT ILIKE '%demo%' THEN 'admin'  -- Non-demo admin accounts
        WHEN email ILIKE '%advisor%' OR email ILIKE '%demo-advisor%' THEN 'advisor'
        WHEN email ILIKE '%critic%' THEN 'critic'
        ELSE 'user'  -- Set to user for demo users that don't match other patterns
    END,
    plan = 'premium',
    plan_type = 'premium',
    subscription_status = 'active',
    is_pro_user = true,
    updated_at = NOW()
WHERE 
    email ILIKE '%demo%' 
    OR email ILIKE '%admin%' 
    OR email ILIKE '%advisor%' 
    OR email ILIKE '%critic%';

-- Verify the changes
SELECT 
    id,
    email,
    role,
    plan,
    plan_type,
    subscription_status,
    is_pro_user,
    updated_at
FROM profiles
WHERE 
    email ILIKE '%demo%' 
    OR email ILIKE '%admin%' 
    OR email ILIKE '%advisor%' 
    OR email ILIKE '%critic%'
ORDER BY role, email;