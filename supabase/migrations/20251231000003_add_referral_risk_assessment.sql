-- Migration: Add Referral Risk Assessment for Actionable Fraud Detection
-- Priority 4: Transform fraud detection from "defined" to "actionable"
-- Supports manual override, auto-freeze, risk level badges

-- Create enum types for risk assessment
DO $$ BEGIN
    CREATE TYPE public.risk_level AS ENUM('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.risk_flag_type AS ENUM(
        'self_referral',
        'duplicate_ip',
        'suspicious_volume',
        'low_quality_user',
        'same_device',
        'short_timeframe',
        'unusual_pattern',
        'payment_fraud',
        'account_age',
        'multiple_attempts'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.auto_action_type AS ENUM(
        'none',
        'hold_payout',
        'freeze_user',
        'flag_for_review',
        'auto_reject'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.risk_status AS ENUM('detected', 'reviewing', 'confirmed', 'dismissed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Risk assessment table
CREATE TABLE IF NOT EXISTS public.referral_risk_assessment (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

    -- Link to referral event
    referral_event_id UUID NOT NULL REFERENCES public.referral_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- Referrer being assessed

    -- Risk scoring
    risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level public.risk_level NOT NULL,

    -- Risk flags (array of detected issues)
    flags public.risk_flag_type[] DEFAULT '{}',

    -- Automated actions
    auto_action_taken public.auto_action_type DEFAULT 'none',
    auto_action_at TIMESTAMP WITH TIME ZONE,
    auto_action_notes TEXT,

    -- Review process
    status public.risk_status DEFAULT 'detected',
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    review_decision TEXT, -- 'confirm_fraud', 'dismiss', 'approve_with_caution'

    -- Additional risk data
    ip_address TEXT,
    device_fingerprint TEXT,
    user_agent TEXT,
    location_country VARCHAR(2),
    location_city TEXT,

    -- Detection metadata
    detection_method VARCHAR(100), -- 'pattern_analysis', 'ip_check', 'volume_check', etc.
    confidence_score DECIMAL(5,2), -- 0-100 confidence in risk assessment
    related_risks UUID[], -- Other risk IDs (linked fraud patterns)

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for risk assessment queries
CREATE INDEX IF NOT EXISTS idx_risk_assessment_referral ON public.referral_risk_assessment(referral_event_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessment_user ON public.referral_risk_assessment(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessment_level ON public.referral_risk_assessment(risk_level);
CREATE INDEX IF NOT EXISTS idx_risk_assessment_status ON public.referral_risk_assessment(status);
CREATE INDEX IF NOT EXISTS idx_risk_assessment_score ON public.referral_risk_assessment(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_risk_assessment_created ON public.referral_risk_assessment(created_at DESC);

-- RLS Policies
ALTER TABLE public.referral_risk_assessment ENABLE ROW LEVEL SECURITY;

-- Users see their own risk assessments
CREATE POLICY "Users view own risk assessments" ON public.referral_risk_assessment
    FOR SELECT USING (auth.uid() = user_id);

-- Admins manage all risk assessments
CREATE POLICY "Admins manage risk assessments" ON public.referral_risk_assessment
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role_type = 'admin'
        )
    );

-- Function to calculate risk score based on multiple factors
DROP FUNCTION IF EXISTS calculate_referral_risk(UUID);
CREATE OR REPLACE FUNCTION calculate_referral_risk(p_referral_id UUID)
RETURNS TABLE(
    risk_score INTEGER,
    risk_level public.risk_level,
    flags public.risk_flag_type[]
) AS $$
DECLARE
    v_risk_score INTEGER := 0;
    v_flags public.risk_flag_type[] := '{}';
    v_referrer_id UUID;
    v_referred_id UUID;
    v_referrer_referrals_today INTEGER;
    v_referrer_referrals_this_week INTEGER;
    v_referrer_account_age_days INTEGER;
    v_referred_account_age_hours INTEGER;
    v_self_referral BOOLEAN;
BEGIN
    -- Get referral details
    SELECT referrer_id, referred_id
    INTO v_referrer_id, v_referred_id
    FROM public.referral_events
    WHERE id = p_referral_id;

    -- Check 1: Self-referral
    v_self_referral := (v_referrer_id = v_referred_id);
    IF v_self_referral THEN
        v_risk_score := v_risk_score + 100;
        v_flags := array_append(v_flags, 'self_referral'::public.risk_flag_type);
    END IF;

    -- Check 2: Suspicious volume (same referrer)
    SELECT COUNT(*)
    INTO v_referrer_referrals_today
    FROM public.referral_events
    WHERE referrer_id = v_referrer_id
    AND DATE(created_at) = CURRENT_DATE;

    IF v_referrer_referrals_today >= 5 THEN
        v_risk_score := v_risk_score + 50;
        v_flags := array_append(v_flags, 'suspicious_volume'::public.risk_flag_type);
    END IF;

    -- Check 3: Referrer account age
    SELECT EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400
    INTO v_referrer_account_age_days
    FROM public.profiles
    WHERE id = v_referrer_id;

    IF v_referrer_account_age_days < 7 THEN
        v_risk_score := v_risk_score + 30;
        v_flags := array_append(v_flags, 'account_age'::public.risk_flag_type);
    END IF;

    -- Check 4: Referred account created too quickly after signup
    SELECT EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600
    INTO v_referred_account_age_hours
    FROM public.profiles
    WHERE id = v_referred_id;

    IF v_referred_account_age_hours < 1 THEN
        v_risk_score := v_risk_score + 40;
        v_flags := array_append(v_flags, 'short_timeframe'::public.risk_flag_type);
    END IF;

    -- Determine risk level
    IF v_risk_score >= 70 THEN
        RETURN QUERY SELECT v_risk_score, 'critical'::public.risk_level, v_flags;
    ELSIF v_risk_score >= 50 THEN
        RETURN QUERY SELECT v_risk_score, 'high'::public.risk_level, v_flags;
    ELSIF v_risk_score >= 25 THEN
        RETURN QUERY SELECT v_risk_score, 'medium'::public.risk_level, v_flags;
    ELSE
        RETURN QUERY SELECT v_risk_score, 'low'::public.risk_level, v_flags;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-assess risk on referral creation
DROP FUNCTION IF EXISTS auto_assess_referral_risk();
CREATE OR REPLACE FUNCTION auto_assess_referral_risk()
RETURNS TRIGGER AS $$
DECLARE
    v_risk_score INTEGER;
    v_risk_level public.risk_level;
    v_flags public.risk_flag_type[];
    v_auto_action public.auto_action_type;
    v_ip_address TEXT;
BEGIN
    -- Skip if already assessed
    IF EXISTS (
        SELECT 1 FROM public.referral_risk_assessment
        WHERE referral_event_id = NEW.id
    ) THEN
        RETURN NEW;
    END IF;

    -- Get IP address from metadata (if available)
    v_ip_address := NEW.metadata->>'ip_address';

    -- Calculate risk
    SELECT risk_score, risk_level, flags
    INTO v_risk_score, v_risk_level, v_flags
    FROM calculate_referral_risk(NEW.id);

    -- Determine auto-action based on risk level
    CASE v_risk_level
        WHEN 'critical' THEN
            v_auto_action := 'auto_reject';
        WHEN 'high' THEN
            v_auto_action := 'flag_for_review';
        WHEN 'medium' THEN
            v_auto_action := 'hold_payout';
        ELSE
            v_auto_action := 'none';
    END CASE;

    -- Create risk assessment record
    INSERT INTO public.referral_risk_assessment (
        referral_event_id,
        user_id,
        risk_score,
        risk_level,
        flags,
        auto_action_taken,
        auto_action_at,
        ip_address,
        detection_method,
        confidence_score,
        status
    ) VALUES (
        NEW.id,
        NEW.referrer_id,
        v_risk_score,
        v_risk_level,
        v_flags,
        v_auto_action,
        NOW(),
        v_ip_address,
        'automated_risk_scoring',
        85.0, -- 85% confidence for automated detection
        CASE v_auto_action
            WHEN 'none' THEN 'dismissed'
            ELSE 'detected'
        END
    );

    -- Apply auto-action if needed
    IF v_auto_action = 'auto_reject' THEN
        UPDATE public.referral_events
        SET status = 'rejected',
            metadata = jsonb_set(
                COALESCE(metadata, '{}'),
                '{auto_rejected_reason}',
                '"High risk detected: ' || v_risk_level || '"'
            )
        WHERE id = NEW.id;

    ELSIF v_auto_action = 'hold_payout' THEN
        UPDATE public.payouts
        SET status = 'cancelled'::public.payout_status
        WHERE referral_event_id = NEW.id
        AND status = 'pending';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-assess risk on referral creation
CREATE TRIGGER trg_auto_assess_risk
    AFTER INSERT ON public.referral_events
    FOR EACH ROW EXECUTE FUNCTION auto_assess_referral_risk();

-- Updated timestamp trigger
DROP FUNCTION IF EXISTS update_risk_assessment_timestamp();
CREATE OR REPLACE FUNCTION update_risk_assessment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_risk_assessment_timestamp
    BEFORE UPDATE ON public.referral_risk_assessment
    FOR EACH ROW EXECUTE FUNCTION update_risk_assessment_timestamp();

-- Function for admin to manually flag referral as fraudulent
DROP FUNCTION IF EXISTS admin_flag_referral_fraud(UUID, TEXT, UUID);
CREATE OR REPLACE FUNCTION admin_flag_referral_fraud(
    p_referral_id UUID,
    p_notes TEXT,
    p_admin_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_risk_id UUID;
BEGIN
    -- Create risk assessment with critical level
    INSERT INTO public.referral_risk_assessment (
        referral_event_id,
        user_id,
        risk_score,
        risk_level,
        flags,
        auto_action_taken,
        status,
        reviewed_by,
        reviewed_at,
        review_notes,
        review_decision,
        detection_method,
        confidence_score
    )
    SELECT
        p_referral_id,
        referrer_id,
        100,
        'critical'::public.risk_level,
        ARRAY['manual_admin_flag'::public.risk_flag_type],
        'none'::public.auto_action_type,
        'confirmed'::public.risk_status,
        p_admin_id,
        NOW(),
        p_notes,
        'confirm_fraud',
        'manual_admin_review',
        100.0
    FROM public.referral_events
    WHERE id = p_referral_id
    RETURNING id INTO v_risk_id;

    -- Update referral status
    UPDATE public.referral_events
    SET status = 'rejected',
        metadata = jsonb_set(
            COALESCE(metadata, '{}'),
            '{admin_rejected_reason}',
            '"' || COALESCE(p_notes, 'Manual fraud flag') || '"'
        )
    WHERE id = p_referral_id;

    -- Hold any pending payouts
    UPDATE public.payouts
    SET status = 'cancelled'::public.payout_status
    WHERE user_id = (SELECT referrer_id FROM public.referral_events WHERE id = p_referral_id)
    AND status = 'pending';

    RETURN v_risk_id;
END;
$$ LANGUAGE plpgsql;

-- Function for admin to dismiss risk assessment
DROP FUNCTION IF EXISTS admin_dismiss_risk_assessment(UUID, TEXT, UUID);
CREATE OR REPLACE FUNCTION admin_dismiss_risk_assessment(
    p_risk_id UUID,
    p_notes TEXT,
    p_admin_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.referral_risk_assessment
    SET status = 'dismissed',
        reviewed_by = p_admin_id,
        reviewed_at = NOW(),
        review_notes = p_notes,
        review_decision = 'dismiss'
    WHERE id = p_risk_id;

    -- Re-enable referral if needed
    UPDATE public.referral_events
    SET status = 'approved'
    WHERE id = (SELECT referral_event_id FROM public.referral_risk_assessment WHERE id = p_risk_id)
    AND status = 'rejected';

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- View for risk dashboard
CREATE OR REPLACE VIEW public.v_risk_dashboard AS
SELECT
    rra.id,
    rra.referral_event_id,
    rra.user_id,
    rra.risk_score,
    rra.risk_level,
    rra.flags,
    rra.auto_action_taken,
    rra.status,
    rra.created_at,
    rra.reviewed_at,
    rra.review_notes,

    -- Referral details
    re.event_type,
    re.status AS referral_status,
    re.commission_amount,
    re.created_at AS referral_created_at,

    -- User details
    p.first_name AS referrer_first_name,
    p.last_name AS referrer_last_name,
    p.email AS referrer_email,
    p.total_referrals AS referrer_total_referrals,
    p.total_earnings AS referrer_total_earnings

FROM public.referral_risk_assessment rra
JOIN public.referral_events re ON rra.referral_event_id = re.id
JOIN public.profiles p ON rra.user_id = p.id
ORDER BY rra.created_at DESC;

-- Comment explaining risk assessment
COMMENT ON TABLE public.referral_risk_assessment IS 'Fraud risk assessment for referrals with automated scoring and manual review workflow';
COMMENT ON COLUMN public.referral_risk_assessment.risk_score IS '0-100 score indicating fraud risk (higher = more risky)';
COMMENT ON COLUMN public.referral_risk_assessment.flags IS 'Array of specific risk flags detected';
COMMENT ON COLUMN public.referral_risk_assessment.auto_action_taken IS 'Automated action based on risk level: none, hold_payout, freeze_user, flag_for_review, auto_reject';
COMMENT ON VIEW public.v_risk_dashboard IS 'Dashboard view for risk assessment monitoring and review';
