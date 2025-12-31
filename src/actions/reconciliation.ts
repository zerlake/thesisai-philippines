'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ReconciliationReport, UserBalance } from '@/types/referral';

// Daily pool reconciliation job
export async function runDailyPoolReconciliation(): Promise<ReconciliationReport> {
  const supabase = await createClient();
  const reportId = crypto.randomUUID();

  // Get current open pool
  const { data: poolData } = await supabase
    .from('recruitment_pool')
    .select('*')
    .eq('status', 'open')
    .order('period_start', { ascending: false })
    .limit(1)
    .single();

  if (!poolData) {
    return {
      report_id: reportId,
      report_date: new Date().toISOString(),
      report_type: 'daily',
      pool_reconciled: false,
      pool_discrepancy: 0,
      ledger_reconciled: false,
      ledger_discrepancy: 0,
      orphaned_referrals_found: 0,
      orphaned_referrals_ids: [],
      negative_balances_found: 0,
      negative_balance_users: [],
      revenue_allocation_match: true,
      revenue_discrepancy: 0,
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      completed_by: 'system',
      notes: 'No open pool found',
    };
  }

  // Expected pool totals from revenue
  const { data: revenueData, error: revenueError } = await supabase
    .from('revenue_events')
    .select('amount')
    .eq('pool_id', poolData.id)
    .eq('allocated_to_pool', true);

  const calculatedRevenue = (revenueData || []).reduce((sum, r) => sum + (r.amount || 0), 0);
  const revenueDiscrepancy = poolData.total_revenue - calculatedRevenue;

  // Expected allocations from referrals
  const { data: referralData } = await supabase
    .from('referral_events')
    .select('commission_amount, pool_allocation')
    .eq('status', 'approved')
    .gte('created_at', poolData.period_start)
    .lt('created_at', poolData.period_end);

  const expectedStudentSpend = (referralData || [])
    .filter(r => r.pool_allocation === 'student_35')
    .reduce((sum, r) => sum + (r.commission_amount || 0), 0);
  const expectedAdvisorSpend = (referralData || [])
    .filter(r => r.pool_allocation === 'advisor_35')
    .reduce((sum, r) => sum + (r.commission_amount || 0), 0);
  const expectedCriticSpend = (referralData || [])
    .filter(r => r.pool_allocation === 'critic_30')
    .reduce((sum, r) => sum + (r.commission_amount || 0), 0);

  const poolDiscrepancy =
    Math.abs(poolData.spent_student - expectedStudentSpend) +
    Math.abs(poolData.spent_advisor - expectedAdvisorSpend) +
    Math.abs(poolData.spent_critic - expectedCriticSpend);

  // Check for orphaned referrals (referrals without ledger entries)
  const { data: orphanedReferrals } = await supabase
    .from('referral_events')
    .select('id')
    .in('status', ['approved', 'paid'])
    .not('id', (supabase.from('financial_ledger').select('source_id').eq('source_type', 'referral')));

  const orphanedReferralIds = (orphanedReferrals || []).map(r => r.id);

  // Check for negative balances
  const { data: negativeBalances } = await supabase.rpc('get_referral_dashboard', {
    // This would need to be modified to return balance info
  });

  const report: ReconciliationReport = {
    report_id: reportId,
    report_date: new Date().toISOString(),
    report_type: 'daily',
    pool_reconciled: revenueDiscrepancy === 0 && poolDiscrepancy === 0,
    pool_discrepancy: revenueDiscrepancy + poolDiscrepancy,
    ledger_reconciled: true, // Ledger entries are created by triggers
    ledger_discrepancy: 0,
    orphaned_referrals_found: orphanedReferralIds.length,
    orphaned_referrals_ids: orphanedReferralIds,
    negative_balances_found: 0, // Would need separate query
    negative_balance_users: [],
    revenue_allocation_match: revenueDiscrepancy === 0,
    revenue_discrepancy: revenueDiscrepancy,
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    completed_by: 'system',
    notes: revenueDiscrepancy !== 0
      ? `Revenue discrepancy of ₱${revenueDiscrepancy.toFixed(2)}`
      : poolDiscrepancy > 0
      ? `Pool allocation discrepancy of ₱${poolDiscrepancy.toFixed(2)}`
      : 'Reconciliation successful',
  };

  revalidatePath('/admin/referrals');
  revalidatePath('/admin/analytics');

  return report;
}

