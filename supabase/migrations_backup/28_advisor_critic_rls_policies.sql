-- Add RLS policies to existing advisor/critic tables
-- This migration adds RLS policies without recreating existing tables

-- Enable RLS for existing advisor_student_relationships table (if it exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'advisor_student_relationships') THEN
    ALTER TABLE public.advisor_student_relationships ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist to avoid conflicts
    DROP POLICY IF EXISTS "Users can view their own advisor relationships as students" ON public.advisor_student_relationships;
    DROP POLICY IF EXISTS "Advisors can view their student relationships" ON public.advisor_student_relationships;
    DROP POLICY IF EXISTS "Students can view their advisor relationships" ON public.advisor_student_relationships;
    DROP POLICY IF EXISTS "Students can insert advisor relationships" ON public.advisor_student_relationships;
    DROP POLICY IF EXISTS "Students can delete their advisor relationships" ON public.advisor_student_relationships;

    -- Policy: Users can view their own advisor relationships (as student)
    CREATE POLICY "Users can view their own advisor relationships as students" ON public.advisor_student_relationships
    FOR SELECT TO authenticated
    USING (auth.uid() = student_id OR auth.uid() = advisor_id);

    -- Policy: Students can view their advisor relationships  
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
  END IF;
END $$;

-- Enable RLS for existing critic_student_relationships table (if it exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'critic_student_relationships') THEN
    ALTER TABLE public.critic_student_relationships ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist to avoid conflicts
    DROP POLICY IF EXISTS "Users can view their own critic relationships as students" ON public.critic_student_relationships;
    DROP POLICY IF EXISTS "Critics can view their student relationships" ON public.critic_student_relationships;
    DROP POLICY IF EXISTS "Students can view their critic relationships" ON public.critic_student_relationships;
    DROP POLICY IF EXISTS "Students can insert critic relationships" ON public.critic_student_relationships;
    DROP POLICY IF EXISTS "Students can delete their critic relationships" ON public.critic_student_relationships;

    -- Policy: Users can view their own critic relationships (as student)
    CREATE POLICY "Users can view their own critic relationships as students" ON public.critic_student_relationships
    FOR SELECT TO authenticated
    USING (auth.uid() = student_id OR auth.uid() = critic_id);

    -- Policy: Students can view their critic relationships  
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
  END IF;
END $$;

-- Enable RLS for existing advisor_requests table (if it exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'advisor_requests') THEN
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
  END IF;
END $$;

-- Enable RLS for existing critic_requests table (if it exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'critic_requests') THEN
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
  END IF;
END $$;