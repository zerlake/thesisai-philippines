-- Create financial_audit_trail table for tracking financial actions including payouts
CREATE TABLE IF NOT EXISTS financial_audit_trail (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL CHECK (action IN ('payout_requested', 'payout_approved', 'payout_rejected', 'payout_processed', 'payout_cancelled', 'referral_flagged', 'user_role_changed', 'fraud_confirmed', 'other')),
  user_id UUID REFERENCES profiles(id), -- Admin who performed the action
  target_user_id UUID REFERENCES profiles(id), -- User affected by the action
  resource_type TEXT, -- Type of resource (e.g., 'payout_request', 'referral_event')
  resource_id UUID, -- ID of the specific resource
  severity TEXT CHECK (severity IN ('info', 'warning', 'error', 'critical')) DEFAULT 'info',
  details JSONB, -- Additional details about the action
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_financial_audit_trail_user_id ON financial_audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_audit_trail_target_user_id ON financial_audit_trail(target_user_id);
CREATE INDEX IF NOT EXISTS idx_financial_audit_trail_action ON financial_audit_trail(action);
CREATE INDEX IF NOT EXISTS idx_financial_audit_trail_created_at ON financial_audit_trail(created_at);

-- Enable Row Level Security
ALTER TABLE financial_audit_trail ENABLE ROW LEVEL SECURITY;

-- Create RLS policy - admins can view all, users can only view their own
CREATE POLICY "Admins can view all financial audit logs" ON financial_audit_trail
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can view their own financial audit logs" ON financial_audit_trail
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR target_user_id = auth.uid()
  );

-- Allow service role to insert audit logs
CREATE POLICY "Service role can insert financial audit logs" ON financial_audit_trail
  FOR INSERT TO service_role
  WITH CHECK (true);