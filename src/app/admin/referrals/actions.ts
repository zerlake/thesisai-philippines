// app/admin/referrals/actions.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function approvePendingReferrals() {
  const supabase = createClient();
  
  try {
    // Get the current user to verify admin status
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Check if user is admin
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role_type')
      .eq('id', user.id)
      .single();

    if (profileError || profileData?.role_type !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    // Get pending referrals without fraud flags (low-risk referrals)
    const { data: lowRiskReferrals, error: fetchError } = await supabase
      .from('referral_events')
      .select('id')
      .eq('status', 'pending')
      .or('metadata->>fraud_score.is.null, metadata->>fraud_score.lt.50'); // No fraud flag or low score

    if (fetchError) {
      throw new Error(`Error fetching pending referrals: ${fetchError.message}`);
    }

    if (lowRiskReferrals.length === 0) {
      return { success: true, message: 'No low-risk pending referrals to approve' };
    }

    // Update status to approved and set approved_at timestamp
    const { error: updateError } = await supabase
      .from('referral_events')
      .update({ 
        status: 'approved', 
        approved_at: new Date().toISOString() 
      })
      .in('id', lowRiskReferrals.map(r => r.id));

    if (updateError) {
      throw new Error(`Error updating referrals: ${updateError.message}`);
    }

    // Revalidate the dashboard to reflect changes
    revalidatePath('/admin/referrals/dashboard');
    
    return { 
      success: true, 
      message: `Successfully approved ${lowRiskReferrals.length} low-risk referrals` 
    };
  } catch (error) {
    console.error('Error in approvePendingReferrals:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to approve pending referrals' 
    };
  }
}

export async function rejectPendingReferrals(referralIds: string[]) {
  const supabase = createClient();
  
  try {
    // Get the current user to verify admin status
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Check if user is admin
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role_type')
      .eq('id', user.id)
      .single();

    if (profileError || profileData?.role_type !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    // Update status to rejected
    const { error: updateError } = await supabase
      .from('referral_events')
      .update({ 
        status: 'rejected',
        approved_at: null
      })
      .in('id', referralIds);

    if (updateError) {
      throw new Error(`Error rejecting referrals: ${updateError.message}`);
    }

    // Revalidate the dashboard to reflect changes
    revalidatePath('/admin/referrals/dashboard');
    
    return { 
      success: true, 
      message: `Successfully rejected ${referralIds.length} referrals` 
    };
  } catch (error) {
    console.error('Error in rejectPendingReferrals:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to reject pending referrals' 
    };
  }
}

export async function updateReferralStatus(referralId: string, status: 'pending' | 'approved' | 'rejected' | 'paid') {
  const supabase = createClient();
  
  try {
    // Get the current user to verify admin status
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Check if user is admin
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role_type')
      .eq('id', user.id)
      .single();

    if (profileError || profileData?.role_type !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    // Update referral status
    const { data, error: updateError } = await supabase
      .from('referral_events')
      .update({ 
        status,
        approved_at: status === 'approved' ? new Date().toISOString() : null
      })
      .eq('id', referralId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Error updating referral: ${updateError.message}`);
    }

    // Revalidate the dashboard to reflect changes
    revalidatePath('/admin/referrals/dashboard');
    
    return { 
      success: true, 
      message: `Successfully updated referral status to ${status}`,
      referral: data
    };
  } catch (error) {
    console.error('Error in updateReferralStatus:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to update referral status' 
    };
  }
}

export async function getReferralAnalytics() {
  const supabase = createClient();
  
  try {
    // Get the current user to verify admin status
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Check if user is admin
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role_type')
      .eq('id', user.id)
      .single();

    if (profileError || profileData?.role_type !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    // Get referral analytics
    const { data, error } = await supabase
      .rpc('get_referral_abuse_indicators');

    if (error) {
      throw new Error(`Error fetching referral analytics: ${error.message}`);
    }

    return { 
      success: true,
      analytics: data
    };
  } catch (error) {
    console.error('Error in getReferralAnalytics:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to fetch referral analytics' 
    };
  }
}