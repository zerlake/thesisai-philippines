// Referral-related TypeScript types

export interface ReferralEvent {
  id: string;
  referrer_id: string;
  referred_id: string;
  event_type: 'student_subscription' | 'advisor_recruitment' | 'critic_recruitment';
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  workflow_state: 'pending' | 'under_review' | 'approved' | 'scheduled_for_payout' | 'paid' | 'reversed' | 'flagged' | 'rejected';
  subscription_amount?: number;
  commission_amount: number;
  pool_allocation: 'student_35' | 'advisor_35' | 'critic_30';
  revenue_event_id?: string;
  created_at: string;
  approved_at?: string;
  paid_at?: string;
  scheduled_payout_at?: string;
  reversed_at?: string;
  reversal_reason?: string;
  review_started_at?: string;
  reviewed_by?: string;
  metadata?: Record<string, any>;
}

export interface ReferralHistoryItem {
  id: string;
  referrer_id: string;
  referred_id: string;
  event_type: 'student_subscription' | 'advisor_recruitment' | 'critic_recruitment';
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  commission_amount: number;
  created_at: string;
  approved_at?: string;
  referred_first_name: string;
  referred_last_name: string;
  referred_email: string;
}

export interface Payout {
  id: string;
  user_id: string;
  pool_id?: string;
  amount: number;
  payout_type: 'student_referral' | 'advisor_tier' | 'advisor_milestone' | 'critic_tier' | 'critic_quality';
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  payout_method: 'credits' | 'gcash' | 'bank';
  transaction_id?: string;
  created_at: string;
  paid_at?: string;
}

export interface RecruitmentPool {
  id: string;
  period_type: 'monthly' | 'yearly';
  period_start: string;
  period_end: string;
  total_revenue: number;
  pool_percentage: number;
  pool_amount: number;
  student_allocation: number;
  advisor_allocation: number;
  critic_allocation: number;
  spent_student: number;
  spent_advisor: number;
  spent_critic: number;
  status: 'open' | 'closed' | 'finalized';
  created_at: string;
}

export interface RecruitmentDashboardData {
  period_start: string;
  pool_amount: number;
  student_remaining: number;
  advisor_remaining: number;
  critic_remaining: number;
  student_referrals_approved: number;
  advisor_recruitments_approved: number;
  critic_recruitments_approved: number;
}

export interface ReferralCodeValidation {
  valid: boolean;
  referrer?: {
    id: string;
    name: string;
    role: string;
  };
  error?: string;
}

export interface ReferralStats {
  total_referrals: number;
  total_earnings: number;
  pending_payouts: number;
  referral_code: string;
}

export interface ReferrerProfile {
  id: string;
  first_name: string;
  last_name: string;
  role_type: string;
  recruitment_tier: number;
  total_referrals: number;
  total_earnings: number;
  pending_payouts: number;
  referral_code: string;
}

// Financial Ledger Types
export interface FinancialLedger {
  id: string;
  user_id: string;
  source_type: 'referral' | 'payout' | 'adjustment' | 'bonus' | 'penalty';
  source_id?: string;
  transaction_type: 'referral_earned' | 'payout_paid' | 'refund' | 'adjustment' | 'bonus' | 'penalty' | 'tier_upgrade' | 'milestone_bonus';
  debit: number;
  credit: number;
  balance_after: number;
  currency: string;
  description: string;
  status: 'pending' | 'posted' | 'reversed';
  reference_number?: string;
  created_by_admin?: string;
  admin_notes?: string;
  created_at: string;
  posted_at?: string;
  reversed_at?: string;
}

export interface UserBalance {
  user_id: string;
  current_balance: number;
  total_credits: number;
  total_debits: number;
}

