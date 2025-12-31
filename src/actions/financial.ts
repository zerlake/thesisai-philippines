'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import type { FinancialLedger, UserBalance, AdminFinancialLog } from '@/types/referral';

// Get user's current balance from ledger
export async function getUserBalance(userId: string): Promise<UserBalance | null> {
  const supabase = await createClient();

  const { data: creditData } = await supabase
    .from('financial_ledger')
    .select('credit')
    .eq('user_id', userId)
    .eq('status', 'posted');

  const { data: debitData } = await supabase
    .from('financial_ledger')
    .select('debit')
    .eq('user_id', userId)
    .eq('status', 'posted');

  const totalCredits = creditData?.reduce((sum, item) => sum + (item.credit || 0), 0) || 0;
  const totalDebits = debitData?.reduce((sum, item) => sum + (item.debit || 0), 0) || 0;

  return {
    user_id: userId,
    current_balance: totalCredits - totalDebits,
    total_credits: totalCredits,
    total_debits: totalDebits,
  };
}

// Get user's ledger history
export async function getUserLedgerHistory(
  userId: string,
  limit = 50,
  offset = 0
): Promise<FinancialLedger[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('financial_ledger')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(error.message);
  }

  return data as FinancialLedger[] || [];
}

// Get user's balance at a specific date (for reconciliation)
export async function getUserBalanceAtDate(
  userId: string,
  date: Date
): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_user_balance_at_date', {
    p_user_id: userId,
    p_date: date.toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }

  return data || 0;
}

// Create manual balance adjustment (admin only)
export async function createBalanceAdjustment(
  userId: string,
  amount: number,
  reason: string,
  notes?: string
): Promise<FinancialLedger> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('manual_balance_adjustment', {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
    p_notes: notes || null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/referrals');
  revalidatePath('/admin/referrals');

  return data as FinancialLedger;
}

// Reverse a ledger entry (admin only)
export async function reverseLedgerEntry(
  ledgerId: string,
  reason: string
): Promise<void> {
  const supabase = await createClient();

  // Get the ledger entry
  const { data: entry, error: fetchError } = await supabase
    .from('financial_ledger')
    .select('*')
    .eq('id', ledgerId)
    .single();

  if (fetchError || !entry) {
    throw new Error('Ledger entry not found');
  }

  // Create reversal entry
  const { error: reversalError } = await supabase.from('financial_ledger').insert({
    user_id: entry.user_id,
    source_type: entry.source_type,
    source_id: entry.source_id,
    transaction_type: 'ledger_reversal',
    debit: entry.credit > 0 ? entry.credit : 0,
    credit: entry.debit > 0 ? entry.debit : 0,
    balance_after: 0, // Will be calculated by trigger
    currency: entry.currency,
    description: `Reversal: ${reason}`,
    status: 'posted',
    posted_at: new Date().toISOString(),
    created_by_admin: null, // Admin ID from auth context
    admin_notes: reason,
  });

  if (reversalError) {
    throw new Error(reversalError.message);
  }

  // Update original entry status
  await supabase
    .from('financial_ledger')
    .update({ status: 'reversed', reversed_at: new Date().toISOString() })
    .eq('id', ledgerId);

  revalidatePath('/referrals');
  revalidatePath('/admin/referrals');
}

// Get ledger entries for admin view
export async function getAdminLedgerEntries(
  userId?: string,
  startDate?: Date,
  endDate?: Date,
  limit = 100,
  offset = 0
): Promise<FinancialLedger[]> {
  const supabase = await createClient();

  let query = supabase
    .from('financial_ledger')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }

  if (endDate) {
    query = query.lte('created_at', endDate.toISOString());
  }

  const { data, error } = await query.range(offset, offset + limit - 1);

  if (error) {
    throw new Error(error.message);
  }

  return data as FinancialLedger[] || [];
}

// Search ledger entries by source type
export async function searchLedgerBySource(
  sourceType: string,
  sourceId: string
): Promise<FinancialLedger[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('financial_ledger')
    .select('*')
    .eq('source_type', sourceType)
    .eq('source_id', sourceId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as FinancialLedger[] || [];
}
