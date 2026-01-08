-- Create user_onboarding table for enterprise gamified onboarding
-- Stores role-aware onboarding progress, preferences, and achievements

CREATE TABLE IF NOT EXISTS user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Onboarding flow state
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'advisor', 'critic')),
  current_step INT DEFAULT 0,
  completed_at TIMESTAMP,
  skipped_at TIMESTAMP,
  
  -- User context (Step 2)
  thesis_title TEXT,
  institution TEXT,
  target_defense_semester TEXT,
  language TEXT DEFAULT 'en',
  
  -- Preferences (Step 3)
  degree_level TEXT, -- 'undergrad', 'masters', 'doctoral'
  field_of_study TEXT,
  
  -- Outcomes & guidance (Step 4)
  guidance_intensity TEXT DEFAULT 'hands-on', -- 'hands-on' | 'self-guided'
  help_topics TEXT[] DEFAULT ARRAY[]::TEXT[], -- ['topic-refinement', 'rrl', 'methodology', 'defense-prep']
  
  -- Gamification
  setup_score INT DEFAULT 0, -- 0-100
  achievements TEXT[] DEFAULT ARRAY[]::TEXT[], -- badge IDs earned
  unlocked_features TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Analytics
  viewed_steps INT[] DEFAULT ARRAY[]::INT[],
  time_spent_seconds INT DEFAULT 0,
  skipped_steps INT[] DEFAULT ARRAY[]::INT[],
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own onboarding"
  ON user_onboarding FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding"
  ON user_onboarding FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding"
  ON user_onboarding FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_user_onboarding_user_id ON user_onboarding(user_id);
CREATE INDEX idx_user_onboarding_role ON user_onboarding(role);
CREATE INDEX idx_user_onboarding_completed ON user_onboarding(completed_at);

-- Create onboarding_content table for data-driven steps
CREATE TABLE IF NOT EXISTS onboarding_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content metadata
  step_number INT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'advisor', 'critic')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cta_label TEXT DEFAULT 'Next',
  skip_enabled BOOLEAN DEFAULT TRUE,
  
  -- Rich content
  body_text TEXT,
  video_url TEXT,
  video_duration_seconds INT,
  image_url TEXT,
  
  -- Form fields (if this step collects data)
  form_fields JSONB, -- [{fieldName, fieldType, label, required, placeholder}]
  
  -- UI styling
  theme TEXT DEFAULT 'default', -- 'default' | 'highlight' | 'success'
  icon_name TEXT,
  
  -- Progressive disclosure
  show_if_role TEXT,
  show_if_field TEXT,
  show_if_value TEXT,
  
  -- Analytics & optimization
  completion_rate FLOAT,
  drop_off_rate FLOAT,
  suggested_duration_seconds INT,
  
  -- Versioning for A/B testing
  variant TEXT DEFAULT 'control', -- 'control' | 'variant_a' | 'variant_b'
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  active BOOLEAN DEFAULT TRUE
);

ALTER TABLE onboarding_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active onboarding content"
  ON onboarding_content FOR SELECT
  USING (active = true);

CREATE INDEX idx_onboarding_content_role_step ON onboarding_content(role, step_number);
CREATE INDEX idx_onboarding_content_active ON onboarding_content(active);

-- Create achievement_badges table
CREATE TABLE IF NOT EXISTS achievement_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  emoji TEXT,
  icon_url TEXT,
  unlock_condition TEXT, -- 'complete_onboarding' | 'complete_step_n' | 'first_project'
  
  created_at TIMESTAMP DEFAULT now(),
  active BOOLEAN DEFAULT TRUE
);

ALTER TABLE achievement_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges"
  ON achievement_badges FOR SELECT
  USING (active = true);

-- Create user_achievements join table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES achievement_badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP DEFAULT now(),
  
  UNIQUE(user_id, badge_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_badge_id ON user_achievements(badge_id);

-- Insert initial badge definitions
INSERT INTO achievement_badges (code, name, description, emoji, unlock_condition) VALUES
  ('explorer', 'Explorer', 'Complete your first onboarding', '🔍', 'complete_onboarding'),
  ('thesis_founder', 'Thesis Founder', 'Create your first thesis project', '📚', 'first_project'),
  ('advisor_connect', 'Advisor Connect', 'Connect with your first advisor', '👥', 'connect_advisor'),
  ('milestone_setter', 'Milestone Setter', 'Set your first milestone deadline', '⏰', 'set_milestone')
ON CONFLICT (code) DO NOTHING;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_user_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_onboarding_updated_at_trigger
  BEFORE UPDATE ON user_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION update_user_onboarding_updated_at();

-- Function to calculate setup_score (0-100)
CREATE OR REPLACE FUNCTION calculate_setup_score(user_id_param UUID)
RETURNS INT AS $$
DECLARE
  score INT := 0;
BEGIN
  SELECT CASE
    WHEN role IS NOT NULL THEN score + 20 ELSE score
  END INTO score FROM user_onboarding WHERE user_id = user_id_param;
  
  SELECT score + CASE
    WHEN thesis_title IS NOT NULL THEN 20 ELSE 0
  END INTO score FROM user_onboarding WHERE user_id = user_id_param;
  
  SELECT score + CASE
    WHEN institution IS NOT NULL THEN 20 ELSE 0
  END INTO score FROM user_onboarding WHERE user_id = user_id_param;
  
  SELECT score + CASE
    WHEN target_defense_semester IS NOT NULL THEN 20 ELSE 0
  END INTO score FROM user_onboarding WHERE user_id = user_id_param;
  
  SELECT score + (ARRAY_LENGTH(help_topics, 1) * 4) INTO score FROM user_onboarding WHERE user_id = user_id_param;
  
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;
