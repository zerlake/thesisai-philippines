// Mock data provider for Financial Monitoring Dashboard development/testing
// Use this when database tables are empty or for UI development

let globalUseMockData: boolean = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

export function setGlobalMockDataEnabled(enabled: boolean) {
  globalUseMockData = enabled;
}

export function getMockDataEnabled(): boolean {
  return globalUseMockData;
}

export function getReferralVelocityMockData() {
  const data = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Generate realistic-looking data with some patterns
    const baseStudent = 3 + Math.floor(Math.random() * 5);
    const baseAdvisor = 1 + Math.floor(Math.random() * 3);
    const baseCritic = 1 + Math.floor(Math.random() * 2);

    data.push({
      date: dateStr,
      student: baseStudent + (i % 7 === 0 ? 2 : 0), // Weekend spike
      advisor: baseAdvisor,
      critic: baseCritic
    });
  }

  return data;
}

export function getFraudSignalsMockData() {
  const data = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Generate realistic fraud signal patterns
    // Mostly low risk, occasional medium, rare high
    const lowRisk = Math.random() > 0.3 ? Math.floor(Math.random() * 3) : 0;
    const mediumRisk = Math.random() > 0.7 ? Math.floor(Math.random() * 2) : 0;
    const highRisk = Math.random() > 0.9 ? 1 : 0;

    data.push({
      date: dateStr,
      low_risk: lowRisk,
      medium_risk: mediumRisk,
      high_risk: highRisk
    });
  }

  return data;
}

export function getTopRecruitersMockData() {
  return [
    { referrer_name: 'Maria Santos', total_referrals: 28, approved_referrals: 24, total_earnings: 3600 },
    { referrer_name: 'Juan Cruz', total_referrals: 22, approved_referrals: 20, total_earnings: 3000 },
    { referrer_name: 'Ana Garcia', total_referrals: 19, approved_referrals: 18, total_earnings: 2700 },
    { referrer_name: 'Carlos Reyes', total_referrals: 15, approved_referrals: 15, total_earnings: 2250 },
    { referrer_name: 'Elena Rodriguez', total_referrals: 14, approved_referrals: 13, total_earnings: 1950 },
    { referrer_name: 'Miguel Flores', total_referrals: 12, approved_referrals: 12, total_earnings: 1800 },
    { referrer_name: 'Sarah Tan', total_referrals: 11, approved_referrals: 10, total_earnings: 1500 },
    { referrer_name: 'David Kim', total_referrals: 10, approved_referrals: 10, total_earnings: 1500 },
    { referrer_name: 'Lisa Chen', total_referrals: 9, approved_referrals: 8, total_earnings: 1200 },
    { referrer_name: 'Roberto Diaz', total_referrals: 8, approved_referrals: 8, total_earnings: 1200 },
  ];
}

