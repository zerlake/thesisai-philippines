-- Insert demo messages with YOUR current user ID
-- So you can see messages in the chat interface immediately

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
  'ff79d401-5614-4de8-9f17-bc920f360dcf'::UUID,
  'Dr. Johnson',
  'advisor',
  '130c8a89-48f0-4842-ba51-67529e20bff0'::UUID,
  'Hi, how is your thesis progressing?',
  'Thesis Check-in',
  true,
  true,
  NOW() - INTERVAL '60 minutes'
),
(
  '130c8a89-48f0-4842-ba51-67529e20bff0'::UUID,
  'You',
  'student',
  'ff79d401-5614-4de8-9f17-bc920f360dcf'::UUID,
  'Great! I completed the literature review.',
  'Re: Thesis Check-in',
  false,
  false,
  NOW() - INTERVAL '30 minutes'
);
