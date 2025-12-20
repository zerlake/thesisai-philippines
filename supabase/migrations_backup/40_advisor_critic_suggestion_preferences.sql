-- Create table for advisor suggestion preferences
CREATE TABLE IF NOT EXISTS advisor_suggestion_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  focus_areas TEXT[] DEFAULT ARRAY['research_gap', 'literature_review', 'methodology', 'writing_quality'],
  suggestion_tone TEXT DEFAULT 'balanced' CHECK (suggestion_tone IN ('formal', 'encouraging', 'balanced')),
  detail_level TEXT DEFAULT 'moderate' CHECK (detail_level IN ('brief', 'moderate', 'comprehensive')),
  frequency_days INTEGER DEFAULT 7 CHECK (frequency_days >= 1 AND frequency_days <= 30),
  auto_generate BOOLEAN DEFAULT true,
  include_research_guidance BOOLEAN DEFAULT true,
  include_writing_tips BOOLEAN DEFAULT true,
  include_methodology_advice BOOLEAN DEFAULT true,
  include_presentation_help BOOLEAN DEFAULT false,
  custom_instructions TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(advisor_id)
);

-- Create table for critic suggestion preferences
CREATE TABLE IF NOT EXISTS critic_suggestion_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  critic_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_focus_areas TEXT[] DEFAULT ARRAY['conceptual_clarity', 'methodological_soundness', 'results_interpretation', 'academic_writing'],
  feedback_style TEXT DEFAULT 'constructive' CHECK (feedback_style IN ('constructive', 'critical', 'supportive')),
  review_depth TEXT DEFAULT 'moderate' CHECK (review_depth IN ('surface_level', 'moderate', 'deep_analysis')),
  turnaround_expectation_days INTEGER DEFAULT 5 CHECK (turnaround_expectation_days >= 1 AND turnaround_expectation_days <= 30),
  auto_generate_feedback BOOLEAN DEFAULT true,
  include_content_review BOOLEAN DEFAULT true,
  include_structure_review BOOLEAN DEFAULT true,
  include_methodology_review BOOLEAN DEFAULT true,
  include_presentation_review BOOLEAN DEFAULT false,
  include_originality_concerns BOOLEAN DEFAULT true,
  custom_review_guidelines TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(critic_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_advisor_suggestion_preferences_advisor_id ON advisor_suggestion_preferences(advisor_id);
CREATE INDEX idx_critic_suggestion_preferences_critic_id ON critic_suggestion_preferences(critic_id);

-- Enable RLS
ALTER TABLE advisor_suggestion_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE critic_suggestion_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for advisor preferences
CREATE POLICY "Advisors can view their own preferences"
  ON advisor_suggestion_preferences
  FOR SELECT
  USING (advisor_id = auth.uid());

CREATE POLICY "Advisors can update their own preferences"
  ON advisor_suggestion_preferences
  FOR UPDATE
  USING (advisor_id = auth.uid());

CREATE POLICY "Advisors can insert their own preferences"
  ON advisor_suggestion_preferences
  FOR INSERT
  WITH CHECK (advisor_id = auth.uid());

-- RLS Policies for critic preferences
CREATE POLICY "Critics can view their own preferences"
  ON critic_suggestion_preferences
  FOR SELECT
  USING (critic_id = auth.uid());

CREATE POLICY "Critics can update their own preferences"
  ON critic_suggestion_preferences
  FOR UPDATE
  USING (critic_id = auth.uid());

CREATE POLICY "Critics can insert their own preferences"
  ON critic_suggestion_preferences
  FOR INSERT
  WITH CHECK (critic_id = auth.uid());