export function getFinancialDashboardMetricsMock() {
  return {
    totalRevenue: 660000,
    totalReferralPool: 99000,
    allocatedPool: 94500,
    unallocatedPool: 4500,
    totalPaidOut: 58500,
    pendingPayouts: 12,
    payoutRatio: 59.1,
    avgReferralValue: 150.00,
    fraudFlagsCount: 3,
    activeReferrers: 45,

    topReferrers: [
      { id: '1', first_name: 'Maria', last_name: 'Santos', email: 'maria.s@example.com', total_referrals: 28, total_earnings: 3600, recruitment_tier: 3 },
      { id: '2', first_name: 'Juan', last_name: 'Cruz', email: 'juan.c@example.com', total_referrals: 22, total_earnings: 3000, recruitment_tier: 2 },
      { id: '3', first_name: 'Ana', last_name: 'Garcia', email: 'ana.g@example.com', total_referrals: 19, total_earnings: 2700, recruitment_tier: 2 },
      { id: '4', first_name: 'Carlos', last_name: 'Reyes', email: 'carlos.r@example.com', total_referrals: 15, total_earnings: 2250, recruitment_tier: 1 },
      { id: '5', first_name: 'Elena', last_name: 'Rodriguez', email: 'elena.r@example.com', total_referrals: 14, total_earnings: 1950, recruitment_tier: 1 },
    ],

    poolHealth: {
      totalRevenue: 660000,
      poolPercentage: 15,
      poolAmount: 99000,
      remainingBalance: 40500,
      utilizationRate: 59.1,
      studentAllocationUsed: 31500,
      studentAllocationRemaining: 3150,
      advisorAllocationUsed: 21000,
      advisorAllocationRemaining: 13650,
      criticAllocationUsed: 6000,
      criticAllocationRemaining: 23700,
    },

    payoutStatus: {
      pendingCount: 12,
      pendingAmount: 1800,
      approvedCount: 5,
      approvedAmount: 750,
      paidCount: 142,
      paidAmount: 58500,
      cancelledCount: 3,
      cancelledAmount: 450,
    },

    riskIndicators: {
      totalFlags: 15,
      criticalFlags: 2,
      highFlags: 4,
      mediumFlags: 9,
      recentFraud: 3,
      usersUnderReview: 2,
    },

    performance: {
      totalReferrals: 195,
      approvedReferrals: 175,
      rejectedReferrals: 20,
      approvalRate: 89.7,
      avgCommissionAmount: 150,
      conversionRate: 12.5,
      activeReferrersLast30Days: 45,
      newReferrersLast7Days: 8,
    },
  };
}

export function getPoolStatusMock() {
  return {
    period_start: '2026-01-01',
    pool_amount: 99000,
    student_remaining: 3150,
    advisor_remaining: 13650,
    critic_remaining: 23700,
    student_referrals_approved: 175,
    advisor_recruitments_approved: 45,
    critic_recruitments_approved: 25,
    utilization_student: 90.9,
    utilization_advisor: 60.6,
    utilization_critic: 20.2,
  };
}

export function getAlertSectionMock() {
  return {
    criticalAlerts: [
      {
        id: '1',
        type: 'fraud_detected',
        severity: 'critical',
        title: 'High-risk referral detected',
        message: 'User with ID abc-123 flagged for self-referral pattern',
        createdAt: '2025-12-30T10:30:00Z',
        referralId: 'ref-001',
        userId: 'abc-123',
      },
      {
        id: '2',
        type: 'pool_depleted',
        severity: 'critical',
        title: 'Student pool approaching depletion',
        message: 'Student pool balance below 10% threshold (₱3,150 remaining)',
        createdAt: '2025-12-29T15:45:00Z',
      },
    ],
    warnings: [
      {
        id: '3',
        type: 'unusual_activity',
        severity: 'warning',
        title: 'Unusual referral volume',
        message: 'User xyz-789 made 8 referrals in last 24 hours',
        createdAt: '2025-12-30T08:15:00Z',
        userId: 'xyz-789',
      },
      {
        id: '4',
        type: 'pending_payouts',
        severity: 'warning',
        title: 'Pending payouts backlog',
        message: '12 payouts pending approval (₱1,800 total)',
        createdAt: '2025-12-29T12:00:00Z',
      },
      {
        id: '5',
        type: 'low_approval_rate',
        severity: 'warning',
        title: 'Declining approval rate',
        message: 'Approval rate dropped to 85% this week (normal: 90%+)',
        createdAt: '2025-12-28T16:30:00Z',
      },
    ],
    info: [
      {
        id: '6',
        type: 'milestone_reached',
        severity: 'info',
        title: 'Milestone achieved',
        message: 'Maria Santos reached Tier 3 recruiter status',
        createdAt: '2025-12-30T09:00:00Z',
        userId: '1',
      },
      {
        id: '7',
        type: 'system_update',
        severity: 'info',
        title: 'Pool allocation updated',
        message: 'New monthly pool created with ₱9,900 allocation',
        createdAt: '2025-12-30T07:00:00Z',
      },
    ],
  };
}

