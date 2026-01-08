-- Setup demo advisor-student relationship and sample messages
-- This migration creates sample messages between demo-student and demo-advisor

-- Demo user IDs
DO $$
DECLARE
  v_student_id uuid := '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7'::uuid;
  v_advisor_id uuid := 'ff79d401-5614-4de8-9f17-bc920f360dcf'::uuid;
  v_sample_doc_id uuid;
BEGIN

  -- First, ensure advisor_student_relationships table exists
  -- (This may already exist from other migrations)
  CREATE TABLE IF NOT EXISTS advisor_student_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advisor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(advisor_id, student_id)
  );

  -- Create index if needed
  CREATE INDEX IF NOT EXISTS idx_advisor_student_relationships_advisor 
    ON advisor_student_relationships(advisor_id);
  CREATE INDEX IF NOT EXISTS idx_advisor_student_relationships_student 
    ON advisor_student_relationships(student_id);

  -- Create the relationship between demo-advisor and demo-student
  INSERT INTO advisor_student_relationships (advisor_id, student_id, status)
  VALUES (v_advisor_id, v_student_id, 'active')
  ON CONFLICT (advisor_id, student_id) DO UPDATE SET status = 'active';

  RAISE NOTICE 'Created/updated advisor-student relationship between demo users';

  -- Create a sample Final Draft for Submission document
  INSERT INTO documents (id, user_id, title, content, status, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    v_student_id,
    'Thesis Finalizer Pro +',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"This is a sample final draft submitted for review. The student has submitted this to their advisor for feedback and final approval."}]}]}',
    'pending_review',
    NOW(),
    NOW()
  )
  RETURNING id INTO v_sample_doc_id;

  -- Create sample messages in advisor_student_messages
  -- Message 1: Student submitting draft
  INSERT INTO advisor_student_messages (
    document_id,
    sender_id,
    sender_role,
    recipient_id,
    message,
    subject,
    is_read,
    created_at
  )
  VALUES (
    v_sample_doc_id,
    v_student_id,
    'student',
    v_advisor_id,
    'I have completed my final draft and am submitting it for your review. Please provide feedback on the structure, argument clarity, and any areas that need revision.',
    'Final Draft Submission',
    false,
    NOW() - INTERVAL '2 hours'
  );

  -- Message 2: Advisor acknowledging receipt
  INSERT INTO advisor_student_messages (
    document_id,
    sender_id,
    sender_role,
    recipient_id,
    message,
    subject,
    is_read,
    created_at
  )
  VALUES (
    v_sample_doc_id,
    v_advisor_id,
    'advisor',
    v_student_id,
    'Thank you for submitting your draft. I have received it and will review it carefully. I will provide detailed feedback within the next 24-48 hours. In the meantime, if you have any questions, please feel free to reach out.',
    'RE: Final Draft Submission',
    false,
    NOW() - INTERVAL '1.5 hours'
  );

  -- Message 3: Advisor providing feedback
  INSERT INTO advisor_student_messages (
    document_id,
    sender_id,
    sender_role,
    recipient_id,
    message,
    subject,
    is_read,
    created_at
  )
  VALUES (
    v_sample_doc_id,
    v_advisor_id,
    'advisor',
    v_student_id,
    'I have completed my initial review. Overall, the draft is well-structured with strong arguments. I have identified a few areas for improvement: (1) the introduction could better establish the research gap, (2) some citations need to be updated with more recent publications, and (3) the conclusion should more explicitly discuss implications for future research. Please revise these sections and resubmit.',
    'Draft Review - Initial Feedback',
    false,
    NOW() - INTERVAL '30 minutes'
  );

  -- Message 4: Student responding to feedback
  INSERT INTO advisor_student_messages (
    document_id,
    sender_id,
    sender_role,
    recipient_id,
    message,
    subject,
    is_read,
    created_at
  )
  VALUES (
    v_sample_doc_id,
    v_student_id,
    'student',
    v_advisor_id,
    'Thank you for the thorough feedback. I appreciate the detailed comments. I will revise the introduction to better establish the research gap, update the citations with more recent publications, and strengthen the implications discussion in the conclusion. I will resubmit the revised draft within the next 48 hours.',
    'RE: Draft Review - Initial Feedback',
    false,
    NOW() - INTERVAL '15 minutes'
  );

  RAISE NOTICE 'Created sample document and messaging conversation between demo-student and demo-advisor';

END $$;

-- Enable RLS on advisor_student_relationships if needed
ALTER TABLE advisor_student_relationships ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for advisor_student_relationships
DROP POLICY IF EXISTS "Users can view their relationships" ON advisor_student_relationships;
DROP POLICY IF EXISTS "Advisors can manage their relationships" ON advisor_student_relationships;

CREATE POLICY "Users can view their relationships" ON advisor_student_relationships
  FOR SELECT TO authenticated
  USING (auth.uid() = advisor_id OR auth.uid() = student_id);

CREATE POLICY "Advisors can manage their relationships" ON advisor_student_relationships
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = advisor_id);
