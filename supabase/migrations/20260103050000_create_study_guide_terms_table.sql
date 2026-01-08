-- Create study_guide_terms table with enhanced structure for conceptual and operational definitions
CREATE TABLE IF NOT EXISTS study_guide_terms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guide_id UUID REFERENCES study_guides(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  conceptual_definition TEXT,
  operational_definition TEXT,
  source_type TEXT DEFAULT 'researcher-defined',
  variable_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_study_guide_terms_guide_id ON study_guide_terms(guide_id);

-- Enable RLS
ALTER TABLE study_guide_terms ENABLE ROW LEVEL SECURITY;

-- Create policy for study guide terms
CREATE POLICY "Users can view their own study guide terms" ON study_guide_terms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM study_guides sg 
      WHERE sg.id = study_guide_terms.guide_id 
      AND sg.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own study guide terms" ON study_guide_terms
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM study_guides sg 
      WHERE sg.id = study_guide_terms.guide_id 
      AND sg.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own study guide terms" ON study_guide_terms
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM study_guides sg 
      WHERE sg.id = study_guide_terms.guide_id 
      AND sg.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own study guide terms" ON study_guide_terms
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM study_guides sg 
      WHERE sg.id = study_guide_terms.guide_id 
      AND sg.user_id = auth.uid()
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_study_guide_terms_updated_at
    BEFORE UPDATE ON study_guide_terms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();