-- Step 1: Find your actual user IDs
SELECT id, email FROM auth.users;

-- Step 2: Copy the IDs and update the query below, then run it
-- Example: If your IDs are:
--   Advisor: a1b2c3d4-e5f6-7890-abcd-ef1234567890
--   Student: b2c3d4e5-f6a7-8901-bcde-f12345678901

ALTER TABLE advisor_student_messages 
ADD COLUMN IF NOT EXISTS sender_name TEXT,
ADD COLUMN IF NOT EXISTS sender_avatar_url TEXT,
ADD COLUMN IF NOT EXISTS read_status BOOLEAN DEFAULT FALSE;

INSERT INTO advisor_student_messages (
  sender_id,
  sender_name,
  sender_role,
  recipient_id,
  message,
  subject,
  is_read,
  read_status,
  created_at
) VALUES
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID,
  'Dr. Johnson',
  'advisor',
  'b2c3d4e5-f6a7-8901-bcde-f12345678901'::UUID,
  'Hi Maria, how are you progressing with your thesis research?',
  'Thesis Progress Check-in',
  true,
  true,
  NOW() - INTERVAL '60 minutes'
),
(
  'b2c3d4e5-f6a7-8901-bcde-f12345678901'::UUID,
  'Maria Santos',
  'student',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID,
  'Hi Dr. Johnson! I finished the literature review and reviewed 45 papers. Ready to discuss Chapter 1.',
  'Re: Thesis Progress Check-in',
  true,
  true,
  NOW() - INTERVAL '30 minutes'
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::UUID,
  'Dr. Johnson',
  'advisor',
  'b2c3d4e5-f6a7-8901-bcde-f12345678901'::UUID,
  'Excellent! 45 papers is solid. Let''s schedule a meeting next week. Wednesday at 2 PM?',
  'Re: Thesis Progress Check-in',
  false,
  false,
  NOW() - INTERVAL '10 minutes'
);
