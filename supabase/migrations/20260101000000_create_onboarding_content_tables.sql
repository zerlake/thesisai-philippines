-- User Onboarding Content Management Tables Migration
-- Created: January 1, 2026
-- Purpose: Support user onboarding content, guides, documentation, and analytics

-- ========================================
-- 1. User Onboarding Documentation Table
-- ========================================
CREATE TABLE IF NOT EXISTS onboarding_documentation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  views_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0.0,
  feedback_score DECIMAL(3,2) DEFAULT 0.0
);

-- ========================================
-- 2. User Onboarding Guides Table
-- ========================================
CREATE TABLE IF NOT EXISTS onboarding_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  section TEXT,
  completion_rate DECIMAL(5,2) DEFAULT 0.0,
  time_spent_minutes INTEGER DEFAULT 0,
  users_completed INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- ========================================
-- 3. Frequently Asked Questions (FAQ) Table
-- ========================================
CREATE TABLE IF NOT EXISTS onboarding_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  views_count INTEGER DEFAULT 0,
  search_volume INTEGER DEFAULT 0,
  resolved BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. User Onboarding Analytics Table
-- ========================================
CREATE TABLE IF NOT EXISTS onboarding_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  documentation_id UUID REFERENCES onboarding_documentation(id) ON DELETE SET NULL,
  guide_id UUID REFERENCES onboarding_guides(id) ON DELETE SET NULL,
  faq_id UUID REFERENCES onboarding_faqs(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('view', 'complete', 'search', 'feedback')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 5. User Onboarding Feedback Table
-- ========================================
CREATE TABLE IF NOT EXISTS onboarding_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  documentation_id UUID REFERENCES onboarding_documentation(id) ON DELETE SET NULL,
  guide_id UUID REFERENCES onboarding_guides(id) ON DELETE SET NULL,
  faq_id UUID REFERENCES onboarding_faqs(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- Indexes for Performance
-- ========================================

-- Documentation indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_docs_slug
  ON onboarding_documentation(slug);

CREATE INDEX IF NOT EXISTS idx_onboarding_docs_status
  ON onboarding_documentation(status);

CREATE INDEX IF NOT EXISTS idx_onboarding_docs_category
  ON onboarding_documentation(category);

CREATE INDEX IF NOT EXISTS idx_onboarding_docs_author
  ON onboarding_documentation(author_id);

-- Guides indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_guides_slug
  ON onboarding_guides(slug);

CREATE INDEX IF NOT EXISTS idx_onboarding_guides_status
  ON onboarding_guides(status);

CREATE INDEX IF NOT EXISTS idx_onboarding_guides_section
  ON onboarding_guides(section);

CREATE INDEX IF NOT EXISTS idx_onboarding_guides_author
  ON onboarding_guides(author_id);

-- FAQ indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_faqs_category
  ON onboarding_faqs(category);

CREATE INDEX IF NOT EXISTS idx_onboarding_faqs_status
  ON onboarding_faqs(status);

CREATE INDEX IF NOT EXISTS idx_onboarding_faqs_resolved
  ON onboarding_faqs(resolved);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_analytics_user
  ON onboarding_analytics(user_id);

CREATE INDEX IF NOT EXISTS idx_onboarding_analytics_action
  ON onboarding_analytics(action);

CREATE INDEX IF NOT EXISTS idx_onboarding_analytics_created_at
  ON onboarding_analytics(created_at);

-- Feedback indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_feedback_user
  ON onboarding_feedback(user_id);

CREATE INDEX IF NOT EXISTS idx_onboarding_feedback_rating
  ON onboarding_feedback(rating);

-- ========================================
-- Row Level Security (RLS) Policies
-- ========================================

-- Enable RLS on all tables
ALTER TABLE onboarding_documentation ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_feedback ENABLE ROW LEVEL SECURITY;

-- Documentation Policies
CREATE POLICY onboarding_docs_admin_all ON onboarding_documentation
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Guides Policies
CREATE POLICY onboarding_guides_admin_all ON onboarding_guides
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- FAQ Policies
CREATE POLICY onboarding_faqs_admin_all ON onboarding_faqs
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Analytics Policies (read-only for users, full access for admins)
CREATE POLICY onboarding_analytics_user_select ON onboarding_analytics
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY onboarding_analytics_admin_all ON onboarding_analytics
  FOR ALL TO service_role USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Feedback Policies
CREATE POLICY onboarding_feedback_user_select ON onboarding_feedback
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY onboarding_feedback_user_insert ON onboarding_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY onboarding_feedback_user_update ON onboarding_feedback
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ========================================
-- Triggers for Auto-Update Timestamps
-- ========================================

-- Trigger function for updated_at (if not already created)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Documentation trigger
CREATE TRIGGER onboarding_docs_updated_at
  BEFORE UPDATE ON onboarding_documentation
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Guides trigger
CREATE TRIGGER onboarding_guides_updated_at
  BEFORE UPDATE ON onboarding_guides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- FAQs trigger
CREATE TRIGGER onboarding_faqs_updated_at
  BEFORE UPDATE ON onboarding_faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Comments
-- ========================================

COMMENT ON TABLE onboarding_documentation IS 'Documentation content for user onboarding';
COMMENT ON TABLE onboarding_guides IS 'Interactive guides for user onboarding';
COMMENT ON TABLE onboarding_faqs IS 'Frequently asked questions for user onboarding';
COMMENT ON TABLE onboarding_analytics IS 'Analytics tracking for user onboarding content';
COMMENT ON TABLE onboarding_feedback IS 'User feedback on onboarding content';