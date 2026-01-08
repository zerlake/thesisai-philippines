-- ============================================================================
-- RATE LIMITING DATABASE MIGRATION FOR THESISAI
-- ============================================================================
-- Deploy this to: https://dnyjgzzfyzrsucucexhy.supabase.co
-- Navigate to: SQL Editor → New Query → Paste → Run
-- ============================================================================

-- ============================================================================
-- 1. RATE LIMIT VIOLATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.rate_limit_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  identifier_type TEXT NOT NULL CHECK (identifier_type IN ('user_id', 'ip', 'email', 'ip_user_pair')),
  identifier_value TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  endpoint_path TEXT,
  violation_type TEXT NOT NULL CHECK (violation_type IN ('daily_quota', 'per_minute', 'auth_failures')),
  limit_threshold INTEGER NOT NULL,
  actual_count INTEGER NOT NULL,
  window_start TIMESTAMP WITH TIME ZONE,
  window_end TIMESTAMP WITH TIME ZONE,
  ip_address INET,
  user_agent TEXT,
  action_taken TEXT CHECK (action_taken IN ('logged', 'blocked', 'captcha_required')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rate_limit_violations_user_id ON public.rate_limit_violations(user_id);
CREATE INDEX IF NOT EXISTS idx_rate_limit_violations_identifier ON public.rate_limit_violations(identifier_type, identifier_value);
CREATE INDEX IF NOT EXISTS idx_rate_limit_violations_feature ON public.rate_limit_violations(feature_name);
CREATE INDEX IF NOT EXISTS idx_rate_limit_violations_created_at ON public.rate_limit_violations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limit_violations_violation_type ON public.rate_limit_violations(violation_type);

-- RLS Policies
ALTER TABLE public.rate_limit_violations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view all violations" ON public.rate_limit_violations
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Service role inserts violations" ON public.rate_limit_violations
  FOR INSERT TO service_role
  WITH CHECK (true);

-- ============================================================================
-- 2. RATE LIMIT WHITELIST RULES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.rate_limit_whitelist_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL UNIQUE,
  organization_id TEXT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  quota_multiplier NUMERIC(5,2) DEFAULT 1.00 CHECK (quota_multiplier >= 0),
  is_unlimited BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  notes TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_whitelist_rules_org ON public.rate_limit_whitelist_rules(organization_id);
CREATE INDEX IF NOT EXISTS idx_whitelist_rules_user ON public.rate_limit_whitelist_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_whitelist_rules_feature ON public.rate_limit_whitelist_rules(feature_name);
CREATE INDEX IF NOT EXISTS idx_whitelist_rules_active ON public.rate_limit_whitelist_rules(is_active, expires_at);

-- RLS Policies
ALTER TABLE public.rate_limit_whitelist_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage whitelist rules" ON public.rate_limit_whitelist_rules
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_whitelist_rules_updated_at
  BEFORE UPDATE ON public.rate_limit_whitelist_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. AUTH FAILURE TRACKING
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.auth_failure_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier_type TEXT NOT NULL CHECK (identifier_type IN ('ip', 'email', 'ip_email_pair')),
  identifier_value TEXT NOT NULL,
  additional_identifier TEXT,
  failure_count INTEGER DEFAULT 1,
  last_failure_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  first_failure_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  captcha_required BOOLEAN DEFAULT false,
  device_fingerprint TEXT,
  ip_address INET,
  user_agent TEXT,
  is_suspicious BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_auth_failures_identifier ON public.auth_failure_tracking(identifier_type, identifier_value);
CREATE INDEX IF NOT EXISTS idx_auth_failures_blocked_until ON public.auth_failure_tracking(blocked_until);
CREATE INDEX IF NOT EXISTS idx_auth_failures_created_at ON public.auth_failure_tracking(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_failures_ip_address ON public.auth_failure_tracking(ip_address);

-- RLS Policies
ALTER TABLE public.auth_failure_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages auth failures" ON public.auth_failure_tracking
  FOR ALL TO service_role
  WITH CHECK (true);

-- ============================================================================
-- 4. API METRICS HOURLY
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.api_metrics_hourly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hour_start TIMESTAMP WITH TIME ZONE NOT NULL,
  endpoint_path TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  total_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  rate_limited_requests INTEGER DEFAULT 0,
  status_4xx INTEGER DEFAULT 0,
  status_5xx INTEGER DEFAULT 0,
  avg_response_time_ms NUMERIC(10,2),
  unique_users INTEGER DEFAULT 0,
  unique_ips INTEGER DEFAULT 0,
  max_requests_per_user INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(hour_start, endpoint_path, feature_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_api_metrics_hourly_hour ON public.api_metrics_hourly(hour_start DESC);
CREATE INDEX IF NOT EXISTS idx_api_metrics_hourly_endpoint ON public.api_metrics_hourly(endpoint_path);
CREATE INDEX IF NOT EXISTS idx_api_metrics_hourly_feature ON public.api_metrics_hourly(feature_name);

-- RLS Policies
ALTER TABLE public.api_metrics_hourly ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view metrics" ON public.api_metrics_hourly
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Service role manages metrics" ON public.api_metrics_hourly
  FOR ALL TO service_role
  WITH CHECK (true);

-- ============================================================================
-- 5. USER FEATURE USAGE DAILY
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_feature_usage_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  feature_name TEXT NOT NULL,
  usage_date DATE NOT NULL,
  total_uses INTEGER DEFAULT 0,
  plan_limit INTEGER,
  exceeded_limit BOOLEAN DEFAULT false,
  reset_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, feature_name, usage_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_usage_daily_user ON public.user_feature_usage_daily(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_daily_date ON public.user_feature_usage_daily(usage_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_usage_daily_feature ON public.user_feature_usage_daily(feature_name);
CREATE INDEX IF NOT EXISTS idx_user_usage_daily_exceeded ON public.user_feature_usage_daily(exceeded_limit) WHERE exceeded_limit = true;

-- RLS Policies
ALTER TABLE public.user_feature_usage_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own usage" ON public.user_feature_usage_daily
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all usage" ON public.user_feature_usage_daily
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Service role manages usage" ON public.user_feature_usage_daily
  FOR ALL TO service_role
  WITH CHECK (true);

-- Update trigger
CREATE TRIGGER update_user_usage_daily_updated_at
  BEFORE UPDATE ON public.user_feature_usage_daily
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. DATABASE FUNCTIONS
-- ============================================================================

-- Function: Increment auth failure tracking
CREATE OR REPLACE FUNCTION increment_auth_failure(
  p_identifier_type TEXT,
  p_identifier_value TEXT,
  p_additional_identifier TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_device_fingerprint TEXT DEFAULT NULL
)
RETURNS TABLE(
  failure_count INTEGER,
  is_blocked BOOLEAN,
  blocked_until TIMESTAMP WITH TIME ZONE,
  captcha_required BOOLEAN
) LANGUAGE plpgsql AS $$
DECLARE
  v_record RECORD;
  v_max_failures INTEGER := COALESCE(NULLIF(current_setting('auth_failure_max_attempts', true), '')::INTEGER, 5);
  v_block_duration_minutes INTEGER := COALESCE(NULLIF(current_setting('auth_failure_block_minutes', true), '')::INTEGER, 15);
  v_blocked_until TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get or create auth failure record
  SELECT * INTO v_record
  FROM public.auth_failure_tracking
  WHERE identifier_type = p_identifier_type
    AND identifier_value = p_identifier_value
    AND (additional_identifier IS NULL OR additional_identifier = p_additional_identifier)
    AND (blocked_until IS NULL OR blocked_until < NOW())
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.auth_failure_tracking (
      identifier_type, identifier_value, additional_identifier,
      ip_address, user_agent, device_fingerprint
    ) VALUES (
      p_identifier_type, p_identifier_value, p_additional_identifier,
      p_ip_address, p_user_agent, p_device_fingerprint
    )
    RETURNING * INTO v_record;

    v_record.failure_count := 1;
  ELSE
    UPDATE public.auth_failure_tracking
    SET failure_count = failure_count + 1,
        last_failure_at = NOW(),
        ip_address = COALESCE(p_ip_address, ip_address),
        user_agent = COALESCE(p_user_agent, user_agent)
    WHERE id = v_record.id;

    v_record.failure_count := v_record.failure_count + 1;
  END IF;

  -- Check if should be blocked or require captcha
  IF v_record.failure_count >= v_max_failures THEN
    v_blocked_until := NOW() + (v_block_duration_minutes || ' minutes')::INTERVAL;

    UPDATE public.auth_failure_tracking
    SET blocked_until = v_blocked_until,
        captcha_required = TRUE
    WHERE id = v_record.id;
  END IF;

  RETURN QUERY SELECT
    v_record.failure_count,
    (v_record.failure_count >= v_max_failures) as is_blocked,
    v_blocked_until,
    v_record.captcha_required;
END;
$$;

-- Function: Reset auth failure on successful login
CREATE OR REPLACE FUNCTION reset_auth_failure(
  p_identifier_type TEXT,
  p_identifier_value TEXT
)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM public.auth_failure_tracking
  WHERE identifier_type = p_identifier_type
    AND identifier_value = p_identifier_value;
END;
$$;

-- Function: Check whitelist rules for rate limit adjustments
CREATE OR REPLACE FUNCTION get_rate_limit_adjustments(
  p_user_id UUID,
  p_feature_name TEXT,
  p_organization_id TEXT DEFAULT NULL
)
RETURNS TABLE(
  quota_multiplier NUMERIC(5,2),
  is_unlimited BOOLEAN
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY SELECT
    COALESCE(MAX(rlwr.quota_multiplier), 1.00) as quota_multiplier,
    COALESCE(BOOL_OR(rlwr.is_unlimited), FALSE) as is_unlimited
  FROM public.rate_limit_whitelist_rules rlwr
  WHERE rlwr.feature_name = p_feature_name
    AND rlwr.is_active = TRUE
    AND (rlwr.expires_at IS NULL OR rlwr.expires_at > NOW())
    AND (
      rlwr.user_id = p_user_id
      OR (p_organization_id IS NOT NULL AND rlwr.organization_id = p_organization_id)
      OR (rlwr.user_id IS NULL AND rlwr.organization_id IS NULL)
    );
END;
$$;

-- Function: Get user plan for rate limiting
CREATE OR REPLACE FUNCTION get_user_plan_limits(
  p_user_id UUID
)
RETURNS TABLE(
  plan TEXT,
  ai_completions_per_day INTEGER,
  pdf_analysis_per_day INTEGER,
  paper_search_per_day INTEGER,
  originality_checks_per_month INTEGER,
  core_requests_per_15min INTEGER
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_plan TEXT;
BEGIN
  SELECT plan INTO v_plan FROM public.profiles WHERE id = p_user_id;

  CASE v_plan
    WHEN 'pro_complete' THEN
      RETURN QUERY SELECT
        'pro_complete' as plan,
        NULL::INTEGER as ai_completions_per_day,
        NULL::INTEGER as pdf_analysis_per_day,
        NULL::INTEGER as paper_search_per_day,
        NULL::INTEGER as originality_checks_per_month,
        5000 as core_requests_per_15min;
    WHEN 'pro_plus_advisor' THEN
      RETURN QUERY SELECT
        'pro_plus_advisor' as plan,
        200 as ai_completions_per_day,
        50 as pdf_analysis_per_day,
        500 as paper_search_per_day,
        NULL::INTEGER as originality_checks_per_month,
        3000 as core_requests_per_15min;
    WHEN 'pro' THEN
      RETURN QUERY SELECT
        'pro' as plan,
        100 as ai_completions_per_day,
        20 as pdf_analysis_per_day,
        200 as paper_search_per_day,
        NULL::INTEGER as originality_checks_per_month,
        2000 as core_requests_per_15min;
    ELSE -- free or unknown
      RETURN QUERY SELECT
        COALESCE(v_plan, 'free') as plan,
        10 as ai_completions_per_day,
        3 as pdf_analysis_per_day,
        20 as paper_search_per_day,
        10 as originality_checks_per_month,
        1000 as core_requests_per_15min;
  END CASE;
END;
$$;

-- Function: Increment user feature usage
CREATE OR REPLACE FUNCTION increment_feature_usage(
  p_user_id UUID,
  p_feature_name TEXT,
  p_plan_limit INTEGER DEFAULT NULL
)
RETURNS TABLE(
  total_uses INTEGER,
  exceeded_limit BOOLEAN,
  plan_limit INTEGER,
  reset_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_usage_date DATE := CURRENT_DATE;
  v_reset_at TIMESTAMP WITH TIME ZONE := (v_usage_date + INTERVAL '1 day');
  v_exceeded BOOLEAN := FALSE;
  v_total INTEGER := 0;
BEGIN
  -- Insert or update usage record
  INSERT INTO public.user_feature_usage_daily (
    user_id, feature_name, usage_date, total_uses, plan_limit, exceeded_limit, reset_at
  ) VALUES (
    p_user_id, p_feature_name, v_usage_date, 1, p_plan_limit, FALSE, v_reset_at
  )
  ON CONFLICT (user_id, feature_name, usage_date)
  DO UPDATE SET
    total_uses = user_feature_usage_daily.total_uses + 1,
    updated_at = NOW(),
    plan_limit = COALESCE(EXCLUDED.plan_limit, p_plan_limit)
  RETURNING total_uses, exceeded_limit, plan_limit, reset_at
  INTO v_total, v_exceeded, p_plan_limit, v_reset_at;

  -- Check if limit exceeded
  IF p_plan_limit IS NOT NULL AND v_total > p_plan_limit THEN
    v_exceeded := TRUE;
    UPDATE public.user_feature_usage_daily
    SET exceeded_limit = TRUE
    WHERE user_id = p_user_id
      AND feature_name = p_feature_name
      AND usage_date = v_usage_date;
  END IF;

  RETURN QUERY SELECT v_total, v_exceeded, p_plan_limit, v_reset_at;
END;
$$;

-- ============================================================================
-- 7. HELPER VIEWS
-- ============================================================================

-- View: Recent violations summary
CREATE OR REPLACE VIEW rate_limit_violations_summary AS
SELECT
  feature_name,
  violation_type,
  COUNT(*) as violation_count,
  COUNT(DISTINCT user_id) as affected_users,
  COUNT(DISTINCT identifier_value) as unique_identifiers,
  MAX(actual_count - limit_threshold) as max_excess,
  MIN(created_at) as first_seen,
  MAX(created_at) as last_seen
FROM public.rate_limit_violations
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY feature_name, violation_type
ORDER BY violation_count DESC;

-- View: Top users by violations
CREATE OR REPLACE VIEW top_violating_users AS
SELECT
  user_id,
  p.full_name,
  p.email,
  COUNT(*) as total_violations,
  COUNT(DISTINCT feature_name) as features_violated,
  MAX(r.created_at) as last_violation
FROM public.rate_limit_violations r
LEFT JOIN public.profiles p ON r.user_id = p.id
WHERE r.created_at > NOW() - INTERVAL '30 days'
  AND r.user_id IS NOT NULL
GROUP BY user_id, p.full_name, p.email
ORDER BY total_violations DESC
LIMIT 100;

-- ============================================================================
-- 8. CLEANUP JOB
-- ============================================================================

-- Function to clean up old records
CREATE OR REPLACE FUNCTION cleanup_rate_limit_data()
RETURNS TEXT AS $$
DECLARE
  v_deleted_violations INTEGER;
  v_deleted_auth_failures INTEGER;
  v_deleted_metrics INTEGER;
BEGIN
  -- Delete violations older than 90 days
  DELETE FROM public.rate_limit_violations
  WHERE created_at < NOW() - INTERVAL '90 days';
  GET DIAGNOSTICS v_deleted_violations = ROW_COUNT;

  -- Delete auth failure records older than 30 days and not blocked
  DELETE FROM public.auth_failure_tracking
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND (blocked_until IS NULL OR blocked_until < NOW());
  GET DIAGNOSTICS v_deleted_auth_failures = ROW_COUNT;

  -- Delete metrics older than 1 year
  DELETE FROM public.api_metrics_hourly
  WHERE hour_start < NOW() - INTERVAL '1 year';
  GET DIAGNOSTICS v_deleted_metrics = ROW_COUNT;

  RETURN format('Deleted %s violations, %s auth failures, %s metrics records',
    v_deleted_violations, v_deleted_auth_failures, v_deleted_metrics);
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Comments
COMMENT ON TABLE public.rate_limit_violations IS 'Tracks all rate limit violations for analytics and abuse detection';
COMMENT ON TABLE public.rate_limit_whitelist_rules IS 'Whitelist/exception rules for specific users or organizations';
COMMENT ON TABLE public.auth_failure_tracking IS 'Tracks failed authentication attempts for brute-force protection';
COMMENT ON TABLE public.api_metrics_hourly IS 'Hourly aggregated API metrics for monitoring';
COMMENT ON TABLE public.user_feature_usage_daily IS 'Daily usage tracking per user and feature for quota enforcement';
