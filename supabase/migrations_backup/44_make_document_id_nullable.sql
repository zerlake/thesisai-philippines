-- Make document_id nullable in advisor_student_messages
-- This allows messages between advisors and students across all documents
ALTER TABLE advisor_student_messages
ALTER COLUMN document_id DROP NOT NULL;