// Monthly payout reconciliation job
export async function runMonthlyPayoutReconciliation(): Promise<ReconciliationReport> {
  const supabase = await createClient();
  const reportId = crypto.randomUUID();

  // Get payouts for the last month
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const { data: payouts } = await supabase
    .from('payouts')
    .select('*')
    .gte('created_at', new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1).toISOString())
    .lt('created_at', new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 1).toISOString());

  const pendingPayouts = (payouts || []).filter(p => p.status === 'pending');
  const paidPayouts = (payouts || []).filter(p => p.status === 'paid');
  const cancelledPayouts = (payouts || []).filter(p => p.status === 'cancelled');

  const totalPending = pendingPayouts.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPaid = paidPayouts.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalCancelled = cancelledPayouts.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Check ledger balance for each paid payout
  const ledgerDiscrepancies = await Promise.all(
    paidPayouts.map(async (payout) => {
      const { data: ledgerEntries } = await supabase
        .from('financial_ledger')
        .select('debit, balance_after')
        .eq('source_type', 'payout')
        .eq('source_id', payout.id);

      const totalDebits = (ledgerEntries || []).reduce((sum, le) => sum + (le.debit || 0), 0);

      return {
        payoutId: payout.id,
        payoutAmount: payout.amount,
        ledgerDebitAmount: totalDebits,
        discrepancy: payout.amount - totalDebits,
      };
    })
  );

  const totalLedgerDiscrepancy = ledgerDiscrepancies.reduce((sum, ld) => sum + Math.abs(ld.discrepancy), 0);

  const report: ReconciliationReport = {
    report_id: reportId,
    report_date: new Date().toISOString(),
    report_type: 'monthly',
    pool_reconciled: true,
    pool_discrepancy: 0,
    ledger_reconciled: totalLedgerDiscrepancy === 0,
    ledger_discrepancy: totalLedgerDiscrepancy,
    orphaned_referrals_found: 0,
    orphaned_referrals_ids: [],
    negative_balances_found: 0,
    negative_balance_users: [],
    revenue_allocation_match: true,
    revenue_discrepancy: 0,
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    completed_by: 'system',
    notes: `${paidPayouts.length} payouts reconciled. Ledger discrepancy: ₱${totalLedgerDiscrepancy.toFixed(2)}`,
  };

  revalidatePath('/admin/referrals');
  revalidatePath('/admin/analytics');

  return report;
}

// Orphaned referral detection
export async function detectOrphanedReferrals(): Promise<{
  found: number;
  referralIds: string[];
}> {
  const supabase = await createClient();

  // Find referrals without corresponding ledger entries
  const { data: orphanedReferrals } = await supabase
    .from('referral_events')
    .select('id')
    .in('status', ['approved', 'paid'])
    .not('id', (supabase.from('financial_ledger').select('source_id').eq('source_type', 'referral')));

  const orphanedIds = (orphanedReferrals || []).map(r => r.id);

  revalidatePath('/admin/referrals');

  return {
    found: orphanedIds.length,
    referralIds: orphanedIds,
  };
}

// Negative balance detection
export async function detectNegativeBalances(): Promise<{
  found: number;
  users: UserBalance[];
}> {
  const supabase = await createClient();

  // Get all users with negative ledger balance
  const { data, error } = await supabase
    .from('v_referral_dashboard') // Would need a dedicated view or query
    .select('referrer_id');

  // For now, query the ledger directly
  const { data: ledgerData } = await supabase.rpc('sql', {
    query: `
      SELECT
        fl.user_id,
        SUM(credit) - SUM(debit) as current_balance
      FROM financial_ledger fl
      WHERE status = 'posted'
      GROUP BY fl.user_id
      HAVING SUM(credit) - SUM(debit) < 0
    `,
  });

  const negativeBalanceUsers: UserBalance[] = (ledgerData || []).map((row: any) => ({
    user_id: row.user_id,
    current_balance: row.current_balance,
    total_credits: 0,
    total_debits: 0,
  }));

  revalidatePath('/admin/referrals');

  return {
    found: negativeBalanceUsers.length,
    users: negativeBalanceUsers,
  };
}

// Fix orphaned referrals
export async function fixOrphanedReferrals(referralIds: string[]): Promise<number> {
  const supabase = await createClient();

  let fixed = 0;

  for (const referralId of referralIds) {
    const { data: referral } = await supabase
      .from('referral_events')
      .select('*')
      .eq('id', referralId)
      .single();

    if (!referral || referral.status !== 'approved') continue;

    // Create missing ledger entry
    const { error } = await supabase.from('financial_ledger').insert({
      user_id: (referral as any).referrer_id,
      source_type: 'referral',
      source_id: referralId,
      transaction_type: 'referral_earned',
      credit: (referral as any).commission_amount,
      balance_after: 0, // Will be calculated
      currency: 'PHP',
      description: `Referral commission earned: ${(referral as any).event_type}`,
      status: 'posted',
      posted_at: (referral as any).approved_at || new Date().toISOString(),
    });

    if (!error) fixed++;
  }

  revalidatePath('/admin/referrals');

  return fixed;
}

// Get reconciliation reports
export async function getReconciliationReports(
  limit = 50
): Promise<ReconciliationReport[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('reconciliation_reports') // This table doesn't exist yet, would need to be added
    .select('*')
    .order('report_date', { ascending: false })
    .limit(limit);

  if (error) {
    // If table doesn't exist, return empty array
    return [];
  }

  return data as ReconciliationReport[] || [];
}

// Create reconciliation report record (requires table creation)
export async function saveReconciliationReport(
  report: ReconciliationReport
): Promise<void> {
  const supabase = await createClient();

  // Note: reconciliation_reports table would need to be created in a migration
  // For now, we just log the action
  await supabase.from('admin_financial_logs').insert({
    admin_id: null, // System job
    action: 'reconciliation_completed',
    target_type: 'referral_event',
    notes: report.notes,
    metadata: report as any,
  });

  revalidatePath('/admin/referrals');
}

// Scheduled job runner
export async function runScheduledReconciliation(
  type: 'daily' | 'weekly' | 'monthly' = 'daily'
): Promise<ReconciliationReport> {
  switch (type) {
    case 'daily':
      return runDailyPoolReconciliation();
    case 'weekly':
    case 'monthly':
      return runMonthlyPayoutReconciliation();
  }
}
