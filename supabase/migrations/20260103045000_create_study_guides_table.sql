-- Create study_guides table to support the enhanced Definition of Terms feature
CREATE TABLE IF NOT EXISTS study_guides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  executive_summary TEXT,
  estimated_reading_time INTEGER,
  section_count INTEGER DEFAULT 0,
  term_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_study_guides_user_id ON study_guides(user_id);

-- Enable RLS
ALTER TABLE study_guides ENABLE ROW LEVEL SECURITY;

-- Create policy for study guides
CREATE POLICY "Users can view their own study guides" ON study_guides
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study guides" ON study_guides
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study guides" ON study_guides
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study guides" ON study_guides
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_study_guides_updated_at
    BEFORE UPDATE ON study_guides
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();