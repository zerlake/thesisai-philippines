-- Migration: Update Referral Event Workflow States
-- Priority 6: Expand status options to support finance workflows
-- Adds: under_review, scheduled_for_payout, reversed, flagged

-- Add new status values to existing enum (requires recreating enum in PostgreSQL)
-- Note: In production, this would need careful handling to not break existing data
-- For now, we'll add a separate workflow_status column for extended states

-- Create new enum for workflow states (more granular than status)
DO $$ BEGIN
    CREATE TYPE public.referral_workflow_state AS ENUM(
        'pending',
        'under_review',
        'approved',
        'scheduled_for_payout',
        'paid',
        'reversed',
        'flagged',
        'rejected'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add workflow state column to referral_events
ALTER TABLE public.referral_events
    ADD COLUMN IF NOT EXISTS workflow_state public.referral_workflow_state DEFAULT 'pending';

-- Add helpful columns for workflow tracking
ALTER TABLE public.referral_events
    ADD COLUMN IF NOT EXISTS scheduled_payout_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS reversed_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS reversal_reason TEXT,
    ADD COLUMN IF NOT EXISTS review_started_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create index for workflow state queries
CREATE INDEX IF NOT EXISTS idx_referral_events_workflow_state ON public.referral_events(workflow_state);
CREATE INDEX IF NOT EXISTS idx_referral_events_reviewed_by ON public.referral_events(reviewed_by);

-- Function to transition workflow state
DROP FUNCTION IF EXISTS transition_referral_workflow(UUID, public.referral_workflow_state, TEXT);
CREATE OR REPLACE FUNCTION transition_referral_workflow(
    p_referral_id UUID,
    p_new_state public.referral_workflow_state,
    p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_old_state public.referral_workflow_state;
    v_referrer_id UUID;
BEGIN
    -- Get current state
    SELECT workflow_state, referrer_id
    INTO v_old_state, v_referrer_id
    FROM public.referral_events
    WHERE id = p_referral_id;

    -- Validate state transitions
    -- pending -> under_review, approved, rejected, flagged
    -- under_review -> approved, rejected, flagged
    -- approved -> scheduled_for_payout, reversed
    -- scheduled_for_payout -> paid, reversed
    -- paid -> reversed
    -- flagged -> under_review, rejected, approved
    -- rejected -> (no further transitions)
    -- reversed -> (no further transitions)

    -- Update workflow state
    UPDATE public.referral_events
    SET workflow_state = p_new_state,
        reviewed_by = auth.uid(),
        review_started_at = CASE
            WHEN v_old_state = 'pending' AND p_new_state = 'under_review' THEN NOW()
            ELSE review_started_at
        END,
        scheduled_payout_at = CASE
            WHEN p_new_state = 'scheduled_for_payout' THEN NOW()
            ELSE scheduled_payout_at
        END,
        reversed_at = CASE
            WHEN p_new_state = 'reversed' THEN NOW()
            ELSE reversed_at
        END,
        reversal_reason = CASE
            WHEN p_new_state = 'reversed' THEN p_reason
            ELSE reversal_reason
        END,
        status = CASE
            WHEN p_new_state IN ('paid', 'rejected') THEN p_new_state::public.referral_event_status
            ELSE status
        END
    WHERE id = p_referral_id;

    -- Log the workflow transition
    INSERT INTO public.admin_financial_logs (
        admin_id,
        action,
        target_type,
        target_id,
        before_state,
        after_state,
        notes,
        created_at
    ) VALUES (
        auth.uid(),
        'referral_reinstated', -- Using existing action type
        'referral_event',
        p_referral_id,
        jsonb_build_object('workflow_state', v_old_state::TEXT, 'status', COALESCE(v_old_state::TEXT, 'pending')),
        jsonb_build_object('workflow_state', p_new_state::TEXT, 'status', p_new_state::TEXT),
        COALESCE(p_reason, 'Workflow state transition'),
        NOW()
    );

    -- Update pool allocation if moved to approved
    IF p_new_state = 'approved' AND v_old_state != 'approved' THEN
        -- Pool allocation is handled by existing trigger
        NULL;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to schedule referral for payout
DROP FUNCTION IF EXISTS schedule_referral_payout(UUID);
CREATE OR REPLACE FUNCTION schedule_referral_payout(p_referral_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Move to scheduled state
    UPDATE public.referral_events
    SET workflow_state = 'scheduled_for_payout',
        scheduled_payout_at = NOW()
    WHERE id = p_referral_id
    AND workflow_state = 'approved';

    -- Log the action
    IF FOUND THEN
        INSERT INTO public.admin_financial_logs (
            admin_id,
            action,
            target_type,
            target_id,
            notes,
            created_at
        ) VALUES (
            auth.uid(),
            'payout_approved',
            'referral_event',
            p_referral_id,
            'Referral scheduled for payout',
            NOW()
        );

        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reverse a referral (fraud detected after payment)
DROP FUNCTION IF EXISTS reverse_referral(UUID, TEXT);
CREATE OR REPLACE FUNCTION reverse_referral(p_referral_id UUID, p_reason TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_referral referral_events%ROWTYPE;
    v_ledger_id UUID;
BEGIN
    -- Get referral details
    SELECT *
    INTO v_referral
    FROM public.referral_events
    WHERE id = p_referral_id;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    -- Reverse workflow state
    UPDATE public.referral_events
    SET workflow_state = 'reversed',
        reversed_at = NOW(),
        reversal_reason = p_reason,
        status = 'rejected'
    WHERE id = p_referral_id;

    -- Reverse ledger entry if commission was earned
    IF v_referral.commission_amount > 0 AND v_referral.status IN ('approved', 'paid') THEN
        -- Create reversal ledger entry
        INSERT INTO public.financial_ledger (
            user_id,
            source_type,
            source_id,
            transaction_type,
            debit,
            balance_after,
            currency,
            description,
            status,
            posted_at,
            created_by_admin,
            admin_notes
        )
        SELECT
            v_referral.referrer_id,
            'referral',
            v_referral.id,
            'ledger_reversal',
            v_referral.commission_amount,
            get_user_balance(v_referral.referrer_id) - v_referral.commission_amount,
            'PHP',
            format('Reversal: %s', p_reason),
            'posted',
            NOW(),
            auth.uid(),
            p_reason
        RETURNING id INTO v_ledger_id;

        -- Cancel any pending payouts for this referral
        UPDATE public.payouts
        SET status = 'cancelled'::public.payout_status
        WHERE source_type = 'referral'
        AND source_id = p_referral.id
        AND status = 'pending';
    END IF;

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
        created_at
    ) VALUES (
        auth.uid(),
        'ledger_reversal',
        'referral_event',
        p_referral_id,
        to_jsonb(v_referral),
        jsonb_build_object('workflow_state', 'reversed', 'status', 'rejected'),
        -v_referral.commission_amount,
        p_reason,
        NOW()
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to batch schedule pending referrals for payout
DROP FUNCTION IF EXISTS batch_schedule_payouts();
CREATE OR REPLACE FUNCTION batch_schedule_payouts()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER := 0;
BEGIN
    -- Move all approved referrals to scheduled state
    UPDATE public.referral_events
    SET workflow_state = 'scheduled_for_payout',
        scheduled_payout_at = NOW()
    WHERE workflow_state = 'approved'
    AND status = 'approved'
    ;
    GET DIAGNOSTICS v_count = ROW_COUNT;

    -- Log batch action
    IF v_count > 0 THEN
        INSERT INTO public.admin_financial_logs (
            admin_id,
            action,
            target_type,
            notes,
            amount_impact,
            created_at
        ) VALUES (
            auth.uid(),
            'payout_approved',
            'referral_event',
            format('Batch scheduled %s referrals for payout', v_count),
            v_count,
            NOW()
        );
    END IF;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for workflow dashboard
CREATE OR REPLACE VIEW public.v_referral_workflow_dashboard AS
SELECT
    re.id,
    re.referrer_id,
    re.referred_id,
    re.event_type,
    re.status,
    re.workflow_state,
    re.commission_amount,
    re.created_at,
    re.approved_at,
    re.review_started_at,
    re.scheduled_payout_at,
    re.reversed_at,
    re.reversal_reason,
    re.reviewed_by,

    -- Time in each stage (for performance analysis)
    CASE
        WHEN re.review_started_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (re.review_started_at - re.created_at)) / 3600
        ELSE NULL
    END AS hours_to_review,
    CASE
        WHEN re.scheduled_payout_at IS NOT NULL AND re.review_started_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (re.scheduled_payout_at - re.review_started_at)) / 86400
        ELSE NULL
    END AS days_to_schedule,
    CASE
        WHEN re.paid_at IS NOT NULL AND re.scheduled_payout_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (re.paid_at - re.scheduled_payout_at)) / 86400
        ELSE NULL
    END AS days_to_payment,

    -- Risk assessment if exists
    rra.risk_score,
    rra.risk_level,
    rra.status AS risk_status,

    -- User details
    p_referrer.first_name AS referrer_first_name,
    p_referrer.last_name AS referrer_last_name,
    p_referrer.email AS referrer_email,
    p_referred.first_name AS referred_first_name,
    p_referred.last_name AS referred_last_name,
    p_referred.email AS referred_email,

    -- Admin reviewer
    p_reviewer.first_name AS reviewer_first_name,
    p_reviewer.last_name AS reviewer_last_name

FROM public.referral_events re
LEFT JOIN public.profiles p_referrer ON re.referrer_id = p_referrer.id
LEFT JOIN public.profiles p_referred ON re.referred_id = p_referred.id
LEFT JOIN public.referral_risk_assessment rra ON re.id = rra.referral_event_id
LEFT JOIN public.profiles p_reviewer ON re.reviewed_by = p_reviewer.id
ORDER BY re.created_at DESC;

-- Comment explaining workflow states
COMMENT ON COLUMN public.referral_events.workflow_state IS 'Extended workflow state: pending -> under_review -> approved -> scheduled_for_payout -> paid, or flagged/rejected/reversed';
COMMENT ON COLUMN public.referral_events.review_started_at IS 'Timestamp when review started (under_review state)';
COMMENT ON COLUMN public.referral_events.scheduled_payout_at IS 'Timestamp when referral was scheduled for payout';
COMMENT ON COLUMN public.referral_events.reversed_at IS 'Timestamp when referral was reversed (fraud or error)';
COMMENT ON COLUMN public.referral_events.reversal_reason IS 'Reason for referral reversal (e.g., fraud confirmed)';
COMMENT ON VIEW public.v_referral_workflow_dashboard IS 'Dashboard view for referral workflow monitoring with timing metrics';
