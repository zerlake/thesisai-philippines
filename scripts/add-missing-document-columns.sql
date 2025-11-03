-- Add missing columns to the documents table based on application requirements

-- Add review_status column (needed by AdvisorFeedbackCard)
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT NULL;

-- Add other columns that might be needed by the application
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS advisor_comments TEXT DEFAULT NULL;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS critic_feedback TEXT DEFAULT NULL;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS submission_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS defense_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS grade TEXT DEFAULT NULL;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS advisor_id UUID REFERENCES public.profiles(id) DEFAULT NULL;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS critic_id UUID REFERENCES public.profiles(id) DEFAULT NULL;

-- Add comment to document the purpose of the review_status column
COMMENT ON COLUMN public.documents.review_status IS 'Status of document review: e.g., "needs_revision", "approved", "under_review", "submitted", etc.';