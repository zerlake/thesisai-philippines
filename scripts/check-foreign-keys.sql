-- Check if the foreign key constraint is correct
-- The documents table should reference auth.users.id, not public.profiles.id for the user_id column

-- First, let's check the current foreign key constraint
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
WHERE 
    tc.table_name = 'documents' 
    AND tc.constraint_type = 'FOREIGN KEY';

-- If the foreign key points to profiles instead of auth.users, we may need to adjust
-- However, if your schema intentionally uses profiles as the reference, we need to ensure that:
-- 1. Every auth.user has a corresponding profile (which you've already backfilled)
-- 2. The RLS policies work correctly with this setup

-- Let's check if the user_id in documents table corresponds to existing profiles
SELECT 
    d.id as document_id,
    d.user_id as document_user_id,
    p.id as profile_id
FROM 
    public.documents d
LEFT JOIN 
    public.profiles p ON d.user_id = p.id
WHERE 
    p.id IS NULL
LIMIT 5;

-- If any rows are returned, it means there are documents with user_id values that don't exist in profiles table
-- In your case, since you backfilled all profiles, this should return no rows