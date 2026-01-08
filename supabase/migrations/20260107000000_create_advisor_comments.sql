
-- Create advisor_comments table
CREATE TABLE IF NOT EXISTS public.advisor_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thesis_id UUID NOT NULL REFERENCES public.thesis_projects(id) ON DELETE CASCADE,
    chapter_id TEXT CHECK (chapter_id IN ('chapter-1', 'chapter-2', 'chapter-3', 'chapter-4', 'chapter-5')),
    scope_id TEXT NOT NULL,
    raw_text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'integrated', 'verified')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create moddatetime function if it doesn't exist
CREATE OR REPLACE FUNCTION moddatetime()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.advisor_comments
FOR EACH ROW EXECUTE FUNCTION moddatetime();

-- Create chapter_sections table for snapshot history
CREATE TABLE IF NOT EXISTS public.chapter_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thesis_id UUID NOT NULL REFERENCES public.thesis_projects(id) ON DELETE CASCADE,
    chapter_id TEXT NOT NULL,
    section_id TEXT NOT NULL,
    current_text TEXT DEFAULT '',
    last_snapshot_hash TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(thesis_id, chapter_id, section_id)
);

-- Add updated_at trigger for chapter_sections
CREATE TRIGGER handle_chapter_sections_updated_at BEFORE UPDATE ON public.chapter_sections
FOR EACH ROW EXECUTE FUNCTION moddatetime();

-- Add RLS policies
ALTER TABLE public.advisor_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_sections ENABLE ROW LEVEL SECURITY;

-- Policies for advisor_comments
CREATE POLICY "Users can view comments for their thesis"
ON public.advisor_comments FOR SELECT
USING (auth.uid() IN (
    SELECT user_id FROM public.thesis_projects WHERE id = advisor_comments.thesis_id
));

-- Policies for chapter_sections
CREATE POLICY "Users can view and edit their chapter sections"
ON public.chapter_sections FOR ALL
USING (auth.uid() IN (
    SELECT user_id FROM public.thesis_projects WHERE id = chapter_sections.thesis_id
));
