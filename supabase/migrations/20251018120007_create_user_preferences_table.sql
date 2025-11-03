CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    dashboard_widgets JSONB DEFAULT '{}',
    notification_preferences JSONB DEFAULT '{}',
    quick_access_tools JSONB DEFAULT '{}',
    thesis_deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own preferences
CREATE POLICY "Users can insert own preferences" ON user_preferences
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own preferences
CREATE POLICY "Users can update own preferences" ON user_preferences
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to delete their own preferences
CREATE POLICY "Users can delete own preferences" ON user_preferences
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Create trigger to update the `updated_at` column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON user_preferences 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();