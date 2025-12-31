-- Create payout_contests table for users to contest rejected payout requests
CREATE TABLE IF NOT EXISTS payout_contests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payout_request_id UUID REFERENCES payout_requests(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  reason TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')) DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payout_contests_payout_request_id ON payout_contests(payout_request_id);
CREATE INDEX IF NOT EXISTS idx_payout_contests_user_id ON payout_contests(user_id);
CREATE INDEX IF NOT EXISTS idx_payout_contests_status ON payout_contests(status);

-- Enable Row Level Security
ALTER TABLE payout_contests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view and update their own contests
CREATE POLICY "Users can view their own payout contests" ON payout_contests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own payout contests" ON payout_contests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own payout contests" ON payout_contests
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Admins can view all contests
CREATE POLICY "Admins can view all payout contests" ON payout_contests
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update payout contests" ON payout_contests
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );