# Supabase RLS Policies for Advisor/Critic Tables

This file contains the SQL commands needed to set up Row Level Security (RLS) policies for advisor and critic related tables in Supabase. These policies will resolve 403 errors by allowing users to access their own records.

## Tables Covered:
- `advisor_student_relationships`
- `critic_student_relationships` 
- `advisor_requests`
- `critic_requests`

## SQL Commands:

```sql
-- Enable RLS for existing advisor_student_relationships table and set policies
ALTER TABLE public.advisor_student_relationships ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
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

-- Enable RLS for existing critic_student_relationships table and set policies
ALTER TABLE public.critic_student_relationships ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
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

-- Enable RLS for existing advisor_requests table and set policies
ALTER TABLE public.advisor_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
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

-- Enable RLS for existing critic_requests table and set policies
ALTER TABLE public.critic_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
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
```

## How to Apply:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the above SQL commands
4. Execute the query

After applying these policies, the 403 errors in the advisor/critic management tabs should be resolved, allowing users to properly access their own advisor and critic relationship data.