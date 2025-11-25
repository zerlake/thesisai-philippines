-- Dashboard Tables Migration
-- Created: November 24, 2024
-- Purpose: Support dashboard layouts, widget data caching, and user preferences

-- ========================================
-- 1. Dashboard Layouts Table
-- ========================================
CREATE TABLE IF NOT EXISTS dashboard_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  widgets JSONB NOT NULL DEFAULT '[]',
  is_default BOOLEAN DEFAULT FALSE,
  is_template BOOLEAN DEFAULT FALSE,
  breakpoint TEXT DEFAULT 'desktop',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- ========================================
-- 2. Widget Data Cache Table
-- ========================================
CREATE TABLE IF NOT EXISTS widget_data_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, widget_id)
);

-- ========================================
-- 3. Widget Settings Table
-- ========================================
CREATE TABLE IF NOT EXISTS widget_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_id TEXT NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, widget_id)
);

-- ========================================
-- 4. User Dashboard Preferences Table
-- ========================================
CREATE TABLE IF NOT EXISTS user_dashboard_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  default_layout_id UUID REFERENCES dashboard_layouts(id) ON DELETE SET NULL,
  auto_save BOOLEAN DEFAULT TRUE,
  auto_save_interval_ms INTEGER DEFAULT 2000,
  theme TEXT DEFAULT 'system',
  grid_size INTEGER DEFAULT 12,
  show_grid BOOLEAN DEFAULT FALSE,
  snap_to_grid BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 5. Dashboard Activity Log Table
-- ========================================
CREATE TABLE IF NOT EXISTS dashboard_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  layout_id UUID REFERENCES dashboard_layouts(id) ON DELETE SET NULL,
  widget_id TEXT,
  changes JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- Indexes for Performance
-- ========================================

-- Dashboard layouts indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_user_id 
  ON dashboard_layouts(user_id);

CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_is_default 
  ON dashboard_layouts(user_id, is_default);

CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_updated_at 
  ON dashboard_layouts(user_id, updated_at DESC);

-- Widget data cache indexes
CREATE INDEX IF NOT EXISTS idx_widget_data_cache_user_id 
  ON widget_data_cache(user_id);

CREATE INDEX IF NOT EXISTS idx_widget_data_cache_expires_at 
  ON widget_data_cache(expires_at) 
  WHERE expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_widget_data_cache_widget_id 
  ON widget_data_cache(user_id, widget_id);

-- Widget settings indexes
CREATE INDEX IF NOT EXISTS idx_widget_settings_user_id 
  ON widget_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_widget_settings_widget_id 
  ON widget_settings(user_id, widget_id);

-- Dashboard activity log indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_activity_user_id 
  ON dashboard_activity_log(user_id);

CREATE INDEX IF NOT EXISTS idx_dashboard_activity_created_at 
  ON dashboard_activity_log(user_id, created_at DESC);

-- ========================================
-- Row Level Security (RLS) Policies
-- ========================================

-- Enable RLS on all tables
ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_data_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dashboard_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_activity_log ENABLE ROW LEVEL SECURITY;

-- Dashboard Layouts Policies
CREATE POLICY dashboard_layouts_user_select ON dashboard_layouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY dashboard_layouts_user_insert ON dashboard_layouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY dashboard_layouts_user_update ON dashboard_layouts
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY dashboard_layouts_user_delete ON dashboard_layouts
  FOR DELETE USING (auth.uid() = user_id);

-- Widget Data Cache Policies
CREATE POLICY widget_data_cache_user_select ON widget_data_cache
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY widget_data_cache_user_insert ON widget_data_cache
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY widget_data_cache_user_update ON widget_data_cache
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY widget_data_cache_user_delete ON widget_data_cache
  FOR DELETE USING (auth.uid() = user_id);

-- Widget Settings Policies
CREATE POLICY widget_settings_user_select ON widget_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY widget_settings_user_insert ON widget_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY widget_settings_user_update ON widget_settings
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY widget_settings_user_delete ON widget_settings
  FOR DELETE USING (auth.uid() = user_id);

-- User Dashboard Preferences Policies
CREATE POLICY user_prefs_select ON user_dashboard_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_prefs_insert ON user_dashboard_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_prefs_update ON user_dashboard_preferences
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Dashboard Activity Log Policies
CREATE POLICY dashboard_activity_select ON dashboard_activity_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY dashboard_activity_insert ON dashboard_activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================
-- Triggers for Auto-Update Timestamps
-- ========================================

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Dashboard layouts trigger
CREATE TRIGGER dashboard_layouts_updated_at
  BEFORE UPDATE ON dashboard_layouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Widget data cache trigger
CREATE TRIGGER widget_data_cache_updated_at
  BEFORE UPDATE ON widget_data_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Widget settings trigger
CREATE TRIGGER widget_settings_updated_at
  BEFORE UPDATE ON widget_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- User preferences trigger
CREATE TRIGGER user_dashboard_preferences_updated_at
  BEFORE UPDATE ON user_dashboard_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Comments
-- ========================================

COMMENT ON TABLE dashboard_layouts IS 'Stores user dashboard layouts with widget configurations';
COMMENT ON TABLE widget_data_cache IS 'Caches widget data with TTL-based expiration';
COMMENT ON TABLE widget_settings IS 'Stores per-widget settings for each user';
COMMENT ON TABLE user_dashboard_preferences IS 'User preferences for dashboard behavior and appearance';
COMMENT ON TABLE dashboard_activity_log IS 'Activity log for auditing and analytics';
