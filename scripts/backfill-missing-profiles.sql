-- Backfill missing profiles for users who exist in auth.users but not in public.profiles
-- This is safe to run multiple times (idempotent)

INSERT INTO public.profiles (id, first_name, last_name, role, created_at)
SELECT 
    au.id,
    NULL as first_name,
    NULL as last_name,
    'student' as role,
    NOW() as created_at
FROM 
    auth.users au
LEFT JOIN 
    public.profiles p ON au.id = p.id
WHERE 
    p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Verify the results
SELECT 
    'Summary: Backfill completed' as status,
    (SELECT COUNT(*) FROM auth.users) as total_auth_users,
    (SELECT COUNT(*) FROM public.profiles) as total_profiles,
    (SELECT COUNT(*) FROM auth.users LEFT JOIN public.profiles ON auth.users.id = profiles.id WHERE profiles.id IS NULL) as remaining_without_profiles;