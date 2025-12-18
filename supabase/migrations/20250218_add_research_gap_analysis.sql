-- Add AI-powered research gap analysis tables
-- Phase 5: Advanced AI Features

-- Main gap analysis results table
CREATE TABLE IF NOT EXISTS research_gap_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thesis_id UUID REFERENCES theses(id) ON DELETE CASCADE,
  gap_id UUID NOT NULL,
  
  -- Analysis metadata
  analysis_type VARCHAR(50) DEFAULT 'comprehensive',
  analysis_depth VARCHAR(50) DEFAULT 'standard',
  analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Core Analysis
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  opportunities TEXT[] DEFAULT '{}',
  threats TEXT[] DEFAULT '{}',
  overall_assessment TEXT,
  
  -- Dimension Scores (0-100)
  specificity_score INTEGER CHECK (specificity_score >= 0 AND specificity_score <= 100),
  specificity_feedback TEXT,
  novelty_score INTEGER CHECK (novelty_score >= 0 AND novelty_score <= 100),
  novelty_feedback TEXT,
  feasibility_score INTEGER CHECK (feasibility_score >= 0 AND feasibility_score <= 100),
  feasibility_feedback TEXT,
  significance_score INTEGER CHECK (significance_score >= 0 AND significance_score <= 100),
  significance_feedback TEXT,
  literature_alignment_score INTEGER CHECK (literature_alignment_score >= 0 AND literature_alignment_score <= 100),
  literature_alignment_feedback TEXT,
  
  -- Depth Analysis
  literature_gaps TEXT[] DEFAULT '{}',
  methodological_gaps TEXT[] DEFAULT '{}',
  temporal_gaps TEXT[] DEFAULT '{}',
  geographic_gaps TEXT[] DEFAULT '{}',
  population_gaps TEXT[] DEFAULT '{}',
  
  -- Research Impact
  theoretical_contribution TEXT,
  practical_application TEXT,
  innovation_level VARCHAR(50) CHECK (innovation_level IN ('incremental', 'moderate', 'transformative')),
  beneficiaries TEXT[] DEFAULT '{}',
  scalability VARCHAR(50) CHECK (scalability IN ('local', 'regional', 'national', 'international')),
  
  -- Defense Preparation
  defense_questions JSONB,
  potential_challenges TEXT[] DEFAULT '{}',
  preparation_strategy TEXT,
  defense_readiness_score INTEGER CHECK (defense_readiness_score >= 0 AND defense_readiness_score <= 100),
  
  -- Recommendations
  gap_refinements TEXT[] DEFAULT '{}',
  literature_sources TEXT[] DEFAULT '{}',
  methodology_advice TEXT[] DEFAULT '{}',
  collaboration_opportunities TEXT[] DEFAULT '{}',
  
  -- Confidence Metrics
  analysis_confidence INTEGER CHECK (analysis_confidence >= 0 AND analysis_confidence <= 100),
  data_quality INTEGER CHECK (data_quality >= 0 AND data_quality <= 100),
  completeness INTEGER CHECK (completeness >= 0 AND completeness <= 100),
  
  -- Context Information
  field_of_study VARCHAR(255),
  geographic_scope VARCHAR(255),
  timeframe VARCHAR(255),
  target_population VARCHAR(255),
  
  -- Tracking
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_gap_analysis UNIQUE(user_id, gap_id, analysis_type)
);

-- Analysis history for tracking changes
CREATE TABLE IF NOT EXISTS research_gap_analysis_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID NOT NULL REFERENCES research_gap_analyses(id) ON DELETE CASCADE,
  
  -- Version tracking
  version_number INTEGER NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Change tracking
  change_summary TEXT,
  changed_fields JSONB,
  previous_values JSONB,
  new_values JSONB,
  
  CONSTRAINT unique_analysis_version UNIQUE(analysis_id, version_number)
);

-- Gap analysis feedback from advisors/peers
CREATE TABLE IF NOT EXISTS gap_analysis_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID NOT NULL REFERENCES research_gap_analyses(id) ON DELETE CASCADE,
  
  -- Feedback metadata
  feedback_from UUID NOT NULL REFERENCES auth.users(id),
  feedback_role VARCHAR(50) DEFAULT 'peer', -- 'advisor', 'peer', 'examiner'
  
  -- Feedback content
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  strengths_commentary TEXT,
  improvement_areas TEXT,
  specific_recommendations TEXT,
  
  -- Category ratings
  clarity_rating INTEGER CHECK (clarity_rating >= 1 AND clarity_rating <= 5),
  feasibility_rating INTEGER CHECK (feasibility_rating >= 1 AND feasibility_rating <= 5),
  significance_rating INTEGER CHECK (significance_rating >= 1 AND significance_rating <= 5),
  originality_rating INTEGER CHECK (originality_rating >= 1 AND originality_rating <= 5),
  
  -- Tracking
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Defense preparation artifacts
CREATE TABLE IF NOT EXISTS defense_preparation_artifacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gap_analysis_id UUID NOT NULL REFERENCES research_gap_analyses(id) ON DELETE CASCADE,
  
  -- Artifact metadata
  artifact_type VARCHAR(100), -- 'speaker_notes', 'slide_outline', 'answer_guide', 'research_summary'
  title VARCHAR(255),
  
  -- Content
  content TEXT,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Usage tracking
  last_accessed TIMESTAMP,
  access_count INTEGER DEFAULT 0
);

-- AI analysis cache for performance
CREATE TABLE IF NOT EXISTS gap_analysis_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key VARCHAR(512) UNIQUE NOT NULL,
  
  -- Cached data
  analysis_data JSONB NOT NULL,
  
  -- Expiration
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '7 days'
);

-- Indexes for performance
CREATE INDEX idx_research_gap_analyses_user_id ON research_gap_analyses(user_id);
CREATE INDEX idx_research_gap_analyses_thesis_id ON research_gap_analyses(thesis_id);
CREATE INDEX idx_research_gap_analyses_gap_id ON research_gap_analyses(gap_id);
CREATE INDEX idx_research_gap_analyses_analyzed_at ON research_gap_analyses(analyzed_at DESC);
CREATE INDEX idx_gap_analysis_feedback_analysis_id ON gap_analysis_feedback(analysis_id);
CREATE INDEX idx_gap_analysis_feedback_feedback_from ON gap_analysis_feedback(feedback_from);
CREATE INDEX idx_defense_preparation_gap_analysis_id ON defense_preparation_artifacts(gap_analysis_id);
CREATE INDEX idx_gap_analysis_cache_expires_at ON gap_analysis_cache(expires_at);

-- Enable row level security
ALTER TABLE research_gap_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_gap_analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE gap_analysis_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE defense_preparation_artifacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only view their own analyses
CREATE POLICY "Users can view own gap analyses" ON research_gap_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create gap analyses" ON research_gap_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gap analyses" ON research_gap_analyses
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can view feedback on their own analyses
CREATE POLICY "Users can view feedback on own analyses" ON gap_analysis_feedback
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM research_gap_analyses WHERE id = analysis_id)
    OR auth.uid() = feedback_from
  );

-- Users can provide feedback
CREATE POLICY "Users can create feedback" ON gap_analysis_feedback
  FOR INSERT WITH CHECK (auth.uid() = feedback_from);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_research_gap_analyses_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER research_gap_analyses_updated_at
  BEFORE UPDATE ON research_gap_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_research_gap_analyses_timestamp();

-- Cleanup expired cache entries (optional - can be run as cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_gap_analysis_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM gap_analysis_cache WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;
