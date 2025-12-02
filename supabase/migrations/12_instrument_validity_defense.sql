-- Instrument Validity Defense Tables Migration
-- Created: December 2024
-- Purpose: Support thesis defense preparation with instrument validity evidence

-- ========================================
-- 1. Instrument Validity Table
-- ========================================
CREATE TABLE IF NOT EXISTS instrument_validity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thesis_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instrument_name TEXT NOT NULL,
  instrument_type TEXT NOT NULL,
  description TEXT,
  metrics_json JSONB NOT NULL DEFAULT '{}',
  validity_type TEXT[] DEFAULT ARRAY[]::TEXT[],
  defense_scripts TEXT,
  pilot_test_results JSONB,
  expert_validation TEXT,
  reliability_score DECIMAL(5, 2),
  cronbachs_alpha DECIMAL(5, 3),
  sources TEXT[],
  validation_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. Defense Responses Table
-- ========================================
CREATE TABLE IF NOT EXISTS defense_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument_id UUID NOT NULL REFERENCES instrument_validity(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL,
  question_text TEXT NOT NULL,
  ai_generated_response TEXT,
  user_notes TEXT,
  practice_score INTEGER,
  is_customized BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. Defense Practice Sessions Table
-- ========================================
CREATE TABLE IF NOT EXISTS defense_practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thesis_id UUID NOT NULL,
  session_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_seconds INTEGER,
  total_questions INTEGER,
  total_score DECIMAL(5, 2),
  feedback JSONB,
  session_transcript TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. Validity Metrics Presets Table
-- ========================================
CREATE TABLE IF NOT EXISTS validity_metrics_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  instrument_types TEXT[] NOT NULL,
  metric_definitions JSONB NOT NULL,
  examples JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- Indexes for Performance
-- ========================================

CREATE INDEX IF NOT EXISTS idx_instrument_validity_user_id 
  ON instrument_validity(user_id);

CREATE INDEX IF NOT EXISTS idx_instrument_validity_thesis_id 
  ON instrument_validity(user_id, thesis_id);

CREATE INDEX IF NOT EXISTS idx_defense_responses_instrument_id 
  ON defense_responses(instrument_id);

CREATE INDEX IF NOT EXISTS idx_defense_responses_user_id 
  ON defense_responses(user_id);

CREATE INDEX IF NOT EXISTS idx_defense_practice_sessions_user_id 
  ON defense_practice_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_defense_practice_sessions_thesis_id 
  ON defense_practice_sessions(user_id, thesis_id);

-- ========================================
-- Row Level Security (RLS) Policies
-- ========================================

ALTER TABLE instrument_validity ENABLE ROW LEVEL SECURITY;
ALTER TABLE defense_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE defense_practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE validity_metrics_presets ENABLE ROW LEVEL SECURITY;

-- Instrument Validity Policies
CREATE POLICY instrument_validity_user_select ON instrument_validity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY instrument_validity_user_insert ON instrument_validity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY instrument_validity_user_update ON instrument_validity
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY instrument_validity_user_delete ON instrument_validity
  FOR DELETE USING (auth.uid() = user_id);

-- Defense Responses Policies
CREATE POLICY defense_responses_user_select ON defense_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY defense_responses_user_insert ON defense_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY defense_responses_user_update ON defense_responses
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY defense_responses_user_delete ON defense_responses
  FOR DELETE USING (auth.uid() = user_id);

-- Defense Practice Sessions Policies
CREATE POLICY defense_practice_select ON defense_practice_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY defense_practice_insert ON defense_practice_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY defense_practice_update ON defense_practice_sessions
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Validity Metrics Presets - Public read, no write
CREATE POLICY validity_presets_select ON validity_metrics_presets
  FOR SELECT USING (TRUE);

-- ========================================
-- Triggers for Auto-Update Timestamps
-- ========================================

CREATE TRIGGER instrument_validity_updated_at
  BEFORE UPDATE ON instrument_validity
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER defense_responses_updated_at
  BEFORE UPDATE ON defense_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Seed Data - Validity Metrics Presets
-- ========================================

INSERT INTO validity_metrics_presets (name, instrument_types, metric_definitions, examples)
VALUES (
  'Quantitative Survey Metrics',
  ARRAY['survey', 'questionnaire'],
  '{
    "content_validity": {
      "definition": "Extent to which items represent the construct",
      "measures": ["expert review", "content validity index (CVI)"]
    },
    "construct_validity": {
      "definition": "Extent to which instrument measures the intended construct",
      "measures": ["factor analysis", "convergent validity", "discriminant validity"]
    },
    "internal_consistency": {
      "definition": "Extent to which items correlate with each other",
      "measures": ["Cronbach alpha", "split-half reliability"]
    },
    "test_retest_reliability": {
      "definition": "Extent to which results are consistent over time",
      "measures": ["Pearson correlation", "ICC"]
    }
  }'::jsonb,
  '{
    "example_cronbachs_alpha": 0.87,
    "content_validity_index": 0.92,
    "sample_size_pilot": 50
  }'::jsonb
)
ON CONFLICT (name) DO NOTHING;

INSERT INTO validity_metrics_presets (name, instrument_types, metric_definitions, examples)
VALUES (
  'Qualitative Interview Metrics',
  ARRAY['interview', 'focus-group'],
  '{
    "credibility": {
      "definition": "Extent to which findings are believable and accurate",
      "measures": ["member checking", "prolonged engagement", "triangulation"]
    },
    "dependability": {
      "definition": "Extent to which process is consistent and systematic",
      "measures": ["audit trail", "detailed methodology"]
    },
    "confirmability": {
      "definition": "Extent to which findings are grounded in data, not researcher bias",
      "measures": ["reflexivity", "data triangulation"]
    },
    "transferability": {
      "definition": "Extent to which findings are applicable to other contexts",
      "measures": ["thick description", "purposive sampling"]
    }
  }'::jsonb,
  '{
    "sample_size": 15,
    "interview_duration_minutes": 45,
    "coding_method": "thematic analysis"
  }'::jsonb
)
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- Comments
-- ========================================

COMMENT ON TABLE instrument_validity IS 'Stores research instrument validity evidence and defense scripts';
COMMENT ON TABLE defense_responses IS 'Stores pre-generated and custom defense responses to common panel questions';
COMMENT ON TABLE defense_practice_sessions IS 'Records practice sessions with AI scoring and feedback';
COMMENT ON TABLE validity_metrics_presets IS 'Reusable templates for instrument validity metrics';

COMMENT ON COLUMN instrument_validity.metrics_json IS 'JSON object containing validity metrics (content, construct, reliability, etc.)';
COMMENT ON COLUMN instrument_validity.defense_scripts IS 'Generated script for defending instrument validity to panel';
COMMENT ON COLUMN defense_responses.practice_score IS 'Puter AI score of response quality (0-100)';
COMMENT ON COLUMN defense_practice_sessions.total_score IS 'Overall score across all practice questions';
