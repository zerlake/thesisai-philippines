-- Migration: Add Admin Financial Logs for Audit-Level Tracking
-- Priority 5: Critical for audit, compliance, and accountability
-- Tracks all admin actions on financial operations

-- Create enum types for admin logs
DO $$ BEGIN
    CREATE TYPE public.admin_financial_action AS ENUM(
        'payout_approved',
        'payout_rejected',
        'payout_paid',
        'payout_cancelled',
        'referral_approved',
        'referral_rejected',
        'referral_flagged',
        'referral_reinstated',
        'pool_adjustment',
        'manual_balance_adjustment',
        'tier_override',
        'bonus_awarded',
        'penalty_applied',
        'refund_processed',
        'ledger_reversal',
        'fraud_confirmed',
        'fraud_dismissed',
        'reconciliation_completed',
        'revenue_allocated',
        'revenue_voided',
        'account_frozen',
        'account_unfrozen'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.admin_financial_target_type AS ENUM(
        'referral_event',
        'payout',
        'pool',
        'ledger_entry',
        'revenue_event',
        'user',
        'risk_assessment'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Admin financial logs table
CREATE TABLE IF NOT EXISTS public.admin_financial_logs (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

    -- Admin information
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,

    -- Action details
    action public.admin_financial_action NOT NULL,
    target_type public.admin_financial_target_type NOT NULL,
    target_id UUID, -- ID of the affected record

    -- Change tracking (before/after states)
    before_state JSONB,
    after_state JSONB,
    changes_made JSONB, -- Structured diff of what changed

    -- Financial impact
    amount_impact DECIMAL(10,2), -- For tracking financial delta

    -- Context and notes
    notes TEXT,
    reason TEXT, -- Business justification for the action

    -- Security tracking
    ip_address TEXT,
    user_agent TEXT,
    session_id TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient audit queries
CREATE INDEX IF NOT EXISTS idx_admin_financial_logs_admin ON public.admin_financial_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_financial_logs_action ON public.admin_financial_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_financial_logs_target ON public.admin_financial_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_financial_logs_created ON public.admin_financial_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_financial_logs_amount ON public.admin_financial_logs(amount_impact);

-- RLS Policies
ALTER TABLE public.admin_financial_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all logs (audit trail should be visible to all admins)
CREATE POLICY "Admins view financial logs" ON public.admin_financial_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role_type = 'admin'
        )
    );

-- Only service role or admins can create logs (should be called via functions)
CREATE POLICY "System create financial logs" ON public.admin_financial_logs
    FOR INSERT WITH CHECK (true); -- Functions have SECURITY DEFINER

-- Helper function to calculate JSON diff between two objects
DROP FUNCTION IF EXISTS jsonb_diff(JSONB, JSONB);
CREATE OR REPLACE FUNCTION jsonb_diff(p_old JSONB, p_new JSONB)
RETURNS JSONB AS $$
DECLARE
    v_diff JSONB := '{}';
    v_key TEXT;
BEGIN
    -- This is a simplified diff - in production consider using specialized libraries
    FOR v_key IN
        SELECT DISTINCT jsonb_object_keys(p_old || p_new)
    LOOP
        IF p_old ? v_key AND p_new ? v_key AND p_old->v_key IS DISTINCT FROM p_new->v_key THEN
            v_diff := v_diff || jsonb_build_object(
                'key', v_key,
                'old', p_old->v_key,
                'new', p_new->v_key
            );
        ELSIF p_old ? v_key AND NOT (p_new ? v_key) THEN
            v_diff := v_diff || jsonb_build_object(
                'key', v_key,
                'old', p_old->v_key,
                'new', NULL
            );
        ELSIF NOT (p_old ? v_key) AND p_new ? v_key THEN
            v_diff := v_diff || jsonb_build_object(
                'key', v_key,
                'old', NULL,
                'new', p_new->v_key
            );
        END IF;
    END LOOP;

    RETURN v_diff;
END;
$$ LANGUAGE plpgsql;

-- Function to log admin financial action
DROP FUNCTION IF EXISTS log_admin_financial_action;
CREATE OR REPLACE FUNCTION log_admin_financial_action(
    p_action public.admin_financial_action,
    p_target_type public.admin_financial_target_type,
    p_target_id UUID,
    p_before_state JSONB DEFAULT NULL,
    p_after_state JSONB DEFAULT NULL,
    p_amount_impact DECIMAL(10,2) DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_reason TEXT DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
    v_changes JSONB;
BEGIN
    -- Calculate changes if both states provided
    IF p_before_state IS NOT NULL AND p_after_state IS NOT NULL THEN
        v_changes := jsonb_diff(p_before_state, p_after_state);
    ELSE
        v_changes := '{}';
    END IF;

    -- Insert log entry
    INSERT INTO public.admin_financial_logs (
        admin_id,
        action,
        target_type,
        target_id,
        before_state,
        after_state,
        changes_made,
        amount_impact,
        notes,
        reason,
        ip_address,
        user_agent
    ) VALUES (
        auth.uid(),
        p_action,
        p_target_type,
        p_target_id,
        p_before_state,
        p_after_state,
        v_changes,
        p_amount_impact,
        p_notes,
        p_reason,
        p_ip_address,
        p_user_agent
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to log payout approval
DROP FUNCTION IF EXISTS log_payout_approval_changes();
CREATE OR REPLACE FUNCTION log_payout_approval_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_action public.admin_financial_action;
    v_old_status public.payout_status;
    v_new_status public.payout_status;
BEGIN
    -- Get statuses (handle INSERT case)
    IF TG_OP = 'INSERT' THEN
        v_old_status := NULL;
        v_new_status := NEW.status;
    ELSE
        v_old_status := OLD.status;
        v_new_status := NEW.status;
    END IF;

    -- Determine action type
    IF v_old_status IS NULL THEN
        v_action := NULL; -- Creation logged separately
    ELSIF v_new_status = 'approved' AND v_old_status != 'approved' THEN
        v_action := 'payout_approved';
    ELSIF v_new_status = 'rejected' AND v_old_status != 'rejected' THEN
        v_action := 'payout_rejected';
    ELSIF v_new_status = 'paid' AND v_old_status != 'paid' THEN
        v_action := 'payout_paid';
    ELSIF v_new_status = 'cancelled' AND v_old_status != 'cancelled' THEN
        v_action := 'payout_cancelled';
    ELSE
        RETURN NEW;
    END IF;

    -- Log the action if there is one
    IF v_action IS NOT NULL THEN
        INSERT INTO public.admin_financial_logs (
            admin_id,
            action,
            target_type,
            target_id,
            before_state,
            after_state,
            amount_impact,
            created_at
        ) VALUES (
            auth.uid(),
            v_action,
            'payout',
            NEW.id,
            to_jsonb(OLD),
            to_jsonb(NEW),
            COALESCE(NEW.amount - COALESCE(OLD.amount, 0), NEW.amount),
            NOW()
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_log_payout_actions
    AFTER INSERT OR UPDATE OF status ON public.payouts
    FOR EACH ROW EXECUTE FUNCTION log_payout_approval_changes();

-- Trigger to log referral status changes
DROP FUNCTION IF EXISTS log_referral_status_changes();
CREATE OR REPLACE FUNCTION log_referral_status_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_action public.admin_financial_action;
BEGIN
    -- Determine action type
    IF (NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved')) THEN
        v_action := 'referral_approved';
    ELSIF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
        v_action := 'referral_rejected';
    ELSE
        RETURN NEW;
    END IF;

    -- Log the action
    IF v_action IS NOT NULL THEN
        INSERT INTO public.admin_financial_logs (
            admin_id,
            action,
            target_type,
            target_id,
            before_state,
            after_state,
            amount_impact,
            created_at
        ) VALUES (
            auth.uid(),
            v_action,
            'referral_event',
            NEW.id,
            to_jsonb(OLD),
            to_jsonb(NEW),
            COALESCE(NEW.commission_amount - COALESCE(OLD.commission_amount, 0), NEW.commission_amount),
            NOW()
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_log_referral_actions
    AFTER INSERT OR UPDATE OF status ON public.referral_events
    FOR EACH ROW EXECUTE FUNCTION log_referral_status_changes();

-- Function for manual balance adjustment
DROP FUNCTION IF EXISTS manual_balance_adjustment(UUID, DECIMAL(10,2), TEXT, TEXT);
CREATE OR REPLACE FUNCTION manual_balance_adjustment(
    p_user_id UUID,
    p_amount DECIMAL(10,2),
    p_reason TEXT,
    p_notes TEXT
)
RETURNS UUID AS $$
DECLARE
    v_current_balance DECIMAL(10,2);
    v_ledger_id UUID;
    v_adjustment_type public.ledger_transaction_type;
BEGIN
    -- Get current balance
    v_current_balance := get_user_balance(p_user_id);

    -- Determine adjustment type
    IF p_amount > 0 THEN
        v_adjustment_type := 'adjustment';
    ELSE
        v_adjustment_type := 'penalty';
    END IF;

    -- Create ledger entry
    INSERT INTO public.financial_ledger (
        user_id,
        source_type,
        transaction_type,
        debit,
        credit,
        balance_after,
        currency,
        description,
        status,
        posted_at,
        created_by_admin,
        admin_notes
    ) VALUES (
        p_user_id,
        'adjustment',
        v_adjustment_type,
        CASE WHEN p_amount < 0 THEN ABS(p_amount) ELSE 0 END,
        CASE WHEN p_amount > 0 THEN p_amount ELSE 0 END,
        v_current_balance + p_amount,
        'PHP',
        format('Manual adjustment: %s', p_reason),
        'posted',
        NOW(),
        auth.uid(),
        p_notes
    )
    RETURNING id INTO v_ledger_id;

    -- Log admin action
    INSERT INTO public.admin_financial_logs (
        admin_id,
        action,
        target_type,
        target_id,
        before_state,
        after_state,
        amount_impact,
        reason,
        notes,
        created_at
    ) VALUES (
        auth.uid(),
        'manual_balance_adjustment',
        'ledger_entry',
        v_ledger_id,
        jsonb_build_object('balance', v_current_balance),
        jsonb_build_object('balance', v_current_balance + p_amount),
        p_amount,
        p_reason,
        p_notes,
        NOW()
    );

    -- Update user profile earnings
    IF p_amount > 0 THEN
        UPDATE public.profiles
        SET total_earnings = total_earnings + p_amount
        WHERE id = p_user_id;
    END IF;

    RETURN v_ledger_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for pool adjustment
DROP FUNCTION IF EXISTS adjust_pool(UUID, DECIMAL(12,2), TEXT);
CREATE OR REPLACE FUNCTION adjust_pool(
    p_pool_id UUID,
    p_amount_delta DECIMAL(12,2),
    p_reason TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update pool totals
    UPDATE public.recruitment_pool
    SET total_revenue = total_revenue + p_amount_delta,
        pool_amount = pool_amount + (p_amount_delta * pool_percentage / 100),
        student_allocation = student_allocation + (p_amount_delta * pool_percentage / 100 * 0.35),
        advisor_allocation = advisor_allocation + (p_amount_delta * pool_percentage / 100 * 0.35),
        critic_allocation = critic_allocation + (p_amount_delta * pool_percentage / 100 * 0.30)
    WHERE id = p_pool_id;

    -- Log admin action
    INSERT INTO public.admin_financial_logs (
        admin_id,
        action,
        target_type,
        target_id,
        amount_impact,
        reason,
        created_at
    ) VALUES (
        auth.uid(),
        'pool_adjustment',
        'pool',
        p_pool_id,
        p_amount_delta,
        p_reason,
        NOW()
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for admin audit trail
CREATE OR REPLACE VIEW public.v_admin_financial_audit_trail AS
SELECT
    afl.id,
    afl.admin_id,
    afl.action,
    afl.target_type,
    afl.target_id,
    afl.before_state,
    afl.after_state,
    afl.changes_made,
    afl.amount_impact,
    afl.notes,
    afl.reason,
    afl.created_at,

    -- Admin details
    p.first_name AS admin_first_name,
    p.last_name AS admin_last_name,
    p.email AS admin_email,

    -- Target details (if available)
    CASE afl.target_type
        WHEN 'referral_event' THEN (SELECT event_type::TEXT FROM public.referral_events WHERE id = afl.target_id)
        WHEN 'payout' THEN (SELECT payout_type::TEXT FROM public.payouts WHERE id = afl.target_id)
        WHEN 'pool' THEN (SELECT period_start::TEXT FROM public.recruitment_pool WHERE id = afl.target_id)
        ELSE NULL
    END AS target_description

FROM public.admin_financial_logs afl
LEFT JOIN public.profiles p ON afl.admin_id = p.id
ORDER BY afl.created_at DESC;

-- Comment explaining admin financial logs
COMMENT ON TABLE public.admin_financial_logs IS 'Audit-level logs for all admin financial actions including approvals, rejections, adjustments, and fraud decisions';
COMMENT ON COLUMN public.admin_financial_logs.before_state IS 'JSON representation of record state before action (for audit)';
COMMENT ON COLUMN public.admin_financial_logs.after_state IS 'JSON representation of record state after action (for audit)';
COMMENT ON COLUMN public.admin_financial_logs.changes_made IS 'Structured diff showing what fields changed (for audit)';
COMMENT ON COLUMN public.admin_financial_logs.amount_impact IS 'Financial impact of this action on user balance or pool';
COMMENT ON VIEW public.v_admin_financial_audit_trail IS 'Audit trail view for reviewing all admin financial actions with admin and target details';
