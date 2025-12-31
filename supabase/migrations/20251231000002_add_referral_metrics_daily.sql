-- Migration: Add Daily Referral Metrics for Time-Series Analysis
-- Priority 3: Enables charts, anomaly detection, month-over-month growth, forecasting

-- Daily metrics table
CREATE TABLE IF NOT EXISTS public.referral_metrics_daily (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

    -- Date tracking
    metric_date DATE NOT NULL UNIQUE,

    -- Referral creation metrics
    referrals_created INTEGER DEFAULT 0,
    referrals_student_subscription INTEGER DEFAULT 0,
    referrals_advisor_recruitment INTEGER DEFAULT 0,
    referrals_critic_recruitment INTEGER DEFAULT 0,

    -- Referral status transitions
    referrals_approved INTEGER DEFAULT 0,
    referrals_rejected INTEGER DEFAULT 0,
    referrals_paid INTEGER DEFAULT 0,

    -- Payout metrics
    payouts_requested INTEGER DEFAULT 0,
    payouts_approved INTEGER DEFAULT 0,
    payouts_completed INTEGER DEFAULT 0,
    payout_total_amount DECIMAL(12,2) DEFAULT 0.00,

    -- Pool metrics
    pool_delta DECIMAL(12,2) DEFAULT 0.00,
    pool_available DECIMAL(12,2) DEFAULT 0.00,
    pool_student_available DECIMAL(12,2) DEFAULT 0.00,
    pool_advisor_available DECIMAL(12,2) DEFAULT 0.00,
    pool_critic_available DECIMAL(12,2) DEFAULT 0.00,

    -- Fraud and risk metrics
    fraud_flags INTEGER DEFAULT 0,
    risk_assessments INTEGER DEFAULT 0,
    suspicious_referrals INTEGER DEFAULT 0,

    -- Revenue metrics
    revenue_confirmed DECIMAL(12,2) DEFAULT 0.00,
    revenue_allocated DECIMAL(12,2) DEFAULT 0.00,

    -- User metrics
    unique_referrers INTEGER DEFAULT 0,
    new_referrers INTEGER DEFAULT 0,
    active_referrers INTEGER DEFAULT 0,

    -- Performance metrics
    avg_referral_value DECIMAL(10,2) DEFAULT 0.00,
    approval_rate DECIMAL(5,2) DEFAULT 0.00,
    conversion_rate DECIMAL(5,2) DEFAULT 0.00,

    -- Tier metrics
    tier_upgrades INTEGER DEFAULT 0,
    tier_0_users INTEGER DEFAULT 0,
    tier_1_users INTEGER DEFAULT 0,
    tier_2_users INTEGER DEFAULT 0,
    tier_3_users INTEGER DEFAULT 0,
    tier_4_users INTEGER DEFAULT 0,
    tier_5_users INTEGER DEFAULT 0,

    -- Metadata
    data_quality_score INTEGER DEFAULT 100, -- 0-100 score indicating data completeness

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient time-series queries
CREATE INDEX IF NOT EXISTS idx_referral_metrics_date ON public.referral_metrics_daily(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_referral_metrics_created ON public.referral_metrics_daily(created_at DESC);

-- RLS Policies
ALTER TABLE public.referral_metrics_daily ENABLE ROW LEVEL SECURITY;

-- Admins only - metrics are for admin reporting
CREATE POLICY "Admins only access metrics" ON public.referral_metrics_daily
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role_type = 'admin'
        )
    );

