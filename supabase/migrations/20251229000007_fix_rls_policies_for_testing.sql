-- Fix RLS Policies for Testing
-- Created: 2025-12-29
-- Purpose: Add policies to allow authenticated users to perform test operations

-- Helper function to safely create policies
DO $$
BEGIN
  -- ========================================
  -- 1. Advisor-Student Relationships Policies
  -- ========================================

  -- Drop existing policies if they exist (to recreate with correct logic)
  DROP POLICY IF EXISTS "Students can create advisor relationships" ON advisor_student_relationships;
  DROP POLICY IF EXISTS "Advisors can create student relationships" ON advisor_student_relationships;
  DROP POLICY IF EXISTS "Students can view their advisor relationships" ON advisor_student_relationships;
  DROP POLICY IF EXISTS "Advisors can view their student relationships" ON advisor_student_relationships;
  DROP POLICY IF EXISTS "Students can update their advisor relationships" ON advisor_student_relationships;
  DROP POLICY IF EXISTS "Advisors can update their student relationships" ON advisor_student_relationships;

  -- Create new policies
  CREATE POLICY "Students can create advisor relationships"
    ON advisor_student_relationships FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = student_id);

  CREATE POLICY "Advisors can create student relationships"
    ON advisor_student_relationships FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = advisor_id);

  CREATE POLICY "Students can view their advisor relationships"
    ON advisor_student_relationships FOR SELECT
    TO authenticated
    USING (auth.uid() = student_id);

  CREATE POLICY "Advisors can view their student relationships"
    ON advisor_student_relationships FOR SELECT
    TO authenticated
    USING (auth.uid() = advisor_id);

  CREATE POLICY "Students can update their advisor relationships"
    ON advisor_student_relationships FOR UPDATE
    TO authenticated
    USING (auth.uid() = student_id);

  CREATE POLICY "Advisors can update their student relationships"
    ON advisor_student_relationships FOR UPDATE
    TO authenticated
    USING (auth.uid() = advisor_id);

  -- ========================================
  -- 2. Critic-Student Relationships Policies
  -- ========================================

  DROP POLICY IF EXISTS "Students can create critic relationships" ON critic_student_relationships;
  DROP POLICY IF EXISTS "Critics can create student relationships" ON critic_student_relationships;
  DROP POLICY IF EXISTS "Students can view their critic relationships" ON critic_student_relationships;
  DROP POLICY IF EXISTS "Critics can view their student relationships" ON critic_student_relationships;
  DROP POLICY IF EXISTS "Students can update their critic relationships" ON critic_student_relationships;
  DROP POLICY IF EXISTS "Critics can update their student relationships" ON critic_student_relationships;

  CREATE POLICY "Students can create critic relationships"
    ON critic_student_relationships FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = student_id);

  CREATE POLICY "Critics can create student relationships"
    ON critic_student_relationships FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = critic_id);

  CREATE POLICY "Students can view their critic relationships"
    ON critic_student_relationships FOR SELECT
    TO authenticated
    USING (auth.uid() = student_id);

  CREATE POLICY "Critics can view their student relationships"
    ON critic_student_relationships FOR SELECT
    TO authenticated
    USING (auth.uid() = critic_id);

  CREATE POLICY "Students can update their critic relationships"
    ON critic_student_relationships FOR UPDATE
    TO authenticated
    USING (auth.uid() = student_id);

  CREATE POLICY "Critics can update their student relationships"
    ON critic_student_relationships FOR UPDATE
    TO authenticated
    USING (auth.uid() = critic_id);

  -- ========================================
  -- 3. Documents Policies
  -- ========================================

  DROP POLICY IF EXISTS "Users can create their own documents" ON documents;
  DROP POLICY IF EXISTS "Users can view their own documents" ON documents;
  DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
  DROP POLICY IF EXISTS "Users can delete their own documents" ON documents;
  DROP POLICY IF EXISTS "Advisors can view student documents" ON documents;
  DROP POLICY IF EXISTS "Critics can view student documents" ON documents;

  CREATE POLICY "Users can create their own documents"
    ON documents FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid()::TEXT = user_id);

  CREATE POLICY "Users can view their own documents"
    ON documents FOR SELECT
    TO authenticated
    USING (auth.uid()::TEXT = user_id);

  CREATE POLICY "Users can update their own documents"
    ON documents FOR UPDATE
    TO authenticated
    USING (auth.uid()::TEXT = user_id);

  CREATE POLICY "Users can delete their own documents"
    ON documents FOR DELETE
    TO authenticated
    USING (auth.uid()::TEXT = user_id);

  CREATE POLICY "Advisors can view student documents"
    ON documents FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM advisor_student_relationships
        WHERE advisor_id = auth.uid()
        AND student_id::TEXT = documents.user_id
        AND status = 'active'
      )
    );

  CREATE POLICY "Critics can view student documents"
    ON documents FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM critic_student_relationships
        WHERE critic_id = auth.uid()
        AND student_id::TEXT = documents.user_id
        AND status = 'active'
      )
    );

  -- ========================================
  -- 4. Advisor Student Messages Policies
  -- ========================================

  DROP POLICY IF EXISTS "Users can send messages" ON advisor_student_messages;
  DROP POLICY IF EXISTS "Users can view their messages" ON advisor_student_messages;
  DROP POLICY IF EXISTS "Users can update their sent messages" ON advisor_student_messages;

  CREATE POLICY "Users can send messages"
    ON advisor_student_messages FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = sender_id);

  CREATE POLICY "Users can view their messages"
    ON advisor_student_messages FOR SELECT
    TO authenticated
    USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

  CREATE POLICY "Users can update their sent messages"
    ON advisor_student_messages FOR UPDATE
    TO authenticated
    USING (auth.uid() = sender_id);

  -- ========================================
  -- 5. Critic Student Messages Policies (if table exists)
  -- ========================================

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'critic_student_messages') THEN
    DROP POLICY IF EXISTS "Users can send critic messages" ON critic_student_messages;
    DROP POLICY IF EXISTS "Users can view their critic messages" ON critic_student_messages;
    DROP POLICY IF EXISTS "Users can update their sent critic messages" ON critic_student_messages;

    CREATE POLICY "Users can send critic messages"
      ON critic_student_messages FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = sender_id);

    CREATE POLICY "Users can view their critic messages"
      ON critic_student_messages FOR SELECT
      TO authenticated
      USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

    CREATE POLICY "Users can update their sent critic messages"
      ON critic_student_messages FOR UPDATE
      TO authenticated
      USING (auth.uid() = sender_id);
  END IF;

  -- ========================================
  -- 6. Notifications Policies
  -- ========================================

  DROP POLICY IF EXISTS "Users can create notifications" ON notifications;
  DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
  DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;
  DROP POLICY IF EXISTS "Users can delete their notifications" ON notifications;

  CREATE POLICY "Users can create notifications"
    ON notifications FOR INSERT
    TO authenticated
    WITH CHECK (true);

  CREATE POLICY "Users can view their notifications"
    ON notifications FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can update their notifications"
    ON notifications FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can delete their notifications"
    ON notifications FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

  -- ========================================
  -- 7. Profiles Policies
  -- ========================================

  DROP POLICY IF EXISTS "Authenticated users can view profiles" ON profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

  CREATE POLICY "Authenticated users can view profiles"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

END $$;

-- Enable RLS on message and notification tables if not already enabled
ALTER TABLE advisor_student_messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'critic_student_messages') THEN
    ALTER TABLE critic_student_messages ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ========================================
-- Comments
-- ========================================
COMMENT ON POLICY "Students can create advisor relationships" ON advisor_student_relationships IS 'Allow students to create advisor relationships for testing';
COMMENT ON POLICY "Students can create critic relationships" ON critic_student_relationships IS 'Allow students to create critic relationships for testing';
COMMENT ON POLICY "Users can create their own documents" ON documents IS 'Allow users to create documents for testing';
