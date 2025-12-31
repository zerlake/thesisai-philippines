'use client';

import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { 
  getReferralCode, 
  getReferralHistory, 
  getUserPayouts, 
  validateReferralCode,
  processReferral 
} from '@/actions/referrals';
import { 
  getUserReferralStats, 
  getUserReferralHistory, 
  getUserPayouts as getUserPayoutsQuery 
} from '@/utils/supabase/queries';
import { ReferralHistoryItem, Payout, ReferralStats } from '@/types/referral';
import { createClient } from '@/utils/supabase/client';

interface ReferralContextType {
  referralCode: string;
  referralStats: ReferralStats | null;
  referralHistory: ReferralHistoryItem[];
  payouts: Payout[];
  loading: boolean;
  error: string | null;
  fetchReferralData: () => Promise<void>;
  validateAndSetReferralCode: (code: string) => Promise<boolean>;
  processNewReferral: (referredId: string, eventType: string) => Promise<void>;
}

const ReferralContext = createContext<ReferralContextType | undefined>(undefined);

export function ReferralProvider({ children }: { children: ReactNode }) {
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [referralHistory, setReferralHistory] = useState<ReferralHistoryItem[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReferralData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Fetch referral code
      const code = await getReferralCode();
      setReferralCode(code);

      // Fetch referral stats
      const stats = await getUserReferralStats(user.id);
      setReferralStats({
        total_referrals: stats.total_referrals,
        total_earnings: stats.total_earnings,
        pending_payouts: stats.pending_payouts,
        referral_code: stats.referral_code
      });

      // Fetch referral history
      const history = await getUserReferralHistory(user.id);
      setReferralHistory(history);

      // Fetch payouts
      const userPayouts = await getUserPayoutsQuery(user.id);
      setPayouts(userPayouts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch referral data');
      console.error('Error fetching referral data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const validateAndSetReferralCode = async (code: string): Promise<boolean> => {
    try {
      const result = await validateReferralCode(code);
      return result.valid;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate referral code');
      return false;
    }
  };

  const processNewReferral = async (referredId: string, eventType: string) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      await processReferral(user.id, referredId, eventType);
      // Refresh data after processing referral
      await fetchReferralData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process referral');
      throw err;
    }
  };

  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]);

  const value = {
    referralCode,
    referralStats,
    referralHistory,
    payouts,
    loading,
    error,
    fetchReferralData,
    validateAndSetReferralCode,
    processNewReferral
  };

  return (
    <ReferralContext.Provider value={value}>
      {children}
    </ReferralContext.Provider>
  );
}

export function useReferral() {
  const context = useContext(ReferralContext);
  if (context === undefined) {
    throw new Error('useReferral must be used within a ReferralProvider');
  }
  return context;
}