'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import type { FinancialDashboardMetrics, MetricsTrend, MonthOverMonthGrowth } from '@/types/referral';

// Get comprehensive financial dashboard metrics
export async function getFinancialDashboardMetrics(): Promise<FinancialDashboardMetrics> {
  const supabase = await createClient();

  // 1. Pool Health
  const { data: poolData } = await supabase
    .from('recruitment_pool')
    .select('*')
    .eq('status', 'open')
    .order('period_start', { ascending: false })
    .limit(1)
    .single();

  const pool = poolData as any;
  const poolHealth = {
    totalRevenue: pool?.total_revenue || 0,
    poolPercentage: pool?.pool_percentage || 0,
    poolAmount: pool?.pool_amount || 0,
    remainingBalance: (pool?.pool_amount || 0) - (pool?.spent_student || 0) - (pool?.spent_advisor || 0) - (pool?.spent_critic || 0),
    utilizationRate: pool?.pool_amount > 0
      ? (((pool?.spent_student || 0) + (pool?.spent_advisor || 0) + (pool?.spent_critic || 0)) / pool.pool_amount) * 100
      : 0,
    studentAllocationUsed: pool?.spent_student || 0,
    studentAllocationRemaining: (pool?.student_allocation || 0) - (pool?.spent_student || 0),
    advisorAllocationUsed: pool?.spent_advisor || 0,
    advisorAllocationRemaining: (pool?.advisor_allocation || 0) - (pool?.spent_advisor || 0),
    criticAllocationUsed: pool?.spent_critic || 0,
    criticAllocationRemaining: (pool?.critic_allocation || 0) - (pool?.spent_critic || 0),
  };

  // 2. Payout Status
  const { data: allPayouts } = await supabase
    .from('payouts')
    .select('status, amount');

  const payoutStats = {
    pendingCount: allPayouts?.filter(p => p.status === 'pending').length || 0,
    pendingAmount: allPayouts?.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
    approvedCount: allPayouts?.filter(p => p.status === 'approved').length || 0,
    approvedAmount: allPayouts?.filter(p => p.status === 'approved').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
    paidCount: allPayouts?.filter(p => p.status === 'paid').length || 0,
    paidAmount: allPayouts?.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
    cancelledCount: allPayouts?.filter(p => p.status === 'cancelled').length || 0,
    cancelledAmount: allPayouts?.filter(p => p.status === 'cancelled').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
  };

  // 3. Total Paid Out
  const totalPaidOut = payoutStats.paidAmount;

  // 4. Active Referrers (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: recentReferrals } = await supabase
    .from('referral_events')
    .select('referrer_id')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .eq('status', 'approved');

  const uniqueReferrers = new Set((recentReferrals || []).map(r => r.referrer_id));
  const activeReferrersLast30Days = uniqueReferrers.size;

  // 5. Fraud Flags (last 30 days)
  const { data: recentFraudFlags } = await supabase
    .from('referral_risk_assessment')
    .select('risk_level, created_at')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .in('risk_level', ['high', 'critical']);

  const recentFraud = recentFraudFlags?.length || 0;

  const { data: allRisks } = await supabase
    .from('referral_risk_assessment')
    .select('risk_level');

  const riskIndicators = {
    totalFlags: allRisks?.length || 0,
    criticalFlags: allRisks?.filter(r => r.risk_level === 'critical').length || 0,
    highFlags: allRisks?.filter(r => r.risk_level === 'high').length || 0,
    mediumFlags: allRisks?.filter(r => r.risk_level === 'medium').length || 0,
    recentFraud,
    usersUnderReview: allRisks?.filter(r => r.status === 'reviewing').length || 0,
  };

  // 6. Performance Metrics
  const { data: allReferrals } = await supabase
    .from('referral_events')
    .select('commission_amount, status');

  const totalReferralsCount = allReferrals?.length || 0;
  const approvedReferralsCount = allReferrals?.filter(r => r.status === 'approved').length || 0;
  const rejectedReferralsCount = allReferrals?.filter(r => r.status === 'rejected').length || 0;
  const approvalRate = totalReferralsCount > 0
    ? (approvedReferralsCount / totalReferralsCount) * 100
    : 0;

  const approvedReferrals = allReferrals?.filter(r => r.status === 'approved') || [];
  const avgCommissionAmount = approvedReferrals.length > 0
    ? approvedReferrals.reduce((sum, r) => sum + (r.commission_amount || 0), 0) / approvedReferrals.length
    : 0;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: newReferrers } = await supabase
    .from('profiles')
    .select('id')
    .gt('created_at', sevenDaysAgo.toISOString());

  const performance = {
    totalReferrals: totalReferralsCount,
    approvedReferrals: approvedReferralsCount,
    rejectedReferrals: rejectedReferralsCount,
    approvalRate,
    avgCommissionAmount,
    conversionRate: 0, // Would need tracking of referral link clicks
    activeReferrersLast30Days,
    newReferrersLast7Days: (newReferrers || []).length,
  };

  // 7. Top Referrers
  const { data: topReferrersData } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, total_referrals, total_earnings, recruitment_tier')
    .not('total_referrals', null)
    .not('total_earnings', null)
    .order('total_earnings', { ascending: false })
    .limit(10);

  const topReferrers = (topReferrersData || []).map(r => ({
    id: r.id,
    first_name: r.first_name || '',
    last_name: r.last_name || '',
    email: r.email || '',
    total_referrals: r.total_referrals || 0,
    total_earnings: r.total_earnings || 0,
    recruitment_tier: r.recruitment_tier || 0,
  }));

  // 8. Get unallocated pool
  const { data: unallocatedData } = await supabase.rpc('calculate_unallocated_pool');

  const unallocated = (unallocatedData as any[])?.[0] || {};
  const unallocatedPool = unallocated.unallocated || 0;

  // 9. Avg Referral Value
  const avgReferralValue = approvedReferralsCount > 0
    ? (allReferrals?.filter(r => r.status === 'approved').reduce((sum, r) => sum + (r.commission_amount || 0), 0) / approvedReferralsCount)
    : 0;

  // 10. Fraud Flags Count (for dashboard summary)
  const fraudFlagsCount = allRisks?.filter(r => r.risk_level === 'critical' || r.risk_level === 'high').length || 0;

  return {
    totalRevenue: poolHealth.totalRevenue,
    totalReferralPool: poolHealth.poolAmount,
    allocatedPool: poolHealth.poolAmount - unallocatedPool,
    unallocatedPool,
    totalPaidOut,
    pendingPayouts: payoutStats.pendingCount,
    payoutRatio: totalPaidOut > 0 ? (payoutStats.paidAmount / poolHealth.poolAmount) * 100 : 0,
    avgReferralValue,
    fraudFlagsCount,
    activeReferrers: activeReferrersLast30Days,
    topReferrers,
    poolHealth,
    payoutStatus: payoutStats,
    riskIndicators,
    performance,
  };
}

