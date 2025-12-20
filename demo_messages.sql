-- Add columns if missing
ALTER TABLE advisor_student_messages 
ADD COLUMN IF NOT EXISTS sender_name TEXT,
ADD COLUMN IF NOT EXISTS sender_avatar_url TEXT,
ADD COLUMN IF NOT EXISTS read_status BOOLEAN DEFAULT FALSE;

-- Insert sample advisor-student conversation
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
  '11111111-1111-1111-1111-111111111111'::UUID,
  'Dr. Johnson',
  'advisor',
  '22222222-2222-2222-2222-222222222222'::UUID,
  'Hi Maria, how are you progressing with your thesis research? Have you started on the literature review?',
  'Thesis Progress Check-in',
  true,
  true,
  NOW() - INTERVAL '60 minutes'
),
(
  '22222222-2222-2222-2222-222222222222'::UUID,
  'Maria Santos',
  'student',
  '11111111-1111-1111-1111-111111111111'::UUID,
  'Hi Dr. Johnson! Great to hear from you. I''ve finished the literature review and reviewed 45 papers. I''m ready to discuss Chapter 1 findings whenever you are.',
  'Re: Thesis Progress Check-in',
  true,
  true,
  NOW() - INTERVAL '30 minutes'
),
(
  '11111111-1111-1111-1111-111111111111'::UUID,
  'Dr. Johnson',
  'advisor',
  '22222222-2222-2222-2222-222222222222'::UUID,
  'Excellent work! 45 papers is a solid foundation. Let''s schedule a meeting next week to review your findings and discuss the research methodology. How does Wednesday at 2 PM sound?',
  'Re: Thesis Progress Check-in',
  false,
  false,
  NOW() - INTERVAL '10 minutes'
);
