-- Comprehensive RLS policy setup for advisor/critic tables
-- This script removes all existing policies and sets up new ones

-- First, disable and re-enable RLS to reset any existing policies
ALTER TABLE public.advisor_student_relationships DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.critic_student_relationships DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.critic_requests DISABLE ROW LEVEL SECURITY;

-- Enable RLS for advisor_student_relationships table
ALTER TABLE public.advisor_student_relationships ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on this table
DROP POLICY IF EXISTS "enable_read_for_owner" ON public.advisor_student_relationships;
DROP POLICY IF EXISTS "allow_insert_for_owner" ON public.advisor_student_relationships;
DROP POLICY IF EXISTS "allow_delete_for_owner" ON public.advisor_student_relationships;
DROP POLICY IF EXISTS "Students can view their advisor relationships" ON public.advisor_student_relationships;
DROP POLICY IF EXISTS "Students can insert advisor relationships" ON public.advisor_student_relationships;
DROP POLICY IF EXISTS "Students can delete their advisor relationships" ON public.advisor_student_relationships;

-- Policy: Students can view their own advisor relationships
CREATE POLICY "Students can view their advisor relationships" ON public.advisor_student_relationships
FOR SELECT TO authenticated
USING (auth.uid() = student_id);

-- Policy: Students can insert their own advisor relationships
CREATE POLICY "Students can insert advisor relationships" ON public.advisor_student_relationships
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = student_id);

-- Policy: Students can delete their own advisor relationships
CREATE POLICY "Students can delete their advisor relationships" ON public.advisor_student_relationships
FOR DELETE TO authenticated
USING (auth.uid() = student_id);

-- Enable RLS for critic_student_relationships table
ALTER TABLE public.critic_student_relationships ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on this table
DROP POLICY IF EXISTS "enable_read_for_owner" ON public.critic_student_relationships;
DROP POLICY IF EXISTS "allow_insert_for_owner" ON public.critic_student_relationships;
DROP POLICY IF EXISTS "allow_delete_for_owner" ON public.critic_student_relationships;
DROP POLICY IF EXISTS "Students can view their critic relationships" ON public.critic_student_relationships;
DROP POLICY IF EXISTS "Students can insert critic relationships" ON public.critic_student_relationships;
DROP POLICY IF EXISTS "Students can delete their critic relationships" ON public.critic_student_relationships;

-- Policy: Students can view their own critic relationships
CREATE POLICY "Students can view their critic relationships" ON public.critic_student_relationships
FOR SELECT TO authenticated
USING (auth.uid() = student_id);

-- Policy: Students can insert their own critic relationships
CREATE POLICY "Students can insert critic relationships" ON public.critic_student_relationships
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = student_id);

-- Policy: Students can delete their own critic relationships
CREATE POLICY "Students can delete their critic relationships" ON public.critic_student_relationships
FOR DELETE TO authenticated
USING (auth.uid() = student_id);

-- Enable RLS for advisor_requests table
ALTER TABLE public.advisor_requests ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on this table
DROP POLICY IF EXISTS "enable_read_for_owner" ON public.advisor_requests;
DROP POLICY IF EXISTS "allow_insert_for_owner" ON public.advisor_requests;
DROP POLICY IF EXISTS "allow_delete_for_owner" ON public.advisor_requests;
DROP POLICY IF EXISTS "Students can view their own advisor requests" ON public.advisor_requests;
DROP POLICY IF EXISTS "Students can insert advisor requests" ON public.advisor_requests;
DROP POLICY IF EXISTS "Students can delete their own advisor requests" ON public.advisor_requests;
DROP POLICY IF EXISTS "Students can update their own advisor requests" ON public.advisor_requests;

-- Policy: Students can view their own advisor requests
CREATE POLICY "Students can view their own advisor requests" ON public.advisor_requests
FOR SELECT TO authenticated
USING (auth.uid() = student_id);

-- Policy: Students can insert advisor requests
CREATE POLICY "Students can insert advisor requests" ON public.advisor_requests
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = student_id);

-- Policy: Students can delete their own advisor requests
CREATE POLICY "Students can delete their own advisor requests" ON public.advisor_requests
FOR DELETE TO authenticated
USING (auth.uid() = student_id);

-- Policy: Students can update their own advisor requests
CREATE POLICY "Students can update their own advisor requests" ON public.advisor_requests
FOR UPDATE TO authenticated
USING (auth.uid() = student_id);

-- Enable RLS for critic_requests table
ALTER TABLE public.critic_requests ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on this table
DROP POLICY IF EXISTS "enable_read_for_owner" ON public.critic_requests;
DROP POLICY IF EXISTS "allow_insert_for_owner" ON public.critic_requests;
DROP POLICY IF EXISTS "allow_delete_for_owner" ON public.critic_requests;
DROP POLICY IF EXISTS "Students can view their own critic requests" ON public.critic_requests;
DROP POLICY IF EXISTS "Students can insert critic requests" ON public.critic_requests;
DROP POLICY IF EXISTS "Students can delete their own critic requests" ON public.critic_requests;
DROP POLICY IF EXISTS "Students can update their own critic requests" ON public.critic_requests;

-- Policy: Students can view their own critic requests
CREATE POLICY "Students can view their own critic requests" ON public.critic_requests
FOR SELECT TO authenticated
USING (auth.uid() = student_id);

-- Policy: Students can insert critic requests
CREATE POLICY "Students can insert critic requests" ON public.critic_requests
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = student_id);

-- Policy: Students can delete their own critic requests
CREATE POLICY "Students can delete their own critic requests" ON public.critic_requests
FOR DELETE TO authenticated
USING (auth.uid() = student_id);

-- Policy: Students can update their own critic requests
CREATE POLICY "Students can update their own critic requests" ON public.critic_requests
FOR UPDATE TO authenticated
USING (auth.uid() = student_id);