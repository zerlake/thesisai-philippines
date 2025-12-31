-- Migration: Add ThesisAI Referral System - Auto Alerts
-- Adds triggers to send real-time alerts to the edge function

-- Enable the pg_net extension for calling external webhooks
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to send alerts to the edge function when pool utilization is high
DROP FUNCTION IF EXISTS alert_pool_high_utilization();
CREATE OR REPLACE FUNCTION alert_pool_high_utilization()
RETURNS TRIGGER AS $$
DECLARE
    utilization_student NUMERIC;
    utilization_advisor NUMERIC;
    utilization_critic NUMERIC;
    payload JSONB;
BEGIN
    -- Calculate utilization percentages
    IF NEW.student_allocation > 0 THEN
        utilization_student := ((NEW.spent_student / NEW.student_allocation) * 100);
    ELSE
        utilization_student := 0;
    END IF;
    
    IF NEW.advisor_allocation > 0 THEN
        utilization_advisor := ((NEW.spent_advisor / NEW.advisor_allocation) * 100);
    ELSE
        utilization_advisor := 0;
    END IF;
    
    IF NEW.critic_allocation > 0 THEN
        utilization_critic := ((NEW.spent_critic / NEW.critic_allocation) * 100);
    ELSE
        utilization_critic := 0;
    END IF;
    
    -- Prepare payload for the edge function
    payload := jsonb_build_object(
        'type', TG_OP,
        'table', TG_TABLE_NAME,
        'record', jsonb_build_object(
            'id', NEW.id,
            'period_start', NEW.period_start,
            'pool_amount', NEW.pool_amount,
            'student_allocation', NEW.student_allocation,
            'advisor_allocation', NEW.advisor_allocation,
            'critic_allocation', NEW.critic_allocation,
            'spent_student', NEW.spent_student,
            'spent_advisor', NEW.spent_advisor,
            'spent_critic', NEW.spent_critic,
            'status', NEW.status
        )
    );
    
    -- Send alert if any pool utilization exceeds 85%
    IF utilization_student > 85 OR utilization_advisor > 85 OR utilization_critic > 85 THEN
        -- Call the edge function via HTTP
        PERFORM net.http_post(
            url := 'https://dnyjgzzfyzrsucucexhy.functions.supabase.co/referral-alerts',
            headers := jsonb_build_object('Content-Type', 'application/json'),
            body := payload
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to send alerts for new referral events
DROP FUNCTION IF EXISTS alert_new_referral();
CREATE OR REPLACE FUNCTION alert_new_referral()
RETURNS TRIGGER AS $$
DECLARE
    payload JSONB;
BEGIN
    -- Prepare payload for the edge function
    payload := jsonb_build_object(
        'type', TG_OP,
        'table', TG_TABLE_NAME,
        'record', jsonb_build_object(
            'id', NEW.id,
            'referrer_id', NEW.referrer_id,
            'referred_id', NEW.referred_id,
            'event_type', NEW.event_type,
            'status', NEW.status,
            'commission_amount', NEW.commission_amount,
            'pool_allocation', NEW.pool_allocation,
            'created_at', NEW.created_at
        )
    );
    
    -- Send alert for high commission amounts (potential fraud signals)
    IF NEW.commission_amount > 1000 THEN
        -- Call the edge function via HTTP
        PERFORM net.http_post(
            url := 'https://dnyjgzzfyzrsucucexhy.functions.supabase.co/referral-alerts',
            headers := jsonb_build_object('Content-Type', 'application/json'),
            body := payload
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to send alerts for new audit events
DROP FUNCTION IF EXISTS alert_new_audit();
CREATE OR REPLACE FUNCTION alert_new_audit()
RETURNS TRIGGER AS $$
DECLARE
    payload JSONB;
BEGIN
    -- Prepare payload for the edge function
    payload := jsonb_build_object(
        'type', TG_OP,
        'table', TG_TABLE_NAME,
        'record', jsonb_build_object(
            'id', NEW.id,
            'referral_event_id', NEW.referral_event_id,
            'audit_type', NEW.audit_type,
            'score', NEW.score,
            'action_taken', NEW.action_taken,
            'notes', NEW.notes,
            'created_at', NEW.created_at
        )
    );
    
    -- Send alert for high-risk audits (score >= 75)
    IF NEW.score >= 75 THEN
        -- Call the edge function via HTTP
        PERFORM net.http_post(
            url := 'https://dnyjgzzfyzrsucucexhy.functions.supabase.co/referral-alerts',
            headers := jsonb_build_object('Content-Type', 'application/json'),
            body := payload
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to call the alert functions
CREATE TRIGGER trg_alert_pool_utilization
    AFTER INSERT OR UPDATE ON public.recruitment_pool
    FOR EACH ROW EXECUTE FUNCTION alert_pool_high_utilization();

CREATE TRIGGER trg_alert_new_referral
    AFTER INSERT ON public.referral_events
    FOR EACH ROW EXECUTE FUNCTION alert_new_referral();

CREATE TRIGGER trg_alert_new_audit
    AFTER INSERT ON public.referral_audits
    FOR EACH ROW EXECUTE FUNCTION alert_new_audit();

-- Grant execute permissions for the net.http_post function
GRANT USAGE ON SCHEMA net TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA net TO service_role;