// Get metrics for a date range (for trends)
export async function getMetricsTrend(
  startDate: Date,
  endDate: Date
): Promise<MetricsTrend[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_referral_metrics_range', {
    p_start_date: startDate.toISOString(),
    p_end_date: endDate.toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/referrals');

  return data as MetricsTrend[] || [];
}

// Get month-over-month growth metrics
export async function getMomGrowth(
  baseDate: Date,
  monthsBack: number = 1
): Promise<MonthOverMonthGrowth[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('calculate_mom_growth', {
    p_base_date: baseDate.toISOString(),
    p_months_back: monthsBack,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/referrals');

  return data as MonthOverMonthGrowth[] || [];
}

// Get 30-day metrics for dashboard
export async function get30DayMetrics(): Promise<MetricsTrend[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  return getMetricsTrend(startDate, new Date());
}

// Get monthly summary
export async function getMonthlySummary(
  year: number,
  month: number
): Promise<any[]> {
  const supabase = await createClient();

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999); // End of month

  const { data, error } = await supabase
    .from('v_referral_monthly_summary')
    .select('*')
    .gte('month', startDate.toISOString())
    .lt('month', endDate.toISOString())
    .order('month', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/referrals');

  return data || [];
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

  const [stats] = (data as any[]) || [];

  revalidatePath('/admin/referrals');

  return {
    totalRevenue: stats?.total_revenue || 0,
    allocatedPool: stats?.allocated_pool || 0,
    unallocated: stats?.unallocated || 0,
    allocationPercentage: stats?.allocation_percentage || 0,
  };
}

// Get top referrers for leaderboard
export async function getTopReferrers(
  limit: number = 10
): Promise<Array<{
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  total_referrals: number;
  total_earnings: number;
  recruitment_tier: number;
}>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, total_referrals, total_earnings, recruitment_tier')
    .not('total_referrals', null)
    .order('total_earnings', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/referrals');

  return data || [];
}

// Get referral workflow items for dashboard
export async function getReferralWorkflowItems(
  limit: number = 50,
  offset: number = 0
): Promise<any[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('v_referral_workflow_dashboard')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/referrals');

  return data || [];
}

// Get risk dashboard items
export async function getRiskDashboardItems(
  limit: number = 50,
  offset: number = 0
): Promise<any[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('v_risk_dashboard')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/referrals');

  return data || [];
}

// Get audit trail items
export async function getAuditTrailItems(
  limit: number = 100,
  offset: number = 0,
  adminId?: string,
  action?: string,
  targetId?: string
): Promise<any[]> {
  const supabase = await createClient();

  let query = supabase
    .from('v_admin_financial_audit_trail')
    .select('*')
    .order('created_at', { ascending: false });

  if (adminId) {
    query = query.eq('admin_id', adminId);
  }

  if (action) {
    query = query.eq('action', action);
  }

  if (targetId) {
    query = query.eq('target_id', targetId);
  }

  const { data, error } = await query.range(offset, offset + limit - 1);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/referrals');

  return data || [];
}

// Get revenue attribution data
export async function getRevenueAttributionData(
  startDate?: Date,
  endDate?: Date,
  sourceType?: string
): Promise<any[]> {
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

  revalidatePath('/admin/referrals');

  return data || [];
}

// Admin fraud review actions
export async function adminFlagReferralFraud(
  referralId: string,
  reason: string
): Promise<string> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('admin_flag_referral_fraud', {
    p_referral_id: referralId,
    p_notes: reason,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/referrals');

  return data || '';
}

export async function adminDismissRiskAssessment(
  riskId: string,
  notes: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('admin_dismiss_risk_assessment', {
    p_risk_id: riskId,
    p_notes: notes,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/referrals');

  return data || false;
}
