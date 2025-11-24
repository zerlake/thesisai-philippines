-- User behavior logs table for adaptive interface
CREATE TABLE IF NOT EXISTS user_behavior_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) NOT NULL, -- 'click', 'hover', 'focus', 'scroll', 'feature_usage'
  feature_name VARCHAR(255),
  feature_category VARCHAR(100),
  duration_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_behavior_logs_user ON user_behavior_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_session ON user_behavior_logs(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_feature ON user_behavior_logs(user_id, feature_name);
CREATE INDEX IF NOT EXISTS idx_behavior_logs_created ON user_behavior_logs(created_at DESC);

ALTER TABLE user_behavior_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own behavior logs" ON user_behavior_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- User patterns table for ML-based insights
CREATE TABLE IF NOT EXISTS user_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  detected_patterns JSONB DEFAULT '[]',
  customization_level NUMERIC(3,2) DEFAULT 0.5, -- 0-1 score
  feature_recommendations JSONB DEFAULT '[]',
  learning_data JSONB DEFAULT '{}',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_patterns_user ON user_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_user_patterns_updated ON user_patterns(last_updated DESC);

ALTER TABLE user_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own patterns" ON user_patterns
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own patterns" ON user_patterns
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own patterns" ON user_patterns
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Notifications table for smart notification system
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50) NOT NULL, -- 'system', 'feature', 'recommendation', 'alert'
  priority NUMERIC(1,0) DEFAULT 1, -- 1-5 scale
  channels TEXT[] DEFAULT '{in_app}', -- 'in_app', 'email', 'push'
  data JSONB DEFAULT '{}',
  read_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_expires ON notifications(expires_at);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
