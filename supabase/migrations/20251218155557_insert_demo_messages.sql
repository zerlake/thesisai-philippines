-- Insert sample advisor-student conversation for demo testing
-- Get your actual user IDs from auth.users table and replace the UUIDs below

-- First, check your users (commented out - for reference)
-- SELECT id, email FROM auth.users;

-- Insert 3 sample messages between advisor and student
-- Replace these UUIDs with your actual demo account IDs:
--   'YOUR_ADVISOR_UUID' - your advisor/admin account
--   'YOUR_STUDENT_UUID' - your student account

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
  (SELECT id FROM auth.users LIMIT 1)::UUID,
  'Dr. Johnson',
  'advisor',
  (SELECT id FROM auth.users OFFSET 1 LIMIT 1)::UUID,
  'Hi Maria, how are you progressing with your thesis research? Have you started on the literature review?',
  'Thesis Progress Check-in',
  true,
  true,
  NOW() - INTERVAL '60 minutes'
),
(
  (SELECT id FROM auth.users OFFSET 1 LIMIT 1)::UUID,
  'Maria Santos',
  'student',
  (SELECT id FROM auth.users LIMIT 1)::UUID,
  'Hi Dr. Johnson! Great to hear from you. I''ve finished the literature review and reviewed 45 papers. I''m ready to discuss Chapter 1 findings whenever you are.',
  'Re: Thesis Progress Check-in',
  true,
  true,
  NOW() - INTERVAL '30 minutes'
),
(
  (SELECT id FROM auth.users LIMIT 1)::UUID,
  'Dr. Johnson',
  'advisor',
  (SELECT id FROM auth.users OFFSET 1 LIMIT 1)::UUID,
  'Excellent work! 45 papers is a solid foundation. Let''s schedule a meeting next week to review your findings and discuss the research methodology. How does Wednesday at 2 PM sound?',
  'Re: Thesis Progress Check-in',
  false,
  false,
  NOW() - INTERVAL '10 minutes'
);
