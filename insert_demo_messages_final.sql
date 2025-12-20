-- Insert demo messages with your actual user ID
-- Your ID: e1985a2d-332b-4a4c-953f-a5461280bbb1
-- Dr. Johnson: ff79d401-5614-4de8-9f17-bc920f360dcf

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
  'e1985a2d-332b-4a4c-953f-a5461280bbb1'::UUID,
  'Dr. Johnson',
  'advisor',
  'ff79d401-5614-4de8-9f17-bc920f360dcf'::UUID,
  'Hi Maria, how is your thesis progressing?',
  'Thesis Check-in',
  true,
  true,
  NOW() - INTERVAL '60 minutes'
),
(
  'ff79d401-5614-4de8-9f17-bc920f360dcf'::UUID,
  'Maria Santos',
  'student',
  'e1985a2d-332b-4a4c-953f-a5461280bbb1'::UUID,
  'Great! I completed the literature review.',
  'Re: Thesis Check-in',
  false,
  false,
  NOW() - INTERVAL '30 minutes'
);