// Revenue Events Types
export interface RevenueEvent {
  id: string;
  source_type: 'student_subscription' | 'student_upgrade' | 'advisor_payment' | 'critic_payment' | 'institution_payment' | 'enterprise_subscription' | 'adjustment';
  source_user_id?: string;
  amount: number;
  currency: string;
  billing_period_start?: string;
  billing_period_end?: string;
  billing_cycle?: string;
  allocated_to_pool: boolean;
  pool_id?: string;
  subscription_plan?: string;
  external_transaction_id?: string;
  payment_gateway?: string;
  status: 'pending' | 'confirmed' | 'allocated' | 'void';
  confirmed_at?: string;
  allocated_at?: string;
  voided_at?: string;
  void_reason?: string;
  metadata?: Record<string, any>;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RevenueAttribution {
  id: string;
  source_type: string;
  source_user_id?: string;
  amount: number;
  currency: string;
  billing_period_start?: string;
  billing_period_end?: string;
  billing_cycle?: string;
  allocated_to_pool: boolean;
  pool_id?: string;
  status: string;
  external_transaction_id?: string;
  payment_gateway?: string;
  created_at: string;
  linked_referrals_count: number;
  allocated_commissions: number;
  pool_total_amount: number;
  pool_student_allocation: number;
  pool_advisor_allocation: number;
  pool_critic_allocation: number;
  user_first_name?: string;
  user_last_name?: string;
  user_email?: string;
}

// Daily Metrics Types
export interface ReferralMetricsDaily {
  id: string;
  metric_date: string;
  referrals_created: number;
  referrals_student_subscription: number;
  referrals_advisor_recruitment: number;
  referrals_critic_recruitment: number;
  referrals_approved: number;
  referrals_rejected: number;
  referrals_paid: number;
  payouts_requested: number;
  payouts_approved: number;
  payouts_completed: number;
  payout_total_amount: number;
  pool_delta: number;
  pool_available: number;
  pool_student_available: number;
  pool_advisor_available: number;
  pool_critic_available: number;
  fraud_flags: number;
  risk_assessments: number;
  suspicious_referrals: number;
  revenue_confirmed: number;
  revenue_allocated: number;
  unique_referrers: number;
  new_referrers: number;
  active_referrers: number;
  avg_referral_value: number;
  approval_rate: number;
  conversion_rate: number;
  tier_upgrades: number;
  tier_0_users: number;
  tier_1_users: number;
  tier_2_users: number;
  tier_3_users: number;
  tier_4_users: number;
  tier_5_users: number;
  data_quality_score: number;
  created_at: string;
  updated_at: string;
}

export interface MetricsTrend {
  metric_date: string;
  referrals_created: number;
  referrals_approved: number;
  referrals_rejected: number;
  payouts_completed: number;
  payout_total_amount: number;
  fraud_flags: number;
  unique_referrers: number;
  avg_referral_value: number;
  approval_rate: number;
  pool_available: number;
}

export interface MonthOverMonthGrowth {
  metric_date: string;
  metric_name: string;
  current_value: number;
  previous_value: number;
  growth_rate: number;
  is_positive: boolean;
}

// Risk Assessment Types
export interface ReferralRiskAssessment {
  id: string;
  referral_event_id: string;
  user_id: string;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  flags: RiskFlagType[];
  auto_action_taken: 'none' | 'hold_payout' | 'freeze_user' | 'flag_for_review' | 'auto_reject';
  auto_action_at?: string;
  auto_action_notes?: string;
  status: 'detected' | 'reviewing' | 'confirmed' | 'dismissed';
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  review_decision?: string;
  ip_address?: string;
  device_fingerprint?: string;
  user_agent?: string;
  location_country?: string;
  location_city?: string;
  detection_method?: string;
  confidence_score: number;
  related_risks?: string[];
  created_at: string;
  updated_at: string;
}

export type RiskFlagType = 'self_referral' | 'duplicate_ip' | 'suspicious_volume' | 'low_quality_user' | 'same_device' | 'short_timeframe' | 'unusual_pattern' | 'payment_fraud' | 'account_age' | 'multiple_attempts';

export interface RiskDashboardItem {
  id: string;
  referral_event_id: string;
  user_id: string;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  flags: RiskFlagType[];
  auto_action_taken: string;
  status: string;
  created_at: string;
  reviewed_at?: string;
  review_notes?: string;
  event_type: string;
  referral_status: string;
  commission_amount: number;
  referral_created_at: string;
  referrer_first_name: string;
  referrer_last_name: string;
  referrer_email: string;
  referrer_total_referrals: number;
  referrer_total_earnings: number;
}

// Admin Financial Logs Types
export interface AdminFinancialLog {
  id: string;
  admin_id: string;
  action: 'payout_approved' | 'payout_rejected' | 'payout_paid' | 'payout_cancelled' | 'referral_approved' | 'referral_rejected' | 'referral_flagged' | 'referral_reinstated' | 'pool_adjustment' | 'manual_balance_adjustment' | 'tier_override' | 'bonus_awarded' | 'penalty_applied' | 'refund_processed' | 'ledger_reversal' | 'fraud_confirmed' | 'fraud_dismissed' | 'reconciliation_completed' | 'revenue_allocated' | 'revenue_voided' | 'account_frozen' | 'account_unfrozen';
  target_type: 'referral_event' | 'payout' | 'pool' | 'ledger_entry' | 'revenue_event' | 'user' | 'risk_assessment';
  target_id?: string;
  before_state?: Record<string, any>;
  after_state?: Record<string, any>;
  changes_made?: Record<string, any>;
  amount_impact?: number;
  notes?: string;
  reason?: string;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AuditTrailItem {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id?: string;
  before_state?: Record<string, any>;
  after_state?: Record<string, any>;
  changes_made?: Record<string, any>;
  amount_impact?: number;
  notes?: string;
  reason?: string;
  created_at: string;
  admin_first_name?: string;
  admin_last_name?: string;
  admin_email?: string;
  target_description?: string;
}

// Workflow Dashboard Types
export interface ReferralWorkflowItem {
  id: string;
  referrer_id: string;
  referred_id: string;
  event_type: string;
  status: string;
  workflow_state: 'pending' | 'under_review' | 'approved' | 'scheduled_for_payout' | 'paid' | 'reversed' | 'flagged' | 'rejected';
  commission_amount: number;
  created_at: string;
  approved_at?: string;
  review_started_at?: string;
  scheduled_payout_at?: string;
  reversed_at?: string;
  reversal_reason?: string;
  reviewed_by?: string;
  hours_to_review?: number;
  days_to_schedule?: number;
  days_to_payment?: number;
  risk_score?: number;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  risk_status?: string;
  referrer_first_name?: string;
  referrer_last_name?: string;
  referrer_email?: string;
  referred_first_name?: string;
  referred_last_name?: string;
  referred_email?: string;
  reviewer_first_name?: string;
  reviewer_last_name?: string;
}

// Financial Dashboard Metrics Types
export interface FinancialDashboardMetrics {
  totalRevenue: number;
  totalReferralPool: number;
  allocatedPool: number;
  unallocatedPool: number;
  totalPaidOut: number;
  pendingPayouts: number;
  payoutRatio: number;
  avgReferralValue: number;
  fraudFlagsCount: number;
  activeReferrers: number;
  topReferrers: TopReferrer[];
  poolHealth: PoolHealthMetrics;
  payoutStatus: PayoutStatusMetrics;
  riskIndicators: RiskIndicators;
  performance: PerformanceMetrics;
}

export interface TopReferrer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  total_referrals: number;
  total_earnings: number;
  recruitment_tier: number;
}

export interface PoolHealthMetrics {
  totalRevenue: number;
  poolPercentage: number;
  poolAmount: number;
  remainingBalance: number;
  utilizationRate: number;
  studentAllocationUsed: number;
  studentAllocationRemaining: number;
  advisorAllocationUsed: number;
  advisorAllocationRemaining: number;
  criticAllocationUsed: number;
  criticAllocationRemaining: number;
}

export interface PayoutStatusMetrics {
  pendingCount: number;
  pendingAmount: number;
  approvedCount: number;
  approvedAmount: number;
  paidCount: number;
  paidAmount: number;
  cancelledCount: number;
  cancelledAmount: number;
}

export interface RiskIndicators {
  totalFlags: number;
  criticalFlags: number;
  highFlags: number;
  mediumFlags: number;
  recentFraud: number;
  usersUnderReview: number;
}

export interface PerformanceMetrics {
  totalReferrals: number;
  approvedReferrals: number;
  rejectedReferrals: number;
  approvalRate: number;
  avgCommissionAmount: number;
  conversionRate: number;
  activeReferrersLast30Days: number;
  newReferrersLast7Days: number;
}

// Reconciliation Types
export interface ReconciliationReport {
  report_id: string;
  report_date: string;
  report_type: 'daily' | 'weekly' | 'monthly';
  pool_reconciled: boolean;
  pool_discrepancy: number;
  ledger_reconciled: boolean;
  ledger_discrepancy: number;
  orphaned_referrals_found: number;
  orphaned_referrals_ids: string[];
  negative_balances_found: number;
  negative_balance_users: UserBalance[];
  revenue_allocation_match: boolean;
  revenue_discrepancy: number;
  created_at: string;
  completed_at: string;
  completed_by: string;
  notes?: string;
}