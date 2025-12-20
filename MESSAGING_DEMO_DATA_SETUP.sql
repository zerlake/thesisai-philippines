-- =========================================================================
-- DEMO MESSAGING SETUP
-- =========================================================================
-- Run this SQL in Supabase SQL Editor to add sample advisor-student messages
-- 
-- Instructions:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Create new query
-- 3. Paste this entire SQL script
-- 4. Click "Run"
-- 5. Replace the demo UUIDs with your actual account UUIDs if needed
-- =========================================================================

-- Step 1: Add missing columns to support demo data
ALTER TABLE advisor_student_messages 
ADD COLUMN IF NOT EXISTS sender_name TEXT,
ADD COLUMN IF NOT EXISTS sender_avatar_url TEXT,
ADD COLUMN IF NOT EXISTS read_status BOOLEAN DEFAULT FALSE;

-- Step 2: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_advisor_student_messages_sender_name 
ON advisor_student_messages(sender_name);

-- Step 3: Insert sample advisor-student conversation
-- 
-- IMPORTANT: Update these UUIDs with your actual demo account IDs:
-- - Replace '11111111-1111-1111-1111-111111111111' with your ADVISOR UUID
-- - Replace '22222222-2222-2222-2222-222222222222' with your STUDENT UUID
--
-- To find your UUIDs:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Copy the UUIDs from the User ID column

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

-- Message 1: Advisor initiates conversation (60 minutes ago)
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

-- Message 2: Student responds (30 minutes ago)
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

-- Message 3: Advisor proposes meeting (10 minutes ago)
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

-- =========================================================================
-- VERIFICATION QUERY
-- =========================================================================
-- Run this to verify the messages were inserted correctly:
-- 

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
ORDER BY created_at DESC
LIMIT 10;

-- =========================================================================
-- IF YOU HAVE ACTUAL DEMO ACCOUNT UUIDs
-- =========================================================================
-- Replace the template UUIDs above with your actual account UUIDs:
--
-- ADVISOR UUID: [PASTE YOUR ADVISOR UUID HERE]
-- STUDENT UUID: [PASTE YOUR STUDENT UUID HERE]
--
-- Then re-run the INSERT statement (Step 3 above)

-- =========================================================================
-- CLEANUP (if you need to delete demo messages later)
-- =========================================================================
-- Uncomment and run to delete all demo messages:
--
-- DELETE FROM advisor_student_messages 
-- WHERE sender_name IN ('Dr. Johnson', 'Maria Santos')
--   OR sender_id IN (
--     '11111111-1111-1111-1111-111111111111'::UUID,
--     '22222222-2222-2222-2222-222222222222'::UUID
--   );
