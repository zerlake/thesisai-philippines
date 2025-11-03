-- supabase/migrations/20251018120006_add_profiles_rls.sql

-- 1. Allow users to view all profiles
CREATE POLICY "Allow all users to view profiles" ON public.profiles
FOR SELECT
USING (true);

-- 2. Allow users to update their own profile
CREATE POLICY "Allow individual update for own profile" ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
