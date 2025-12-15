-- Fix RLS policies on profiles table - set roles to {authenticated} instead of {public}

DROP POLICY IF EXISTS "authenticated_can_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "authenticated_can_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "allow_profile_access_for_institution_requests" ON public.profiles;

-- Create SELECT policy for authenticated users to view their own profile
CREATE POLICY "authenticated_can_view_own_profile" ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Create UPDATE policy for authenticated users to update their own profile
CREATE POLICY "authenticated_can_update_own_profile" ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Create SELECT policy for authenticated users to view profiles related to institution requests
CREATE POLICY "allow_profile_access_for_institution_requests" ON public.profiles FOR SELECT TO authenticated
USING (
  auth.uid() = id 
  OR EXISTS (
    SELECT 1 FROM public.institution_requests 
    WHERE institution_requests.requested_by = profiles.id
  )
);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, roles FROM pg_policies WHERE tablename = 'profiles' ORDER BY policyname;
