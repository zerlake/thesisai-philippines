-- Check all users
SELECT id, email FROM auth.users;

-- Check all messages
SELECT 
  id,
  sender_id,
  sender_name,
  recipient_id,
  message,
  created_at
FROM advisor_student_messages 
ORDER BY created_at DESC;

-- Count messages
SELECT COUNT(*) FROM advisor_student_messages;

-- Check if messages exist for your specific user ID
-- Replace 'YOUR_USER_ID' with your actual user ID from the first query
SELECT 
  id,
  sender_id,
  sender_name,
  recipient_id,
  message,
  created_at
FROM advisor_student_messages
WHERE sender_id = 'YOUR_USER_ID'::UUID 
   OR recipient_id = 'YOUR_USER_ID'::UUID;
