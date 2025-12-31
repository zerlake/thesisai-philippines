import { createClient } from '@/utils/supabase/server';
import { ReferralEvent, Payout, RecruitmentDashboardData, ReferralHistoryItem } from '@/types/referral';

// Get user's referral statistics
export async function getUserReferralStats(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('total_referrals, total_earnings, pending_payouts, referral_code, recruitment_tier')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Get user's referral history
export async function getUserReferralHistory(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('v_user_referral_history')
    .select('*')
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as ReferralHistoryItem[];
}

// Get user's payouts
export async function getUserPayouts(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('payouts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Payout[];
}

// Get recruitment dashboard data (for admins)
export async function getRecruitmentDashboardData() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('v_recruitment_dashboard')
    .select('*');

  if (error) {
    throw new Error(error.message);
  }

  return data as RecruitmentDashboardData[];
}

// Get referral events for admin review
export async function getReferralsForReview() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('v_referral_review_queue')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Create a new referral event
export async function createReferralEvent(
  referrerId: string,
  referredId: string,
  eventType: 'student_subscription' | 'advisor_recruitment' | 'critic_recruitment',
  commissionAmount: number,
  poolAllocation: 'student_35' | 'advisor_35' | 'critic_30'
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('referral_events')
    .insert([{
      referrer_id: referrerId,
      referred_id: referredId,
      event_type: eventType,
      commission_amount: commissionAmount,
      pool_allocation: poolAllocation,
      status: 'pending'
    }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ReferralEvent;
}

// Update referral event status
export async function updateReferralEventStatus(
  eventId: string,
  status: 'pending' | 'approved' | 'rejected' | 'paid'
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('referral_events')
    .update({ 
      status,
      approved_at: status === 'approved' ? new Date().toISOString() : null
    })
    .eq('id', eventId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ReferralEvent;
}

// Get all referral events for a user
export async function getReferralEventsByUser(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('referral_events')
    .select('*')
    .or(`referrer_id.eq.${userId},referred_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as ReferralEvent[];
}