export function getReferralEventsMock() {
  return [
    {
      id: 'ref-001',
      referrer_id: '1',
      referred_id: 'new-user-001',
      event_type: 'student_subscription',
      status: 'approved',
      workflow_state: 'scheduled_for_payout',
      subscription_amount: 990,
      commission_amount: 150,
      pool_allocation: 'student_35',
      revenue_event_id: 'rev-001',
      created_at: '2025-12-29T14:30:00Z',
      approved_at: '2025-12-29T15:00:00Z',
      scheduled_payout_at: '2026-01-15T00:00:00Z',
    },
    {
      id: 'ref-002',
      referrer_id: '2',
      referred_id: 'new-user-002',
      event_type: 'advisor_recruitment',
      status: 'pending',
      workflow_state: 'under_review',
      commission_amount: 200,
      pool_allocation: 'advisor_35',
      created_at: '2025-12-30T10:00:00Z',
      review_started_at: '2025-12-30T10:30:00Z',
      reviewed_by: 'admin-001',
    },
    {
      id: 'ref-003',
      referrer_id: '1',
      referred_id: 'new-user-003',
      event_type: 'student_subscription',
      status: 'rejected',
      workflow_state: 'rejected',
      commission_amount: 0,
      pool_allocation: 'student_35',
      created_at: '2025-12-30T09:00:00Z',
    },
  ];
}

export function getPayoutsMock() {
  return [
    {
      id: 'pay-001',
      user_id: '1',
      pool_id: 'pool-001',
      amount: 150,
      payout_type: 'student_referral',
      status: 'approved',
      payout_method: 'gcash',
      transaction_id: 'TXN-123456',
      created_at: '2025-12-28T10:00:00Z',
    },
    {
      id: 'pay-002',
      user_id: '2',
      pool_id: 'pool-001',
      amount: 200,
      payout_type: 'advisor_tier',
      status: 'pending',
      payout_method: 'bank',
      created_at: '2025-12-29T14:30:00Z',
    },
    {
      id: 'pay-003',
      user_id: '1',
      pool_id: 'pool-001',
      amount: 300,
      payout_type: 'advisor_milestone',
      status: 'paid',
      payout_method: 'credits',
      transaction_id: 'TXN-123457',
      created_at: '2025-12-20T10:00:00Z',
      paid_at: '2025-12-22T10:00:00Z',
    },
  ];
}

export function getRiskAssessmentsMock() {
  return [
    {
      id: 'risk-001',
      referral_event_id: 'ref-001',
      user_id: 'abc-123',
      risk_score: 85,
      risk_level: 'high',
      flags: ['self_referral', 'same_device'],
      auto_action_taken: 'hold_payout',
      auto_action_at: '2025-12-30T10:35:00Z',
      auto_action_notes: 'Payout held pending review',
      status: 'reviewing',
      confidence_score: 0.92,
      created_at: '2025-12-30T10:30:00Z',
    },
    {
      id: 'risk-002',
      referral_event_id: 'ref-004',
      user_id: 'xyz-789',
      risk_score: 45,
      risk_level: 'medium',
      flags: ['suspicious_volume'],
      auto_action_taken: 'flag_for_review',
      status: 'detected',
      confidence_score: 0.75,
      created_at: '2025-12-30T08:15:00Z',
    },
  ];
}

