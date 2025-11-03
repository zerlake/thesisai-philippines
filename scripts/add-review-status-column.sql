-- Add review_status column to documents table
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT NULL;

-- Optional: Add comment to document the purpose of the column
COMMENT ON COLUMN public.documents.review_status IS 'Status of document review: e.g., "needs_revision", "approved", "under_review", etc.';