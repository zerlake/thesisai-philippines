'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Get user's referral code
export async function getReferralCode() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.referral_code;
}

// Get referral history
export async function getReferralHistory() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('v_user_referral_history')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Validate referral code
export async function validateReferralCode(code: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, role_type')
    .eq('referral_code', code)
    .single();

  if (error || !data) {
    return { valid: false, error: 'Invalid referral code' };
  }

  return { 
    valid: true, 
    referrer: {
      id: data.id,
      name: `${data.first_name} ${data.last_name}`,
      role: data.role_type
    }
  };
}

// Get user's payouts
export async function getUserPayouts() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('payouts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Process referral for a new user
export async function processReferral(referrerId: string, referredId: string, eventType: string) {
  const supabase = await createClient();

  // Calculate commission based on event type
  let commissionAmount = 0;
  let poolAllocation = '';
  
  switch (eventType) {
    case 'student_subscription':
      commissionAmount = 150; // ₱150 per student referral
      poolAllocation = 'student_35';
      break;
    case 'advisor_recruitment':
      commissionAmount = 500; // Base amount, could be tiered
      poolAllocation = 'advisor_35';
      break;
    case 'critic_recruitment':
      commissionAmount = 800; // Base amount
      poolAllocation = 'critic_30';
      break;
    default:
      throw new Error('Invalid event type');
  }

  const { data, error } = await supabase
    .from('referral_events')
    .insert([{
      referrer_id: referrerId,
      referred_id: referredId,
      event_type: eventType,
      commission_amount: commissionAmount,
      pool_allocation: poolAllocation,
      status: 'pending' // Needs admin approval
    }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Revalidate relevant paths
  revalidatePath('/dashboard');
  revalidatePath('/referrals');

  return data;
}

// Admin: Update referral status
export async function updateReferralStatus(referralId: string, status: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Verify user is admin
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('role_type')
    .eq('id', user.id)
    .single();

  if (profileError || profileData?.role_type !== 'admin') {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('referral_events')
    .update({ 
      status,
      approved_at: status === 'approved' ? new Date().toISOString() : null
    })
    .eq('id', referralId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/referrals');
  return data;
}