-- Comprehensive fix for 403 Forbidden errors in advisor/critic tables
-- This migration adds policies to allow advisors, critics, and admins to access their relationships

-- ==============================================
-- ADVISOR_STUDENT_RELATIONSHIPS POLICIES
-- ==============================================

-- Allow advisors to view relationships where they are the advisor
CREATE POLICY "Advisors can view their student relationships" ON public.advisor_student_relationships
FOR SELECT TO authenticated
USING (
  auth.uid() = advisor_id
  OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'advisor'
  )
);

-- Allow advisors to view all relationships if they're in advisor role
CREATE POLICY "Advisors can manage student assignments" ON public.advisor_student_relationships
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'advisor'
    AND (profiles.id = advisor_id OR auth.uid() = advisor_id)
  )
);

-- Allow admins full access to advisor relationships
CREATE POLICY "Admins can manage all advisor relationships" ON public.advisor_student_relationships
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ==============================================
-- CRITIC_STUDENT_RELATIONSHIPS POLICIES
-- ==============================================

-- Allow critics to view relationships where they are the critic
CREATE POLICY "Critics can view their student relationships" ON public.critic_student_relationships
FOR SELECT TO authenticated
USING (
  auth.uid() = critic_id
  OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'critic'
  )
);

-- Allow critics to manage their own student assignments
CREATE POLICY "Critics can manage student assignments" ON public.critic_student_relationships
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'critic'
    AND (profiles.id = critic_id OR auth.uid() = critic_id)
  )
);

-- Allow admins full access to critic relationships
CREATE POLICY "Admins can manage all critic relationships" ON public.critic_student_relationships
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ==============================================
-- ADVISOR_REQUESTS POLICIES
-- ==============================================

-- Allow advisors to view requests directed to them
CREATE POLICY "Advisors can view requests to them" ON public.advisor_requests
FOR SELECT TO authenticated
USING (
  advisor_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'advisor'
  )
);

-- Allow advisors to update requests directed to them
CREATE POLICY "Advisors can respond to their requests" ON public.advisor_requests
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'advisor'
    AND (email = advisor_email OR auth.uid() = student_id)
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

-- ==============================================
-- CRITIC_REQUESTS POLICIES
-- ==============================================

-- Allow critics to view requests directed to them
CREATE POLICY "Critics can view requests to them" ON public.critic_requests
FOR SELECT TO authenticated
USING (
  critic_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'critic'
  )
);

-- Allow critics to update requests directed to them
CREATE POLICY "Critics can respond to their requests" ON public.critic_requests
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'critic'
    AND (email = critic_email OR auth.uid() = student_id)
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

-- ==============================================
-- GRANT PERMISSIONS
-- ==============================================

-- Ensure authenticated users have necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.advisor_student_relationships TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.critic_student_relationships TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.advisor_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.critic_requests TO authenticated;

-- Add helpful comments
COMMENT ON POLICY "Advisors can view their student relationships" ON public.advisor_student_relationships
IS 'Allows advisors to view relationships where they are assigned as the advisor';

COMMENT ON POLICY "Admins can manage all advisor relationships" ON public.advisor_student_relationships
IS 'Allows admin users full access to manage all advisor-student relationships';

COMMENT ON POLICY "Critics can view their student relationships" ON public.critic_student_relationships
IS 'Allows critics to view relationships where they are assigned as the critic';

COMMENT ON POLICY "Admins can manage all critic relationships" ON public.critic_student_relationships
IS 'Allows admin users full access to manage all critic-student relationships';