export function getFraudUsersMock() {
  return [
    {
      user_id: 'fraud-user-001',
      first_name: 'James',
      last_name: 'Smith',
      email: 'james.smith@example.com',
      risk_score: 85,
      risk_level: 'high',
      total_referrals: 12,
      created_at: '2025-12-25T10:30:00Z',
      detected_fraud_types: ['self_referral', 'duplicate_ip']
    },
    {
      user_id: 'fraud-user-002',
      first_name: 'Emily',
      last_name: 'Johnson',
      email: 'emily.j@example.com',
      risk_score: 92,
      risk_level: 'critical',
      total_referrals: 25,
      created_at: '2025-12-26T14:45:00Z',
      detected_fraud_types: ['payment_fraud', 'suspicious_volume', 'same_device']
    },
    {
      user_id: 'fraud-user-003',
      first_name: 'Michael',
      last_name: 'Brown',
      email: 'michael.b@example.com',
      risk_score: 78,
      risk_level: 'high',
      total_referrals: 8,
      created_at: '2025-12-27T09:15:00Z',
      detected_fraud_types: ['short_timeframe', 'low_quality_user']
    },
    {
      user_id: 'fraud-user-004',
      first_name: 'Sarah',
      last_name: 'Davis',
      email: 'sarah.d@example.com',
      risk_score: 70,
      risk_level: 'medium',
      total_referrals: 5,
      created_at: '2025-12-28T16:20:00Z',
      detected_fraud_types: ['unusual_pattern', 'multiple_attempts']
    },
    {
      user_id: 'fraud-user-005',
      first_name: 'Robert',
      last_name: 'Wilson',
      email: 'robert.w@example.com',
      risk_score: 95,
      risk_level: 'critical',
      total_referrals: 30,
      created_at: '2025-12-29T11:30:00Z',
      detected_fraud_types: ['self_referral', 'payment_fraud', 'suspicious_volume', 'same_device']
    }
  ];
}

export function getAuditTrailMock() {
  return [
    {
      id: 'audit-001',
      action: 'payout_approved',
      user_id: 'admin-001',
      target_user_id: 'user-123',
      timestamp: '2025-12-30T10:30:00Z',
      details: 'Approved payout of ₱1,500 for user-123',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 Chrome/120.0.0.0'
    },
    {
      id: 'audit-002',
      action: 'referral_flagged',
      user_id: 'admin-001',
      target_user_id: 'user-456',
      timestamp: '2025-12-30T09:45:00Z',
      details: 'Flagged referral for fraud review',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 Chrome/120.0.0.0'
    },
    {
      id: 'audit-003',
      action: 'user_role_changed',
      user_id: 'admin-002',
      target_user_id: 'user-789',
      timestamp: '2025-12-30T08:20:00Z',
      details: 'Changed user role from user to advisor',
      ip_address: '192.168.1.101',
      user_agent: 'Mozilla/5.0 Safari/605.1.15'
    },
    {
      id: 'audit-004',
      action: 'fraud_confirmed',
      user_id: 'admin-001',
      target_user_id: 'user-101',
      timestamp: '2025-12-29T16:30:00Z',
      details: 'Confirmed fraud on referral event ref-001',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 Chrome/120.0.0.0'
    },
    {
      id: 'audit-005',
      action: 'payout_rejected',
      user_id: 'admin-002',
      target_user_id: 'user-202',
      timestamp: '2025-12-29T14:15:00Z',
      details: 'Rejected payout request of ₱2,000',
      ip_address: '192.168.1.101',
      user_agent: 'Mozilla/5.0 Safari/605.1.15'
    },
    {
      id: 'audit-006',
      action: 'payout_processed',
      user_id: 'admin-001',
      target_user_id: 'user-303',
      timestamp: '2025-12-29T12:45:00Z',
      details: 'Processed payout of ₱3,500 to user-303',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 Chrome/120.0.0.0'
    },
    {
      id: 'audit-007',
      action: 'payout_requested',
      user_id: 'user-404',
      target_user_id: 'user-404',
      timestamp: '2025-12-28T16:20:00Z',
      details: 'User requested payout of ₱1,200',
      ip_address: '192.168.1.102',
      user_agent: 'Mozilla/5.0 Firefox/98.0'
    }
  ];
}

// Flag to enable/disable mock data across the app
export const USE_MOCK_DATA = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
