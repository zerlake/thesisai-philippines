-- Populate profile names from auth.user_metadata where available
-- This is safe to run multiple times as it only updates NULL values

-- Update first_name from user_metadata if it's not already set and user_metadata exists
UPDATE public.profiles 
SET first_name = CASE 
    WHEN au.raw_user_meta_data->>'first_name' IS NOT NULL 
    THEN au.raw_user_meta_data->>'first_name'
    WHEN au.raw_user_meta_data->>'given_name' IS NOT NULL 
    THEN au.raw_user_meta_data->>'given_name'
    WHEN au.raw_user_meta_data->>'name' IS NOT NULL 
    THEN SPLIT_PART(au.raw_user_meta_data->>'name', ' ', 1)
    ELSE first_name 
END
FROM auth.users au
WHERE profiles.id = au.id
AND profiles.first_name IS NULL
AND au.raw_user_meta_data IS NOT NULL;

-- Update last_name from user_metadata if it's not already set and user_metadata exists
UPDATE public.profiles 
SET last_name = CASE 
    WHEN au.raw_user_meta_data->>'last_name' IS NOT NULL 
    THEN au.raw_user_meta_data->>'last_name'
    WHEN au.raw_user_meta_data->>'family_name' IS NOT NULL 
    THEN au.raw_user_meta_data->>'family_name'
    WHEN au.raw_user_meta_data->>'name' IS NOT NULL 
    THEN TRIM(LEFT(au.raw_user_meta_data->>'name', LENGTH(SPLIT_PART(au.raw_user_meta_data->>'name', ' ', 1))))
    ELSE last_name 
END
FROM auth.users au
WHERE profiles.id = au.id
AND profiles.last_name IS NULL
AND au.raw_user_meta_data IS NOT NULL
AND au.raw_user_meta_data->>'name' IS NOT NULL
AND SPLIT_PART(au.raw_user_meta_data->>'name', ' ', 1) != au.raw_user_meta_data->>'name';

-- Verify the results
SELECT 
    'Summary: Profile names update completed' as status,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN first_name IS NOT NULL THEN 1 END) as profiles_with_first_name,
    COUNT(CASE WHEN last_name IS NOT NULL THEN 1 END) as profiles_with_last_name
FROM public.profiles;