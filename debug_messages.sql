-- Query 1: Find your user ID by email
-- Replace 'your-email@example.com' with your actual email
SELECT id, email, created_at FROM auth.users WHERE email = 'your-email@example.com';

-- Query 2: Check all messages in the table
SELECT 
  id,
  sender_id,
  sender_name,
  sender_role,
  recipient_id,
  message,
  is_read,
  read_status,
  created_at
FROM advisor_student_messages 
ORDER BY created_at DESC;

-- Query 3: Count total messages
SELECT COUNT(*) as total_messages FROM advisor_student_messages;

-- Query 4: Check messages for a specific user (replace UUID with your user ID)
SELECT 
  id,
  sender_id,
  sender_name,
  sender_role,
  recipient_id,
  message,
  is_read,
  created_at
FROM advisor_student_messages
WHERE sender_id = 'YOUR_USER_ID'::UUID 
   OR recipient_id = 'YOUR_USER_ID'::UUID
ORDER BY created_at DESC;
