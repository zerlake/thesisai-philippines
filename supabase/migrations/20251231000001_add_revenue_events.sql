-- Migration: Add Revenue Events for Revenue Attribution
-- Priority 2: Tracks which revenue funds which referrals
-- Enables answer to "Which subscriptions funded this payout?"

-- Create enum types for revenue events
DO $$ BEGIN
    CREATE TYPE public.revenue_source_type AS ENUM(
        'student_subscription',
        'student_upgrade',
        'advisor_payment',
        'critic_payment',
        'institution_payment',
        'enterprise_subscription',
        'adjustment'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.revenue_status AS ENUM('pending', 'confirmed', 'allocated', 'void');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Revenue events table
CREATE TABLE IF NOT EXISTS public.revenue_events (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),

    -- Revenue source information
    source_type public.revenue_source_type NOT NULL,
    source_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    -- Amount and billing
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PHP',
    billing_period_start DATE,
    billing_period_end DATE,
    billing_cycle VARCHAR(50), -- 'monthly', 'yearly', 'one-time'

    -- Pool allocation tracking
    allocated_to_pool BOOLEAN DEFAULT FALSE,
    pool_id UUID REFERENCES public.recruitment_pool(id) ON DELETE SET NULL,

    -- Revenue metadata
    subscription_plan VARCHAR(100),
    external_transaction_id TEXT, -- Stripe, PayPal, etc.
    payment_gateway VARCHAR(50), -- 'stripe', 'gcash', 'bank', 'credits'

    -- Status and timestamps
    status public.revenue_status DEFAULT 'pending',
    confirmed_at TIMESTAMP WITH TIME ZONE,
    allocated_at TIMESTAMP WITH TIME ZONE,
    voided_at TIMESTAMP WITH TIME ZONE,
    void_reason TEXT,

    -- Additional context
    metadata JSONB DEFAULT '{}',
    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for revenue events
CREATE INDEX IF NOT EXISTS idx_revenue_events_source ON public.revenue_events(source_type, source_user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_events_status ON public.revenue_events(status);
CREATE INDEX IF NOT EXISTS idx_revenue_events_pool ON public.revenue_events(pool_id);
CREATE INDEX IF NOT EXISTS idx_revenue_events_billing ON public.revenue_events(billing_period_start, billing_period_end);
CREATE INDEX IF NOT EXISTS idx_revenue_events_created ON public.revenue_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_events_allocated ON public.revenue_events(allocated_to_pool);

-- Add column to referral_events to link to revenue
ALTER TABLE public.referral_events
    ADD COLUMN IF NOT EXISTS revenue_event_id UUID REFERENCES public.revenue_events(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_referral_events_revenue ON public.referral_events(revenue_event_id);

-- RLS Policies
ALTER TABLE public.revenue_events ENABLE ROW LEVEL SECURITY;

-- Admins can manage revenue events
CREATE POLICY "Admins manage revenue events" ON public.revenue_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role_type = 'admin'
        )
    );

-- Function to auto-allocate revenue to pool when confirmed
DROP FUNCTION IF EXISTS allocate_revenue_to_pool();
CREATE OR REPLACE FUNCTION allocate_revenue_to_pool()
RETURNS TRIGGER AS $$
DECLARE
    current_pool_id UUID;
    pool_percentage DECIMAL(5,2);
BEGIN
    -- Allocate revenue when status changes to confirmed
    IF (NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed')) THEN
        -- Get current open pool
        SELECT id, pool_percentage
        INTO current_pool_id, pool_percentage
        FROM public.recruitment_pool
        WHERE status = 'open'
        ORDER BY period_start DESC
        LIMIT 1;

        -- Update pool if exists
        IF current_pool_id IS NOT NULL THEN
            -- Update revenue event with pool allocation
            UPDATE public.revenue_events
            SET allocated_to_pool = TRUE,
                pool_id = current_pool_id,
                allocated_at = NOW()
            WHERE id = NEW.id;

            -- Update pool totals
            UPDATE public.recruitment_pool
            SET total_revenue = total_revenue + NEW.amount,
                pool_amount = total_revenue + (NEW.amount * pool_percentage / 100),
                student_allocation = (total_revenue + NEW.amount) * pool_percentage / 100 * 0.35,
                advisor_allocation = (total_revenue + NEW.amount) * pool_percentage / 100 * 0.35,
                critic_allocation = (total_revenue + NEW.amount) * pool_percentage / 100 * 0.30
            WHERE id = current_pool_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-allocate revenue on confirmation
CREATE TRIGGER trg_allocate_revenue
    AFTER INSERT OR UPDATE OF status ON public.revenue_events
    FOR EACH ROW EXECUTE FUNCTION allocate_revenue_to_pool();

-- Updated timestamp trigger
DROP FUNCTION IF EXISTS update_revenue_events_updated_at();
CREATE OR REPLACE FUNCTION update_revenue_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_revenue_events_timestamp
    BEFORE UPDATE ON public.revenue_events
    FOR EACH ROW EXECUTE FUNCTION update_revenue_events_updated_at();

-- Function to calculate unallocated pool
DROP FUNCTION IF EXISTS calculate_unallocated_pool();
CREATE OR REPLACE FUNCTION calculate_unallocated_pool()
RETURNS TABLE(
    total_revenue DECIMAL(12,2),
    allocated_pool DECIMAL(12,2),
    unallocated DECIMAL(12,2),
    allocation_percentage DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(amount), 0) AS total_revenue,
        COALESCE(SUM(CASE WHEN allocated_to_pool THEN amount ELSE 0 END), 0) AS allocated_pool,
        COALESCE(SUM(CASE WHEN NOT allocated_to_pool THEN amount ELSE 0 END), 0) AS unallocated,
        CASE
            WHEN COALESCE(SUM(amount), 0) > 0
            THEN ROUND((COALESCE(SUM(CASE WHEN allocated_to_pool THEN amount ELSE 0 END), 0) / COALESCE(SUM(amount), 1)) * 100, 2)
            ELSE 0
        END AS allocation_percentage
    FROM public.revenue_events
    WHERE status = 'confirmed';
END;
$$ LANGUAGE plpgsql;

-- View for revenue-attribution reports
CREATE OR REPLACE VIEW public.v_revenue_attribution AS
SELECT
    re.id,
    re.source_type,
    re.source_user_id,
    re.amount,
    re.currency,
    re.billing_period_start,
    re.billing_period_end,
    re.billing_cycle,
    re.allocated_to_pool,
    re.pool_id,
    re.status,
    re.external_transaction_id,
    re.payment_gateway,
    re.created_at,

    -- Referral information
    COUNT(ref.id) FILTER (WHERE ref.id IS NOT NULL) AS linked_referrals_count,
    COALESCE(SUM(ref.commission_amount) FILTER (WHERE ref.id IS NOT NULL), 0) AS allocated_commissions,

    -- Pool information
    rp.pool_amount AS pool_total_amount,
    rp.student_allocation AS pool_student_allocation,
    rp.advisor_allocation AS pool_advisor_allocation,
    rp.critic_allocation AS pool_critic_allocation,

    -- User information
    p.first_name AS user_first_name,
    p.last_name AS user_last_name,
    p.email AS user_email

FROM public.revenue_events re
LEFT JOIN public.referral_events ref ON ref.revenue_event_id = re.id
LEFT JOIN public.recruitment_pool rp ON re.pool_id = rp.id
LEFT JOIN public.profiles p ON re.source_user_id = p.id
GROUP BY re.id, re.source_type, re.source_user_id, re.amount, re.currency,
         re.billing_period_start, re.billing_period_end, re.billing_cycle,
         re.allocated_to_pool, re.pool_id, re.status, re.external_transaction_id,
         re.payment_gateway, re.created_at, rp.pool_amount, rp.student_allocation,
         rp.advisor_allocation, rp.critic_allocation, p.first_name, p.last_name, p.email;

-- Comment explaining revenue events
COMMENT ON TABLE public.revenue_events IS 'Tracks all revenue events and their allocation to recruitment pool for referral commission funding';
COMMENT ON COLUMN public.revenue_events.allocated_to_pool IS 'Whether this revenue has been allocated to the recruitment pool for commission funding';
COMMENT ON COLUMN public.referral_events.revenue_event_id IS 'Links referral to the specific revenue event that funded it';
COMMENT ON VIEW public.v_revenue_attribution IS 'Revenue attribution view showing which revenue events funded which referrals';
