-- Verification queries to check the alignment between auth.users and public.profiles

-- 1) Check for auth users without a corresponding profile (should return zero rows after backfill)
SELECT au.id AS auth_user_id
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- 2) Check for profiles without a corresponding auth user (should return zero rows)
SELECT p.id AS profile_id
FROM public.profiles p
LEFT JOIN auth.users au ON au.id = p.id
WHERE au.id IS NULL;

-- 3) Count total records to confirm backfill success
SELECT 
    (SELECT COUNT(*) FROM auth.users) AS total_auth_users,
    (SELECT COUNT(*) FROM public.profiles) AS total_profiles,
    (SELECT COUNT(*) FROM public.documents) AS total_documents;

-- 4) Check a few sample records to confirm ID alignment
SELECT 
    au.id AS auth_user_id,
    p.id AS profile_id,
    CASE WHEN au.id = p.id THEN 'MATCH' ELSE 'MISMATCH' END AS id_check
FROM auth.users au
JOIN public.profiles p ON p.id = au.id
LIMIT 5;

-- 5) Check existing RLS policies on the documents table
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM 
    pg_policies 
WHERE 
    tablename = 'documents'
ORDER BY 
    policyname;