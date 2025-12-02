-- Thesis Progress and Chapters Tables
-- Purpose: Support analytics and progress tracking for thesis writing

-- ========================================
-- 1. Thesis Progress Table
-- ========================================
CREATE TABLE IF NOT EXISTS thesis_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_word_count INTEGER DEFAULT 0,
  target_word_count INTEGER DEFAULT 50000,
  estimated_completion_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. Chapters Table
-- ========================================
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  word_count INTEGER DEFAULT 0,
  target_word_count INTEGER DEFAULT 5000,
  chapter_number INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- Indexes for Performance
-- ========================================

-- Thesis progress indexes
CREATE INDEX IF NOT EXISTS idx_thesis_progress_user_id 
  ON thesis_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_thesis_progress_status 
  ON thesis_progress(user_id, status);

-- Chapters indexes
CREATE INDEX IF NOT EXISTS idx_chapters_user_id 
  ON chapters(user_id);

CREATE INDEX IF NOT EXISTS idx_chapters_user_chapter_number 
  ON chapters(user_id, chapter_number);

CREATE INDEX IF NOT EXISTS idx_chapters_status 
  ON chapters(user_id, status);

CREATE INDEX IF NOT EXISTS idx_chapters_created_at 
  ON chapters(user_id, created_at DESC);

-- ========================================
-- Row Level Security (RLS) Policies
-- ========================================

-- Enable RLS on all tables
ALTER TABLE thesis_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- Thesis Progress Policies
CREATE POLICY thesis_progress_user_select ON thesis_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY thesis_progress_user_insert ON thesis_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY thesis_progress_user_update ON thesis_progress
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY thesis_progress_user_delete ON thesis_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Chapters Policies
CREATE POLICY chapters_user_select ON chapters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY chapters_user_insert ON chapters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY chapters_user_update ON chapters
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY chapters_user_delete ON chapters
  FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- Triggers for Auto-Update Timestamps
-- ========================================

-- Thesis progress trigger
CREATE TRIGGER thesis_progress_updated_at
  BEFORE UPDATE ON thesis_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Chapters trigger
CREATE TRIGGER chapters_updated_at
  BEFORE UPDATE ON chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Comments
-- ========================================

COMMENT ON TABLE thesis_progress IS 'Tracks overall thesis progress and completion metrics';
COMMENT ON TABLE chapters IS 'Individual chapter data for thesis writing projects';
COMMENT ON COLUMN thesis_progress.current_word_count IS 'Current word count of the thesis';
COMMENT ON COLUMN thesis_progress.target_word_count IS 'Target word count for the thesis';
COMMENT ON COLUMN chapters.word_count IS 'Current word count of the chapter';
COMMENT ON COLUMN chapters.target_word_count IS 'Target word count for the chapter';
