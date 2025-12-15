-- Fix advisor_requests RLS policies to allow advisors to view their requests
-- This migration addresses the 403 Forbidden errors when advisors try to access their pending requests

-- Drop the problematic policies from migration 31 (safely)
DROP POLICY IF EXISTS "Advisors can view requests to them" ON public.advisor_requests;
DROP POLICY IF EXISTS "Advisors can respond to their requests" ON public.advisor_requests;
DROP POLICY IF EXISTS "Admins can manage all advisor requests" ON public.advisor_requests;
DROP POLICY IF EXISTS "Advisors can view their advisor requests" ON public.advisor_requests;
DROP POLICY IF EXISTS "Advisors can update their advisor requests" ON public.advisor_requests;
DROP POLICY IF EXISTS "Advisors can delete their advisor requests" ON public.advisor_requests;

-- Create corrected policies for advisor_requests

-- Allow advisors to view requests directed to them (matching by email)
CREATE POLICY "Advisors can view their advisor requests" ON public.advisor_requests
FOR SELECT TO authenticated
USING (
  advisor_email = (
    SELECT email FROM auth.users 
    WHERE id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'advisor'
  )
);

-- Allow advisors to update requests directed to them
CREATE POLICY "Advisors can update their advisor requests" ON public.advisor_requests
FOR UPDATE TO authenticated
USING (
  advisor_email = (
    SELECT email FROM auth.users 
    WHERE id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'advisor'
  )
);

-- Allow advisors to delete requests directed to them
CREATE POLICY "Advisors can delete their advisor requests" ON public.advisor_requests
FOR DELETE TO authenticated
USING (
  advisor_email = (
    SELECT email FROM auth.users 
    WHERE id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'advisor'
  )
);

-- Allow admins full access to advisor requests
CREATE POLICY "Admins can manage all advisor requests" ON public.advisor_requests
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Same fixes for critic_requests table
DROP POLICY IF EXISTS "Critics can view requests to them" ON public.critic_requests;
DROP POLICY IF EXISTS "Critics can respond to their requests" ON public.critic_requests;
DROP POLICY IF EXISTS "Admins can manage all critic requests" ON public.critic_requests;
DROP POLICY IF EXISTS "Critics can view their critic requests" ON public.critic_requests;
DROP POLICY IF EXISTS "Critics can update their critic requests" ON public.critic_requests;
DROP POLICY IF EXISTS "Critics can delete their critic requests" ON public.critic_requests;

-- Allow critics to view requests directed to them
CREATE POLICY "Critics can view their critic requests" ON public.critic_requests
FOR SELECT TO authenticated
USING (
  critic_email = (
    SELECT email FROM auth.users 
    WHERE id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'critic'
  )
);

-- Allow critics to update requests directed to them
CREATE POLICY "Critics can update their critic requests" ON public.critic_requests
FOR UPDATE TO authenticated
USING (
  critic_email = (
    SELECT email FROM auth.users 
    WHERE id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'critic'
  )
);

-- Allow critics to delete requests directed to them
CREATE POLICY "Critics can delete their critic requests" ON public.critic_requests
FOR DELETE TO authenticated
USING (
  critic_email = (
    SELECT email FROM auth.users 
    WHERE id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'critic'
  )
);

-- Allow admins full access to critic requests
CREATE POLICY "Admins can manage all critic requests" ON public.critic_requests
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Add RLS policy for profiles table to allow fetching student profiles
-- This fixes the secondary permission denied error when fetching student names
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (true);

-- Ensure these grants are in place
GRANT SELECT ON public.advisor_requests TO authenticated;
GRANT UPDATE ON public.advisor_requests TO authenticated;
GRANT DELETE ON public.advisor_requests TO authenticated;
GRANT SELECT ON public.critic_requests TO authenticated;
GRANT UPDATE ON public.critic_requests TO authenticated;
GRANT DELETE ON public.critic_requests TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;
