-- Create review_notes table for advisor and critic feedback
CREATE TABLE IF NOT EXISTS public.review_notes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    document_id TEXT NOT NULL,
    reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reviewer_name TEXT,
    reviewer_role TEXT NOT NULL CHECK (reviewer_role IN ('advisor', 'critic')),
    content JSONB,
    content_html TEXT,
    note_type TEXT NOT NULL DEFAULT 'general' CHECK (note_type IN ('general', 'revision', 'approval', 'suggestion')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_review_notes_document_id ON public.review_notes(document_id);
CREATE INDEX IF NOT EXISTS idx_review_notes_reviewer_id ON public.review_notes(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_review_notes_status ON public.review_notes(status);

-- Enable RLS
ALTER TABLE public.review_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Reviewers can see their own notes
CREATE POLICY "Reviewers can view their own notes"
    ON public.review_notes
    FOR SELECT
    USING (auth.uid() = reviewer_id);

-- Policy: Reviewers can insert their own notes
CREATE POLICY "Reviewers can create notes"
    ON public.review_notes
    FOR INSERT
    WITH CHECK (auth.uid() = reviewer_id);

-- Policy: Reviewers can update their own notes
CREATE POLICY "Reviewers can update their own notes"
    ON public.review_notes
    FOR UPDATE
    USING (auth.uid() = reviewer_id)
    WITH CHECK (auth.uid() = reviewer_id);

-- Policy: Reviewers can delete their own notes
CREATE POLICY "Reviewers can delete their own notes"
    ON public.review_notes
    FOR DELETE
    USING (auth.uid() = reviewer_id);

-- Policy: Students can view notes sent to them (notes on their documents with status 'sent')
CREATE POLICY "Students can view sent notes on their documents"
    ON public.review_notes
    FOR SELECT
    USING (
        status = 'sent'
        AND document_id IN (
            SELECT id::text FROM public.thesis_documents WHERE user_id = auth.uid()
            UNION
            SELECT id FROM public.documents WHERE user_id = auth.uid()
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_review_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_review_notes_updated_at ON public.review_notes;
CREATE TRIGGER trigger_update_review_notes_updated_at
    BEFORE UPDATE ON public.review_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_review_notes_updated_at();

-- Grant permissions
GRANT ALL ON public.review_notes TO authenticated;
GRANT SELECT ON public.review_notes TO anon;
