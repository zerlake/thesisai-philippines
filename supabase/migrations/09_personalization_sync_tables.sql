-- Sync changes table for tracking preference changes
CREATE TABLE IF NOT EXISTS sync_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id VARCHAR(255) NOT NULL,
  change_type VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
  section VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  is_synced BOOLEAN DEFAULT FALSE,
  sync_timestamp TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_changes_user ON sync_changes(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_changes_device ON sync_changes(user_id, device_id);
CREATE INDEX IF NOT EXISTS idx_sync_changes_synced ON sync_changes(user_id, is_synced);
CREATE INDEX IF NOT EXISTS idx_sync_changes_created ON sync_changes(created_at DESC);

ALTER TABLE sync_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sync changes" ON sync_changes
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync changes" ON sync_changes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Sync conflicts table for tracking and resolving conflicts
CREATE TABLE IF NOT EXISTS sync_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section VARCHAR(100) NOT NULL,
  source_device_id VARCHAR(255) NOT NULL,
  target_device_id VARCHAR(255),
  source_value JSONB NOT NULL,
  target_value JSONB NOT NULL,
  resolution_method VARCHAR(50), -- 'timestamp', 'user_preference', 'merge'
  resolved_value JSONB,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_sync_conflicts_user ON sync_conflicts(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_unresolved ON sync_conflicts(user_id, is_resolved);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_created ON sync_conflicts(created_at DESC);

ALTER TABLE sync_conflicts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conflicts" ON sync_conflicts
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conflicts" ON sync_conflicts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conflicts" ON sync_conflicts
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
