'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import type { RevenueEvent, RevenueAttribution } from '@/types/referral';

// Create a new revenue event
export async function createRevenueEvent(
  sourceType: string,
  sourceUserId: string,
  amount: number,
  options: {
    billingPeriodStart?: Date;
    billingPeriodEnd?: Date;
    billingCycle?: string;
    subscriptionPlan?: string;
    externalTransactionId?: string;
    paymentGateway?: string;
    metadata?: Record<string, any>;
    notes?: string;
  } = {}
): Promise<RevenueEvent> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('revenue_events').insert({
    source_type: sourceType,
    source_user_id: sourceUserId,
    amount,
    currency: 'PHP',
    billing_period_start: options.billingPeriodStart?.toISOString(),
    billing_period_end: options.billingPeriodEnd?.toISOString(),
    billing_cycle: options.billingCycle,
    subscription_plan: options.subscriptionPlan,
    external_transaction_id: options.externalTransactionId,
    payment_gateway: options.paymentGateway,
    metadata: options.metadata || {},
    notes: options.notes,
    status: 'pending',
  }).select().single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/referrals');
  revalidatePath('/admin/analytics');

  return data as RevenueEvent;
}

// Confirm revenue event (triggers pool allocation)
export async function confirmRevenueEvent(
  revenueId: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('revenue_events')
    .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
    .eq('id', revenueId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/referrals');
}

// Void a revenue event
export async function voidRevenueEvent(
  revenueId: string,
  reason: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('revenue_events')
    .update({
      status: 'void',
      voided_at: new Date().toISOString(),
      void_reason: reason,
    })
    .eq('id', revenueId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/referrals');
}

// Link revenue event to specific referral
export async function linkRevenueToReferral(
  revenueId: string,
  referralId: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('referral_events')
    .update({ revenue_event_id: revenueId })
    .eq('id', referralId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/referrals');
  revalidatePath('/admin/referrals');
}

// Get revenue events for user
export async function getUserRevenueEvents(
  userId: string,
  status?: string
): Promise<RevenueEvent[]> {
  const supabase = await createClient();

  let query = supabase
    .from('revenue_events')
    .select('*')
    .eq('source_user_id', userId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data as RevenueEvent[] || [];
}

// Get unallocated revenue (for pool management)
export async function getUnallocatedRevenue(): Promise<RevenueEvent[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('revenue_events')
    .select('*')
    .eq('allocated_to_pool', false)
    .eq('status', 'confirmed')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as RevenueEvent[] || [];
}

// Get revenue attribution report
export async function getRevenueAttribution(
  startDate?: Date,
  endDate?: Date,
  sourceType?: string
): Promise<RevenueAttribution[]> {
  const supabase = await createClient();

  let query = supabase
    .from('v_revenue_attribution')
    .select('*')
    .order('created_at', { ascending: false });

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }

  if (endDate) {
    query = query.lte('created_at', endDate.toISOString());
  }

  if (sourceType) {
    query = query.eq('source_type', sourceType);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data as RevenueAttribution[] || [];
}

// Get unallocated pool stats
export async function getUnallocatedPoolStats(): Promise<{
  totalRevenue: number;
  allocatedPool: number;
  unallocated: number;
  allocationPercentage: number;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('calculate_unallocated_pool');

  if (error) {
    throw new Error(error.message);
  }

  const [stats] = data as any[] || [];

  return {
    totalRevenue: stats?.total_revenue || 0,
    allocatedPool: stats?.allocated_pool || 0,
    unallocated: stats?.unallocated || 0,
    allocationPercentage: stats?.allocation_percentage || 0,
  };
}

// Manual revenue adjustment (admin only)
export async function manualRevenueAdjustment(
  revenueId: string,
  newAmount: number,
  reason: string
): Promise<void> {
  const supabase = await createClient();

  // Get current revenue event
  const { data: currentData, error: fetchError } = await supabase
    .from('revenue_events')
    .select('amount')
    .eq('id', revenueId)
    .single();

  if (fetchError || !currentData) {
    throw new Error('Revenue event not found');
  }

  const amountDelta = newAmount - (currentData as any).amount;

  // Update revenue event
  const { error: updateError } = await supabase
    .from('revenue_events')
    .update({
      amount: newAmount,
      metadata: {
        ...(currentData as any).metadata || {},
        manual_adjustment: true,
        adjustment_amount: amountDelta,
        adjustment_reason: reason,
      },
    })
    .eq('id', revenueId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  // Log admin action
  await supabase.rpc('adjust_pool', {
    p_pool_id: (currentData as any).pool_id,
    p_amount_delta: amountDelta,
    p_reason: reason,
  });

  revalidatePath('/admin/referrals');
  revalidatePath('/admin/analytics');
}
