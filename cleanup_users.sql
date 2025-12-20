-- =====================================================
-- COMPREHENSIVE USER CLEANUP SCRIPT
-- =====================================================
-- This script removes ALL users EXCEPT the specified UUIDs
-- Run in Supabase SQL Editor (Dashboard > SQL Editor)
-- =====================================================

-- Define the UUIDs to KEEP
-- Demo accounts:
--   6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7 - demo-student@thesis.ai
--   14a7ff7d-c6d2-4b27-ace1-32237ac28e02 - demo-critic@thesis.ai
--   ff79d401-5614-4de8-9f17-bc920f360dcf - demo-advisor@thesis.ai
--   7f22dff0-b8a9-4e08-835f-2a79dba9e6f7 - demo-admin@thesis.ai
-- Personal accounts:
--   2e21b303-cfbb-48a9-928e-cffbd530e777 - zerlake1@gmail.com
--   d6fccec1-afdd-4f3d-9a98-01ad1133745d - zerlake@gmail.com
--   a39d0467-bb04-4b2c-96af-4e4a35197715 - elezerlake@gmail.com

-- =====================================================
-- STEP 0: Preview what will be deleted (RUN THIS FIRST)
-- =====================================================
SELECT 'USERS TO BE DELETED:' as info;
SELECT id, email, created_at FROM auth.users
WHERE id NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
);

SELECT 'USERS TO BE KEPT:' as info;
SELECT id, email, created_at FROM auth.users
WHERE id IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
);

-- =====================================================
-- STEP 1: Delete from tables with foreign keys to profiles/auth.users
-- (Run these in order due to foreign key constraints)
-- =====================================================

-- Messaging tables
DELETE FROM advisor_student_messages WHERE sender_id NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
) OR recipient_id NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
);

DELETE FROM messages WHERE sender_id NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
) OR recipient_id NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
);

-- Notifications
DELETE FROM notifications WHERE user_id NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
);

-- Activity logs
DELETE FROM activity_logs WHERE user_id NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
);

-- AI tool usage
DELETE FROM ai_tool_usage WHERE user_id NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
);

-- AI generated content
DELETE FROM ai_generated_content WHERE user_id NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
);

-- Topic ideas
DELETE FROM topic_ideas WHERE user_id NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
);

-- Literature collections
DELETE FROM literature_items WHERE collection_id IN (
  SELECT id FROM literature_collections WHERE user_id NOT IN (
    '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
    '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
    'ff79d401-5614-4de8-9f17-bc920f360dcf',
    '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
    '2e21b303-cfbb-48a9-928e-cffbd530e777',
    'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
    'a39d0467-bb04-4b2c-96af-4e4a35197715'
  )
);

DELETE FROM literature_collections WHERE user_id NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
);

-- User progress
DELETE FROM user_progress WHERE user_id NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
);

-- Subscriptions
DELETE FROM subscriptions WHERE user_id NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
);

-- Usage stats
DELETE FROM usage_stats WHERE user_id NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
);

-- Group memberships and documents
DELETE FROM group_documents WHERE shared_by NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
);

DELETE FROM group_memberships WHERE user_id NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
);

DELETE FROM research_groups WHERE leader_id NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
);

-- Peer reviews
DELETE FROM peer_reviews WHERE reviewer_id NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
) OR reviewee_id NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
);

-- Moderation reports
DELETE FROM moderation_reports WHERE reporter_id NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
);

-- Collaboration invites
DELETE FROM collaboration_invites WHERE inviter_id NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
);

-- =====================================================
-- STEP 2: Delete thesis-related data (complex FK chains)
-- =====================================================

-- First delete documents table (simple one, not thesis_documents)
DELETE FROM documents WHERE user_id NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
);

-- Research gaps
DELETE FROM research_gaps WHERE identified_by NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
);

-- Citations
DELETE FROM citations WHERE user_id NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
);

-- Originality checks
DELETE FROM originality_checks WHERE user_id NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
);

-- Thesis documents (need to handle locked_by FK)
UPDATE thesis_documents SET locked_by = NULL WHERE locked_by NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
);

DELETE FROM thesis_documents WHERE user_id NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
);

-- Thesis projects
DELETE FROM thesis_projects WHERE user_id NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
);

-- =====================================================
-- STEP 3: Delete advisor/critic records
-- =====================================================

DELETE FROM advisors WHERE profile_id NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
);

DELETE FROM critics WHERE profile_id NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
);

-- =====================================================
-- STEP 4: Delete from profiles table
-- =====================================================

DELETE FROM profiles WHERE id NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
);

-- =====================================================
-- STEP 5: Delete from auth.users table (LAST STEP)
-- =====================================================

DELETE FROM auth.users WHERE id NOT IN (
  '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  'ff79d401-5614-4de8-9f17-bc920f360dcf',
  '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  '2e21b303-cfbb-48a9-928e-cffbd530e777',
  'd6fccec1-afdd-4f3d-9a98-01ad1133745d',
  'a39d0467-bb04-4b2c-96af-4e4a35197715'
);

-- =====================================================
-- STEP 6: Verify cleanup
-- =====================================================

SELECT 'REMAINING USERS IN auth.users:' as info;
SELECT id, email, created_at FROM auth.users ORDER BY email;

SELECT 'REMAINING PROFILES:' as info;
SELECT id, email, role FROM profiles ORDER BY email;

SELECT 'CLEANUP COMPLETE!' as status;
