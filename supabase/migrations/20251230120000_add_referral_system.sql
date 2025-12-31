-- Migration: Add ThesisAI Referral Tracking (15% Recruitment Pool)
-- Schema for Students, Advisors, Critics referral/recruitment system
-- Compatible with Supabase/PostgreSQL

-- Enable UUID extension if not already (Supabase default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- 1. Extend existing profiles table with referral fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS role_type VARCHAR(20) DEFAULT 'student',
ADD COLUMN IF NOT EXISTS recruitment_tier INTEGER DEFAULT 0 CHECK (recruitment_tier >= 0 AND recruitment_tier <= 5),
ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS pending_payouts DECIMAL(10,2) DEFAULT 0.00;

-- Create indexes for referral lookups
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by);
CREATE INDEX IF NOT EXISTS idx_profiles_role_type ON public.profiles(role_type);

-- DEFINE ENUM TYPES
DO $$ BEGIN
    CREATE TYPE public.referral_event_type AS ENUM('student_subscription', 'advisor_recruitment', 'critic_recruitment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.referral_event_status AS ENUM('pending', 'approved', 'rejected', 'paid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.recruitment_pool_period_type AS ENUM('monthly', 'yearly');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.recruitment_pool_status AS ENUM('open', 'closed', 'finalized');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.payout_type AS ENUM('student_referral', 'advisor_tier', 'advisor_milestone', 'critic_tier', 'critic_quality');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.payout_status AS ENUM('pending', 'approved', 'paid', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.payout_method AS ENUM('credits', 'gcash', 'bank');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.referral_audit_type AS ENUM('self_referral', 'duplicate', 'low_quality', 'suspicious_volume');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.referral_audit_action AS ENUM('warning', 'rejected', 'banned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- 2. Referral events table (tracks subscription activations, recruitments)
CREATE TABLE IF NOT EXISTS public.referral_events (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_type public.referral_event_type NOT NULL,
    status public.referral_event_status DEFAULT 'pending',
    subscription_amount DECIMAL(10,2), -- For student subscriptions
    commission_amount DECIMAL(10,2) DEFAULT 0.00,
    pool_allocation VARCHAR(20), -- 'student_35', 'advisor_35', 'critic_30'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'
);

-- Create indexes for referral events
CREATE INDEX IF NOT EXISTS idx_referral_events_referrer ON public.referral_events(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_referred ON public.referral_events(referred_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_status ON public.referral_events(status);
CREATE INDEX IF NOT EXISTS idx_referral_events_created ON public.referral_events(created_at);
CREATE INDEX IF NOT EXISTS idx_referral_events_type ON public.referral_events(event_type);

-- Add unique constraint to prevent duplicate referrals for same user/event type
ALTER TABLE public.referral_events DROP CONSTRAINT IF EXISTS unique_referral_per_referred;
ALTER TABLE public.referral_events ADD CONSTRAINT unique_referral_per_referred UNIQUE (referred_id, event_type);

-- 3. Recruitment pool ledger (15% of revenue, tracked monthly/yearly)
CREATE TABLE IF NOT EXISTS public.recruitment_pool (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    period_type public.recruitment_pool_period_type NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_revenue DECIMAL(12,2) NOT NULL, -- ₱660k Year 1 example
    pool_percentage DECIMAL(5,2) NOT NULL DEFAULT 15.00, -- 15% target
    pool_amount DECIMAL(12,2) NOT NULL, -- revenue * 0.15
    student_allocation DECIMAL(12,2) NOT NULL, -- 35% of pool
    advisor_allocation DECIMAL(12,2) NOT NULL, -- 35% of pool
    critic_allocation DECIMAL(12,2) NOT NULL, -- 30% of pool
    spent_student DECIMAL(12,2) DEFAULT 0.00,
    spent_advisor DECIMAL(12,2) DEFAULT 0.00,
    spent_critic DECIMAL(12,2) DEFAULT 0.00,
    status public.recruitment_pool_status DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(period_type, period_start)
);

-- Sample Year 1 pool record (₱660k revenue)
INSERT INTO public.recruitment_pool (
    period_type, period_start, period_end, total_revenue, pool_percentage, pool_amount,
    student_allocation, advisor_allocation, critic_allocation
) VALUES (
    'yearly', '2026-01-01', '2026-12-31', 660000.00, 15.00, 99000.00,
    34650.00, 34650.00, 29700.00
) ON CONFLICT (period_type, period_start) DO NOTHING;

-- 4. Payouts table (claimable earnings)
CREATE TABLE IF NOT EXISTS public.payouts (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    pool_id UUID REFERENCES public.recruitment_pool(id),
    amount DECIMAL(10,2) NOT NULL,
    payout_type public.payout_type NOT NULL,
    status public.payout_status DEFAULT 'pending',
    payout_method public.payout_method DEFAULT 'credits',
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for payouts
CREATE INDEX IF NOT EXISTS idx_payouts_user ON public.payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_type ON public.payouts(payout_type);

-- 5. Anti-abuse tracking
CREATE TABLE IF NOT EXISTS public.referral_audits (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    referral_event_id UUID REFERENCES public.referral_events(id) ON DELETE CASCADE,
    audit_type public.referral_audit_type NOT NULL,
    score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
    action_taken public.referral_audit_action DEFAULT 'warning',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for audits
CREATE INDEX IF NOT EXISTS idx_referral_audits_event ON public.referral_audits(referral_event_id);

-- 6. RLS policies (Supabase Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_audits ENABLE ROW LEVEL SECURITY;

-- User can see own referrals/payouts
CREATE POLICY "Users see own referrals" ON public.referral_events
    FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users see own payouts" ON public.payouts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users update own profile referrals" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins see all referrals" ON public.referral_events
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role_type = 'admin')
    );

CREATE POLICY "Admins see all pools" ON public.recruitment_pool
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role_type = 'admin')
    );

CREATE POLICY "Admins manage all audits" ON public.referral_audits
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role_type = 'admin')
    );

-- 7. Functions and Triggers

-- Function to generate unique referral codes
DROP FUNCTION IF EXISTS generate_referral_code();
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
DECLARE
    code TEXT;
    code_exists BOOLEAN;
BEGIN
    -- Only generate referral code for new users
    IF NEW.referral_code IS NULL THEN
        LOOP
            -- Generate a random 8-character referral code
            code := UPPER(SUBSTRING(encode(gen_random_bytes(6), 'hex') FROM 1 FOR 8));
            
            -- Check if code already exists
            SELECT EXISTS(
                SELECT 1 FROM public.profiles WHERE referral_code = code
            ) INTO code_exists;
            
            -- Exit loop if code is unique
            EXIT WHEN NOT code_exists;
        END LOOP;
        
        NEW.referral_code := code;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to profiles table
CREATE TRIGGER trg_generate_referral_code
    BEFORE INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION generate_referral_code();

-- Function to validate referrals (prevent self-referral)
DROP FUNCTION IF EXISTS validate_referral();
CREATE OR REPLACE FUNCTION validate_referral()
RETURNS TRIGGER AS $$
DECLARE
    referrer_exists BOOLEAN;
BEGIN
    -- Check if referral is valid (not self-referral)
    IF NEW.referred_by IS NOT NULL THEN
        -- Ensure referrer exists
        SELECT EXISTS(
            SELECT 1 FROM public.profiles WHERE id = NEW.referred_by
        ) INTO referrer_exists;
        
        IF NOT referrer_exists THEN
            RAISE EXCEPTION 'Invalid referrer ID';
        END IF;
        
        -- Prevent self-referral
        IF NEW.id = NEW.referred_by THEN
            RAISE EXCEPTION 'Cannot refer yourself';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to profiles table
CREATE TRIGGER trg_validate_referral
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION validate_referral();

-- Function to update user referral statistics
DROP FUNCTION IF EXISTS update_user_referral_stats();
CREATE OR REPLACE FUNCTION update_user_referral_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles 
    SET total_referrals = (
        SELECT COUNT(*) FROM public.referral_events 
        WHERE referrer_id = NEW.referrer_id AND status = 'approved'
    ),
    total_earnings = (
        SELECT COALESCE(SUM(amount), 0) FROM public.payouts
        WHERE user_id = NEW.referrer_id AND status = 'paid'
    )
    WHERE id = NEW.referrer_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to referral_events table
CREATE TRIGGER trg_update_referral_stats
    AFTER INSERT OR UPDATE OF status ON public.referral_events
    FOR EACH ROW EXECUTE FUNCTION update_user_referral_stats();

-- Function to update pool allocation when referral status changes
DROP FUNCTION IF EXISTS update_pool_allocation();
CREATE OR REPLACE FUNCTION update_pool_allocation()
RETURNS TRIGGER AS $$
DECLARE
    pool_id UUID;
    allocation_col TEXT;
BEGIN
    -- Only process if status changed to approved
    IF (NEW.status = 'approved' AND OLD.status != 'approved') OR 
       (TG_OP = 'INSERT' AND NEW.status = 'approved') THEN
        
        -- Determine which pool allocation column to update
        CASE NEW.pool_allocation
            WHEN 'student_35' THEN allocation_col := 'spent_student';
            WHEN 'advisor_35' THEN allocation_col := 'spent_advisor';
            WHEN 'critic_30' THEN allocation_col := 'spent_critic';
            ELSE RAISE EXCEPTION 'Invalid pool allocation: %', NEW.pool_allocation;
        END CASE;
        
        -- Get the current open pool
        SELECT id INTO pool_id 
        FROM public.recruitment_pool 
        WHERE status = 'open' 
        ORDER BY period_start DESC 
        LIMIT 1;
        
        -- Update the pool allocation if pool exists
        IF pool_id IS NOT NULL THEN
            EXECUTE format('UPDATE public.recruitment_pool SET %I = %I + $1 WHERE id = $2', 
                          allocation_col, allocation_col)
            USING NEW.commission_amount, pool_id;
        END IF;
        
        -- Create corresponding payout record
        INSERT INTO public.payouts (
            user_id, 
            pool_id, 
            amount, 
            payout_type,
            status
        ) VALUES (
            NEW.referrer_id,
            pool_id,
            NEW.commission_amount,
            CASE NEW.event_type
                WHEN 'student_subscription' THEN 'student_referral'
                WHEN 'advisor_recruitment' THEN 'advisor_tier'
                WHEN 'critic_recruitment' THEN 'critic_tier'
            END,
            'pending'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to referral_events table
CREATE TRIGGER trg_update_pool_allocation
    AFTER INSERT OR UPDATE OF status ON public.referral_events
    FOR EACH ROW EXECUTE FUNCTION update_pool_allocation();

-- Function to check for duplicate referrals
DROP FUNCTION IF EXISTS check_duplicate_referral();
CREATE OR REPLACE FUNCTION check_duplicate_referral()
RETURNS TRIGGER AS $$
DECLARE
    existing_referral_id UUID;
BEGIN
    -- Check if this user has already been referred for this event type
    SELECT id INTO existing_referral_id
    FROM public.referral_events
    WHERE referred_id = NEW.referred_id 
    AND event_type = NEW.event_type;
    
    IF existing_referral_id IS NOT NULL THEN
        RAISE EXCEPTION 'User has already been referred for this event type';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_duplicate_referral
    BEFORE INSERT ON public.referral_events
    FOR EACH ROW EXECUTE FUNCTION check_duplicate_referral();

-- Function to enforce daily referral limits
DROP FUNCTION IF EXISTS check_daily_referral_limit();
CREATE OR REPLACE FUNCTION check_daily_referral_limit()
RETURNS TRIGGER AS $$
DECLARE
    daily_count INTEGER;
    max_daily_limit INTEGER := 5; -- Configurable limit
BEGIN
    -- Count referrals made by this user today
    SELECT COUNT(*) INTO daily_count
    FROM public.referral_events
    WHERE referrer_id = NEW.referrer_id
    AND DATE(created_at) = CURRENT_DATE;
    
    -- Check if limit is exceeded
    IF daily_count >= max_daily_limit THEN
        RAISE EXCEPTION 'Daily referral limit exceeded (% referrals per day)', max_daily_limit;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_daily_referral_limit
    BEFORE INSERT ON public.referral_events
    FOR EACH ROW EXECUTE FUNCTION check_daily_referral_limit();

-- 8. Views for dashboard reporting
CREATE OR REPLACE VIEW public.v_recruitment_dashboard AS
SELECT 
    rp.period_start,
    rp.pool_amount,
    rp.student_allocation - rp.spent_student as student_remaining,
    rp.advisor_allocation - rp.spent_advisor as advisor_remaining,
    rp.critic_allocation - rp.spent_critic as critic_remaining,
    (SELECT COUNT(*) FROM public.referral_events re 
     WHERE re.status = 'approved' AND re.pool_allocation LIKE 'student_%' 
     AND re.created_at >= rp.period_start AND re.created_at < rp.period_end) as student_referrals_approved,
    (SELECT COUNT(*) FROM public.referral_events re 
     WHERE re.status = 'approved' AND re.pool_allocation LIKE 'advisor_%' 
     AND re.created_at >= rp.period_start AND re.created_at < rp.period_end) as advisor_recruitments_approved,
    (SELECT COUNT(*) FROM public.referral_events re 
     WHERE re.status = 'approved' AND re.pool_allocation LIKE 'critic_%' 
     AND re.created_at >= rp.period_start AND re.created_at < rp.period_end) as critic_recruitments_approved
FROM public.recruitment_pool rp
WHERE rp.status = 'open';

-- 9. Create a view for user referral history
CREATE OR REPLACE VIEW public.v_user_referral_history AS
SELECT 
    re.id,
    re.referrer_id,
    re.referred_id,
    re.event_type,
    re.status,
    re.commission_amount,
    re.created_at,
    re.approved_at,
    p_referred.first_name as referred_first_name,
    p_referred.last_name as referred_last_name,
    p_referred.email as referred_email
FROM public.referral_events re
JOIN public.profiles p_referred ON re.referred_id = p_referred.id
WHERE re.referrer_id = auth.uid();

-- Expected Year 1 results at 15% pool:
-- Pool: ₱99,000 | Students: ₱34,650 | Advisors: ₱34,650 | Critics: ₱29,700
-- All tables ready for Next.js/Supabase integration