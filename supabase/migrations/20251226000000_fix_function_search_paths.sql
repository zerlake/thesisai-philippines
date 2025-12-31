-- Fix Function Search Path Mutable Security Warning
-- This migration sets an immutable search_path for all public functions
-- to prevent search path injection attacks (Supabase linter rule 0011)

-- Use DO block to safely alter functions that exist
DO $$
DECLARE
  func_record RECORD;
BEGIN
  -- Get all functions in the public schema that need search_path fixed
  FOR func_record IN
    SELECT p.proname as name,
           pg_get_function_identity_arguments(p.oid) as args,
           p.oid
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname IN (
      'submit_document_review',
      'get_advisor_id',
      'check_goal_completion',
      'handle_document_submission_notification',
      'handle_new_review_notification',
      'handle_milestone_notification',
      'handle_advisor_request_notification',
      'get_student_next_action',
      'get_at_risk_students_for_advisor',
      'is_related_to_document',
      'handle_new_user',
      'cleanup_old_metrics',
      'generate_referral_code',
      'assign_referral_code',
      'distribute_referral_credits',
      'submit_critic_review',
      'update_review_notes_updated_at',
      'transfer_credits',
      'handle_critic_resubmission_notification',
      'get_students_for_critic_review',
      'request_payout',
      'get_critic_students_details',
      'handle_critic_request_notification',
      'increment_credit_balance',
      'get_critic_dashboard_analytics',
      'get_advisor_dashboard_analytics',
      'log_security_event',
      'get_payout_verification_status',
      'update_updated_at_column',
      'get_referrer_details',
      'log_audit_event',
      'dmp_restrict_advisor_update',
      'profiles_set_full_name',
      'get_user_validation_history',
      'save_originality_check',
      'get_user_check_history',
      'handle_updated_at'
    )
  LOOP
    BEGIN
      EXECUTE format('ALTER FUNCTION public.%I(%s) SET search_path = public',
        func_record.name, func_record.args);
      RAISE NOTICE 'Fixed search_path for function: %.%(%)', 'public', func_record.name, func_record.args;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not alter function %.%(%): %', 'public', func_record.name, func_record.args, SQLERRM;
    END;
  END LOOP;
END $$;

-- Add comment explaining the security fix
COMMENT ON SCHEMA public IS 'Standard public schema with security-hardened functions (search_path locked)';
