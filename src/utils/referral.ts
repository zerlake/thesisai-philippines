import { ReferralEvent, Payout, ReferralStats } from '@/types/referral';

// Calculate referral commission based on event type and user tier
export function calculateReferralCommission(
  eventType: 'student_subscription' | 'advisor_recruitment' | 'critic_recruitment',
  referrerTier: number = 0,
  baseAmount?: number
): number {
  let commission = 0;

  switch (eventType) {
    case 'student_subscription':
      commission = baseAmount || 150; // Default ₱150 per student referral
      break;
    case 'advisor_recruitment':
      // Tier-based commission for advisors
      const advisorBase = baseAmount || 500;
      const tierMultiplier = 1 + (referrerTier * 0.2); // 20% bonus per tier
      commission = advisorBase * tierMultiplier;
      break;
    case 'critic_recruitment':
      // Base commission for critics
      commission = baseAmount || 800;
      break;
    default:
      commission = 0;
  }

  return parseFloat(commission.toFixed(2));
}

// Format currency for Philippines (PHP)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  }).format(amount);
}

// Validate referral code format
export function isValidReferralCode(code: string): boolean {
  // Check if code is 8 characters long and alphanumeric
  const referralCodeRegex = /^[A-Z0-9]{8}$/;
  return referralCodeRegex.test(code);
}

// Get referral status display text
export function getReferralStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'Pending Review',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'paid': 'Paid'
  };
  
  return statusMap[status] || status;
}

// Get referral status color for UI
export function getReferralStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'paid': 'bg-blue-100 text-blue-800'
  };
  
  return colorMap[status] || 'bg-gray-100 text-gray-800';
}

// Calculate user's referral tier based on total referrals
export function calculateReferralTier(totalReferrals: number): number {
  if (totalReferrals >= 50) return 5; // Platinum
  if (totalReferrals >= 25) return 4; // Gold
  if (totalReferrals >= 10) return 3; // Silver
  if (totalReferrals >= 5) return 2; // Bronze
  return 1; // Basic
}

// Get tier name for display
export function getTierName(tier: number): string {
  const tierNames: Record<number, string> = {
    1: 'Basic',
    2: 'Bronze',
    3: 'Silver',
    4: 'Gold',
    5: 'Platinum'
  };
  
  return tierNames[tier] || 'Basic';
}

// Check if user has reached daily referral limit
export function hasReachedDailyLimit(referralsToday: number, limit: number = 5): boolean {
  return referralsToday >= limit;
}

// Calculate potential earnings based on referral activity
export function calculatePotentialEarnings(
  referrals: ReferralEvent[],
  pendingPayouts: Payout[]
): ReferralStats {
  const totalReferrals = referrals.filter(r => r.status !== 'rejected').length;
  const totalEarnings = referrals
    .filter(r => r.status === 'paid')
    .reduce((sum, referral) => sum + referral.commission_amount, 0);
  
  const pendingPayoutsAmount = pendingPayouts
    .filter(p => p.status === 'pending')
    .reduce((sum, payout) => sum + payout.amount, 0);

  return {
    total_referrals: totalReferrals,
    total_earnings: parseFloat(totalEarnings.toFixed(2)),
    pending_payouts: parseFloat(pendingPayoutsAmount.toFixed(2)),
    referral_code: '' // This would be populated separately
  };
}

// Generate referral sharing URL
export function generateReferralUrl(referralCode: string, baseUrl: string = ''): string {
  if (!referralCode) return '';
  
  const url = new URL('/referral', baseUrl || window.location.origin);
  url.searchParams.set('code', referralCode);
  return url.toString();
}

// Validate referral eligibility
export function canMakeReferral(
  userRole: string,
  isDemoAccount: boolean,
  accountStatus: string
): boolean {
  // Students, advisors, and critics can make referrals
  const validRoles = ['student', 'advisor', 'critic'];
  
  return (
    validRoles.includes(userRole) &&
    !isDemoAccount &&
    accountStatus === 'active'
  );
}

// Get referral event type display name
export function getReferralEventTypeDisplay(eventType: string): string {
  const typeMap: Record<string, string> = {
    'student_subscription': 'Student Referral',
    'advisor_recruitment': 'Advisor Recruitment',
    'critic_recruitment': 'Critic Recruitment'
  };
  
  return typeMap[eventType] || eventType;
}

// Calculate referral quality score
export function calculateReferralQualityScore(referral: ReferralEvent): number {
  let score = 50; // Base score
  
  // Adjust score based on various factors
  if (referral.event_type === 'student_subscription') {
    score += 10; // Student referrals are generally higher quality
  }
  
  // Adjust based on commission amount
  if (referral.commission_amount > 500) {
    score += 15;
  } else if (referral.commission_amount > 200) {
    score += 5;
  }
  
  // Adjust based on time since creation (newer referrals might need more validation)
  const createdDate = new Date(referral.created_at);
  const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysSinceCreation > 30) {
    score += 10; // Longer validation period = higher quality
  }
  
  // Cap score between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)));
}