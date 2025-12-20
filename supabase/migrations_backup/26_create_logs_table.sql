-- Create logs table for centralized logging system
CREATE TABLE IF NOT EXISTS public.logs (
  id UUID PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'critical')),
  message TEXT NOT NULL,
  context JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  stack_trace TEXT,
  url TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON public.logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_level ON public.logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON public.logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_level_timestamp ON public.logs(level, timestamp DESC);

-- Enable Row Level Security
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admin users can view all logs
CREATE POLICY "Admin users can view all logs"
ON public.logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy: System can insert logs (for API route)
CREATE POLICY "System can insert logs"
ON public.logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Admin users can delete old logs
CREATE POLICY "Admin users can delete logs"
ON public.logs
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Grant necessary permissions
GRANT SELECT, INSERT, DELETE ON public.logs TO authenticated;
GRANT SELECT ON public.logs TO anon;

-- Add comment for documentation
COMMENT ON TABLE public.logs IS 'Centralized logging system for application-wide error tracking and monitoring';
