-- Add sample messages for demo and testing purposes
-- This ensures there's data for the notification bell to display

-- Insert sample advisor-student messages if the table exists and is empty
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'advisor_student_messages') 
  AND NOT EXISTS (SELECT FROM advisor_student_messages LIMIT 1) THEN
    
    -- Insert sample messages between advisor and student
    INSERT INTO advisor_student_messages (
      sender_id, 
      sender_role, 
      recipient_id, 
      message, 
      subject, 
      is_read
    )
    SELECT 
      (SELECT id FROM auth.users LIMIT 1 OFFSET 0), 
      'advisor', 
      (SELECT id FROM auth.users LIMIT 1 OFFSET 1), 
      'Hello! I have reviewed your thesis proposal and have some feedback for you.', 
      'Thesis Proposal Feedback',
      false
    WHERE EXISTS (SELECT id FROM auth.users LIMIT 2);
    
    INSERT INTO advisor_student_messages (
      sender_id, 
      sender_role, 
      recipient_id, 
      message, 
      subject, 
      is_read
    )
    SELECT 
      (SELECT id FROM auth.users LIMIT 1 OFFSET 1), 
      'student', 
      (SELECT id FROM auth.users LIMIT 1 OFFSET 0), 
      'Thank you for the feedback! I will make the suggested revisions.', 
      'Re: Thesis Proposal Feedback',
      false
    WHERE EXISTS (SELECT id FROM auth.users LIMIT 2);
    
  END IF;
END $$;

-- Insert sample general messages if the table exists and is empty
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') 
  AND NOT EXISTS (SELECT FROM messages LIMIT 1) THEN
    
    -- Insert sample general message
    INSERT INTO messages (
      sender_id, 
      recipient_id, 
      content, 
      subject, 
      is_read
    )
    SELECT 
      (SELECT id FROM auth.users LIMIT 1 OFFSET 0), 
      (SELECT id FROM auth.users LIMIT 1 OFFSET 1), 
      'System notification: Your document has been successfully processed.', 
      'System Notification',
      false
    WHERE EXISTS (SELECT id FROM auth.users LIMIT 2);
    
  END IF;
END $$;