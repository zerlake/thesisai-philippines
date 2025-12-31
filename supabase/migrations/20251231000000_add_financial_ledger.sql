-- Migration: Add Financial Ledger for Double-Entry Style Tracking
-- Priority 1: Critical for audit and reconciliation

-- Create new enum types for ledger if they don't exist
DO $$ BEGIN
    CREATE TYPE public.ledger_transaction_type AS ENUM(
        'referral_earned',
        'payout_paid',
        'refund',
        'adjustment',
        'bonus',
        'penalty',
        'tier_upgrade',
        'milestone_bonus'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.ledger_status AS ENUM('pending', 'posted', 'reversed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Financial ledger table (double-entry style)
CREATE TABLE IF NOT EXISTS public.financial_ledger (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Transaction identification
    source_type VARCHAR(50) NOT NULL, -- 'referral', 'payout', 'adjustment', 'bonus', 'penalty'
    source_id UUID, -- Links to referral_event or payout ID
    transaction_type public.ledger_transaction_type NOT NULL,

    -- Amounts
    debit DECIMAL(10,2) DEFAULT 0.00,
    credit DECIMAL(10,2) DEFAULT 0.00,
    balance_after DECIMAL(10,2) NOT NULL,

    -- Currency (future-proof for multi-currency)
    currency VARCHAR(3) DEFAULT 'PHP',

    -- Transaction details
    description TEXT NOT NULL,
    status public.ledger_status DEFAULT 'posted',
    reference_number TEXT, -- External transaction reference

    -- Admin action for manual adjustments
    created_by_admin UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    admin_notes TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    posted_at TIMESTAMP WITH TIME ZONE,
    reversed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_financial_ledger_user ON public.financial_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_source ON public.financial_ledger(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_created ON public.financial_ledger(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_status ON public.financial_ledger(status);
CREATE INDEX IF NOT EXISTS idx_financial_ledger_balance ON public.financial_ledger(user_id, balance_after);

-- RLS Policies
ALTER TABLE public.financial_ledger ENABLE ROW LEVEL SECURITY;

-- Users can see their own ledger entries
CREATE POLICY "Users view own ledger" ON public.financial_ledger
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can view and manage all ledger entries
CREATE POLICY "Admins manage all ledger" ON public.financial_ledger
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role_type = 'admin'
        )
    );

-- Function to automatically create ledger entry when referral is approved
DROP FUNCTION IF EXISTS create_ledger_entry_for_referral();
CREATE OR REPLACE FUNCTION create_ledger_entry_for_referral()
RETURNS TRIGGER AS $$
DECLARE
    current_balance DECIMAL(10,2);
BEGIN
    -- Only create ledger entry for approved referrals
    IF (NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved')) THEN
        -- Get current balance
        SELECT COALESCE(SUM(credit) - SUM(debit), 0)
        INTO current_balance
        FROM public.financial_ledger
        WHERE user_id = NEW.referrer_id;

        -- Create credit entry for earned commission
        INSERT INTO public.financial_ledger (
            user_id,
            source_type,
            source_id,
            transaction_type,
            credit,
            balance_after,
            currency,
            description,
            status,
            posted_at
        ) VALUES (
            NEW.referrer_id,
            'referral',
            NEW.id,
            'referral_earned',
            NEW.commission_amount,
            current_balance + NEW.commission_amount,
            'PHP',
            format('Referral commission earned: %s', NEW.event_type),
            'posted',
            NOW()
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create ledger entries on referral approval
CREATE TRIGGER trg_create_ledger_for_referral
    AFTER INSERT OR UPDATE OF status ON public.referral_events
    FOR EACH ROW EXECUTE FUNCTION create_ledger_entry_for_referral();

-- Function to create ledger entry when payout is processed
DROP FUNCTION IF EXISTS create_ledger_entry_for_payout();
CREATE OR REPLACE FUNCTION create_ledger_entry_for_payout()
RETURNS TRIGGER AS $$
DECLARE
    current_balance DECIMAL(10,2);
BEGIN
    -- Only create ledger entry for paid payouts
    IF (NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid')) THEN
        -- Get current balance
        SELECT COALESCE(SUM(credit) - SUM(debit), 0)
        INTO current_balance
        FROM public.financial_ledger
        WHERE user_id = NEW.user_id;

        -- Create debit entry for paid amount
        INSERT INTO public.financial_ledger (
            user_id,
            source_type,
            source_id,
            transaction_type,
            debit,
            balance_after,
            currency,
            description,
            reference_number,
            status,
            posted_at
        ) VALUES (
            NEW.user_id,
            'payout',
            NEW.id,
            'payout_paid',
            NEW.amount,
            current_balance - NEW.amount,
            'PHP',
            format('Payout paid via %s', NEW.payout_method),
            NEW.transaction_id,
            'posted',
            NEW.paid_at
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create ledger entries on payout payment
CREATE TRIGGER trg_create_ledger_for_payout
    AFTER INSERT OR UPDATE OF status ON public.payouts
    FOR EACH ROW EXECUTE FUNCTION create_ledger_entry_for_payout();

-- Function to get user's current balance
DROP FUNCTION IF EXISTS get_user_balance(UUID);
CREATE OR REPLACE FUNCTION get_user_balance(p_user_id UUID)
RETURNS DECIMAL(10,2) AS $$
BEGIN
    RETURN (
        SELECT COALESCE(SUM(credit) - SUM(debit), 0)
        FROM public.financial_ledger
        WHERE user_id = p_user_id
        AND status = 'posted'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get user balance at a specific date (for reconciliation)
DROP FUNCTION IF EXISTS get_user_balance_at_date(UUID, TIMESTAMP WITH TIME ZONE);
CREATE OR REPLACE FUNCTION get_user_balance_at_date(p_user_id UUID, p_date TIMESTAMP WITH TIME ZONE)
RETURNS DECIMAL(10,2) AS $$
BEGIN
    RETURN (
        SELECT COALESCE(SUM(credit) - SUM(debit), 0)
        FROM public.financial_ledger
        WHERE user_id = p_user_id
        AND status = 'posted'
        AND created_at <= p_date
    );
END;
$$ LANGUAGE plpgsql;

-- Comment explaining the ledger
COMMENT ON TABLE public.financial_ledger IS 'Double-entry style financial ledger tracking all referral earnings and payouts for audit and reconciliation';
COMMENT ON COLUMN public.financial_ledger.debit IS 'Amount deducted from user balance (payouts, penalties, refunds)';
COMMENT ON COLUMN public.financial_ledger.credit IS 'Amount added to user balance (referrals, bonuses, adjustments)';
COMMENT ON COLUMN public.financial_ledger.balance_after IS 'Running balance after this transaction';