-- Function to aggregate daily metrics (runs via cron)
DROP FUNCTION IF EXISTS aggregate_daily_referral_metrics(DATE);
CREATE OR REPLACE FUNCTION aggregate_daily_referral_metrics(p_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
DECLARE
    v_referrals_created INTEGER;
    v_referrals_approved INTEGER;
    v_referrals_rejected INTEGER;
    v_payouts_completed INTEGER;
    v_payout_total DECIMAL(12,2);
    v_fraud_flags INTEGER;
    v_unique_referrers INTEGER;
    v_avg_referral_value DECIMAL(10,2);
    v_approval_rate DECIMAL(5,2);
BEGIN
    -- Get referral counts for the day
    SELECT COUNT(*)
    INTO v_referrals_created
    FROM public.referral_events
    WHERE DATE(created_at) = p_date;

    SELECT COUNT(*)
    INTO v_referrals_approved
    FROM public.referral_events
    WHERE DATE(created_at) = p_date AND status = 'approved';

    SELECT COUNT(*)
    INTO v_referrals_rejected
    FROM public.referral_events
    WHERE DATE(created_at) = p_date AND status = 'rejected';

    -- Get payout metrics
    SELECT COUNT(*), COALESCE(SUM(amount), 0)
    INTO v_payouts_completed, v_payout_total
    FROM public.payouts
    WHERE DATE(created_at) = p_date AND status = 'paid';

    -- Get fraud flags
    SELECT COUNT(*)
    INTO v_fraud_flags
    FROM public.referral_audits
    WHERE DATE(created_at) = p_date;

    -- Get unique referrers
    SELECT COUNT(DISTINCT referrer_id)
    INTO v_unique_referrers
    FROM public.referral_events
    WHERE DATE(created_at) = p_date;

    -- Calculate average referral value
    SELECT COALESCE(AVG(commission_amount), 0)
    INTO v_avg_referral_value
    FROM public.referral_events
    WHERE DATE(created_at) = p_date AND commission_amount > 0;

    -- Calculate approval rate
    IF v_referrals_created > 0 THEN
        v_approval_rate := ROUND((v_referrals_approved::DECIMAL / v_referrals_created::DECIMAL) * 100, 2);
    END IF;

    -- Insert or update daily metrics
    INSERT INTO public.referral_metrics_daily (
        metric_date,
        referrals_created,
        referrals_approved,
        referrals_rejected,
        payouts_completed,
        payout_total_amount,
        fraud_flags,
        unique_referrers,
        avg_referral_value,
        approval_rate
    ) VALUES (
        p_date,
        v_referrals_created,
        v_referrals_approved,
        v_referrals_rejected,
        v_payouts_completed,
        v_payout_total,
        v_fraud_flags,
        v_unique_referrers,
        v_avg_referral_value,
        v_approval_rate
    )
    ON CONFLICT (metric_date) DO UPDATE SET
        referrals_created = v_referrals_created,
        referrals_approved = v_referrals_approved,
        referrals_rejected = v_referrals_rejected,
        payouts_completed = v_payouts_completed,
        payout_total_amount = v_payout_total,
        fraud_flags = v_fraud_flags,
        unique_referrers = v_unique_referrers,
        avg_referral_value = v_avg_referral_value,
        approval_rate = v_approval_rate,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Updated timestamp trigger
DROP FUNCTION IF EXISTS update_referral_metrics_timestamp();
CREATE OR REPLACE FUNCTION update_referral_metrics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_referral_metrics_timestamp
    BEFORE UPDATE ON public.referral_metrics_daily
    FOR EACH ROW EXECUTE FUNCTION update_referral_metrics_timestamp();

-- Function to get metrics for a date range (for charts)
DROP FUNCTION IF EXISTS get_referral_metrics_range(DATE, DATE);
CREATE OR REPLACE FUNCTION get_referral_metrics_range(p_start_date DATE, p_end_date DATE)
RETURNS TABLE(
    metric_date DATE,
    referrals_created INTEGER,
    referrals_approved INTEGER,
    referrals_rejected INTEGER,
    payouts_completed INTEGER,
    payout_total_amount DECIMAL(12,2),
    fraud_flags INTEGER,
    unique_referrers INTEGER,
    avg_referral_value DECIMAL(10,2),
    approval_rate DECIMAL(5,2),
    pool_available DECIMAL(12,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        rmd.metric_date,
        rmd.referrals_created,
        rmd.referrals_approved,
        rmd.referrals_rejected,
        rmd.payouts_completed,
        rmd.payout_total_amount,
        rmd.fraud_flags,
        rmd.unique_referrers,
        rmd.avg_referral_value,
        rmd.approval_rate,
        rmd.pool_available
    FROM public.referral_metrics_daily rmd
    WHERE rmd.metric_date >= p_start_date
    AND rmd.metric_date <= p_end_date
    ORDER BY rmd.metric_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate month-over-month growth
DROP FUNCTION IF EXISTS calculate_mom_growth(DATE, INTEGER);
CREATE OR REPLACE FUNCTION calculate_mom_growth(p_base_date DATE, p_months_back INTEGER DEFAULT 1)
RETURNS TABLE(
    metric_date DATE,
    metric_name TEXT,
    current_value DECIMAL(12,2),
    previous_value DECIMAL(12,2),
    growth_rate DECIMAL(5,2),
    is_positive BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH current_metrics AS (
        SELECT
            'referrals_created' AS metric_name,
            referrals_created::DECIMAL AS value
        FROM public.referral_metrics_daily
        WHERE metric_date = p_base_date

        UNION ALL

        SELECT
            'payout_total_amount' AS metric_name,
            payout_total_amount
        FROM public.referral_metrics_daily
        WHERE metric_date = p_base_date

        UNION ALL

        SELECT
            'fraud_flags' AS metric_name,
            fraud_flags::DECIMAL
        FROM public.referral_metrics_daily
        WHERE metric_date = p_base_date
    ),
    previous_metrics AS (
        SELECT
            m.metric_name,
            m.value AS previous_value
        FROM (
            SELECT
                'referrals_created' AS metric_name,
                SUM(referrals_created)::DECIMAL AS value
            FROM public.referral_metrics_daily
            WHERE metric_date >= (p_base_date - (p_months_back || ' months')::INTERVAL)
            AND metric_date < (p_base_date - ((p_months_back - 1) || ' months')::INTERVAL)

            UNION ALL

            SELECT
                'payout_total_amount' AS metric_name,
                SUM(payout_total_amount)
            FROM public.referral_metrics_daily
            WHERE metric_date >= (p_base_date - (p_months_back || ' months')::INTERVAL)
            AND metric_date < (p_base_date - ((p_months_back - 1) || ' months')::INTERVAL)

            UNION ALL

            SELECT
                'fraud_flags' AS metric_name,
                SUM(fraud_flags)::DECIMAL
            FROM public.referral_metrics_daily
            WHERE metric_date >= (p_base_date - (p_months_back || ' months')::INTERVAL)
            AND metric_date < (p_base_date - ((p_months_back - 1) || ' months')::INTERVAL)
        ) m
    )
    SELECT
        p_base_date,
        cm.metric_name,
        cm.value AS current_value,
        COALESCE(pm.previous_value, 0) AS previous_value,
        CASE
            WHEN COALESCE(pm.previous_value, 0) > 0
            THEN ROUND(((cm.value - pm.previous_value) / pm.previous_value) * 100, 2)
            ELSE NULL
        END AS growth_rate,
        CASE
            WHEN COALESCE(pm.previous_value, 0) > 0
            THEN cm.value >= pm.previous_value
            ELSE NULL
        END AS is_positive
    FROM current_metrics cm
    LEFT JOIN previous_metrics pm ON cm.metric_name = pm.metric_name;
END;
$$ LANGUAGE plpgsql;

-- View for 30-day trends
CREATE OR REPLACE VIEW public.v_referral_30day_trends AS
SELECT
    metric_date,
    referrals_created,
    referrals_approved,
    referrals_rejected,
    payouts_completed,
    payout_total_amount,
    fraud_flags,
    avg_referral_value,
    approval_rate
FROM public.referral_metrics_daily
WHERE metric_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY metric_date DESC;

-- View for monthly summary
CREATE OR REPLACE VIEW public.v_referral_monthly_summary AS
SELECT
    DATE_TRUNC('month', metric_date)::DATE AS month,
    SUM(referrals_created) AS total_referrals,
    SUM(referrals_approved) AS total_approved,
    SUM(referrals_rejected) AS total_rejected,
    SUM(payouts_completed) AS total_payouts,
    SUM(payout_total_amount) AS total_payout_amount,
    SUM(fraud_flags) AS total_fraud_flags,
    ROUND(AVG(avg_referral_value), 2) AS avg_referral_value,
    ROUND(AVG(approval_rate), 2) AS avg_approval_rate
FROM public.referral_metrics_daily
GROUP BY DATE_TRUNC('month', metric_date)
ORDER BY month DESC;

-- Comment explaining metrics table
COMMENT ON TABLE public.referral_metrics_daily IS 'Daily aggregated metrics for referral program performance analysis, time-series charts, and forecasting';
COMMENT ON FUNCTION aggregate_daily_referral_metrics IS 'Aggregates daily referral metrics. Should be run via cron job daily at midnight';
COMMENT ON VIEW public.v_referral_30day_trends IS 'Last 30 days of referral metrics for trend analysis';
COMMENT ON VIEW public.v_referral_monthly_summary IS 'Monthly summary of referral metrics for month-over-month comparison';
