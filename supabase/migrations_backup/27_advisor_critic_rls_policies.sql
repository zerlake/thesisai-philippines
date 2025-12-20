-- Enable RLS for advisor_student_relationships table
CREATE TABLE IF NOT EXISTS public.advisor_student_relationships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    advisor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    UNIQUE(advisor_id, student_id)
);

-- Enable RLS for advisor_student_relationships
ALTER TABLE public.advisor_student_relationships ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own advisor relationships (as student)
CREATE POLICY "Users can view their own advisor relationships as students" ON public.advisor_student_relationships
FOR SELECT TO authenticated
USING (auth.uid() = student_id OR auth.uid() = advisor_id);

-- Policy: Advisors can view their student relationships
CREATE POLICY "Advisors can view their student relationships" ON public.advisor_student_relationships
FOR SELECT TO authenticated
USING (auth.uid() = advisor_id);

-- Policy: Students can view their advisor relationships  
CREATE POLICY "Students can view their advisor relationships" ON public.advisor_student_relationships
FOR SELECT TO authenticated
USING (auth.uid() = student_id);

-- Policy: Students can insert their own advisor relationships (only via functions)
CREATE POLICY "Students can insert advisor relationships" ON public.advisor_student_relationships
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = student_id);

-- Policy: Students can delete their own advisor relationships
CREATE POLICY "Students can delete their advisor relationships" ON public.advisor_student_relationships
FOR DELETE TO authenticated
USING (auth.uid() = student_id);

-- Enable RLS for critic_student_relationships table
CREATE TABLE IF NOT EXISTS public.critic_student_relationships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    critic_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    UNIQUE(critic_id, student_id)
);

-- Enable RLS for critic_student_relationships
ALTER TABLE public.critic_student_relationships ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own critic relationships (as student)
CREATE POLICY "Users can view their own critic relationships as students" ON public.critic_student_relationships
FOR SELECT TO authenticated
USING (auth.uid() = student_id OR auth.uid() = critic_id);

-- Policy: Critics can view their student relationships
CREATE POLICY "Critics can view their student relationships" ON public.critic_student_relationships
FOR SELECT TO authenticated
USING (auth.uid() = critic_id);

-- Policy: Students can view their critic relationships  
CREATE POLICY "Students can view their critic relationships" ON public.critic_student_relationships
FOR SELECT TO authenticated
USING (auth.uid() = student_id);

-- Policy: Students can insert their own critic relationships (only via functions)
CREATE POLICY "Students can insert critic relationships" ON public.critic_student_relationships
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = student_id);

-- Policy: Students can delete their own critic relationships
CREATE POLICY "Students can delete their critic relationships" ON public.critic_student_relationships
FOR DELETE TO authenticated
USING (auth.uid() = student_id);

-- Enable RLS for advisor_requests table
CREATE TABLE IF NOT EXISTS public.advisor_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    advisor_email TEXT,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
    request_token TEXT
);

-- Enable RLS for advisor_requests
ALTER TABLE public.advisor_requests ENABLE ROW LEVEL SECURITY;

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
CREATE TABLE IF NOT EXISTS public.critic_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    critic_email TEXT,
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
    request_token TEXT
);

-- Enable RLS for critic_requests
ALTER TABLE public.critic_requests ENABLE ROW LEVEL SECURITY;

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