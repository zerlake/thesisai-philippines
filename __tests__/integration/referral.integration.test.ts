import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processReferral, validateReferralCode, getReferralCode, getReferralHistory } from '@/actions/referrals';
import { createClient } from '@/utils/supabase/server';

// Mock the Supabase server client
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(),
}));


describe('Referral System Integration Tests', () => {
  let supabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    supabase = {
      from: vi.fn(() => supabase),
      select: vi.fn(() => supabase),
      insert: vi.fn(() => supabase),
      update: vi.fn(() => supabase),
      eq: vi.fn(() => supabase),
      single: vi.fn(() => supabase),
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } })
      }
    };
    (createClient as vi.Mock).mockResolvedValue(supabase);
  });

  describe('processReferral action', () => {
    it('should process a successful student referral', async () => {
      const referrerId = 'user-referrer-1';
      const referredId = 'user-referred-1';
      const eventType = 'student_subscription';

      supabase.single.mockResolvedValue({ data: { id: 'event-1' }, error: null });

      await processReferral(referrerId, referredId, eventType);

      expect(supabase.from).toHaveBeenCalledWith('referral_events');
      expect(supabase.insert).toHaveBeenCalledWith([{
        referrer_id: referrerId,
        referred_id: referredId,
        event_type: eventType,
        commission_amount: 150,
        pool_allocation: 'student_35',
        status: 'pending'
      }]);
    });

    it('should process a successful advisor referral', async () => {
        const referrerId = 'user-referrer-2';
        const referredId = 'user-referred-2';
        const eventType = 'advisor_recruitment';
  
        supabase.single.mockResolvedValue({ data: { id: 'event-2' }, error: null });
  
        await processReferral(referrerId, referredId, eventType);
  
        expect(supabase.from).toHaveBeenCalledWith('referral_events');
        expect(supabase.insert).toHaveBeenCalledWith([{
            referrer_id: referrerId,
            referred_id: referredId,
            event_type: eventType,
            commission_amount: 500,
            pool_allocation: 'advisor_35',
            status: 'pending'
        }]);
      });
  
      it('should process a successful critic referral', async () => {
        const referrerId = 'user-referrer-3';
        const referredId = 'user-referred-3';
        const eventType = 'critic_recruitment';
  
        supabase.single.mockResolvedValue({ data: { id: 'event-3' }, error: null });
  
        await processReferral(referrerId, referredId, eventType);
  
        expect(supabase.from).toHaveBeenCalledWith('referral_events');
        expect(supabase.insert).toHaveBeenCalledWith([{
            referrer_id: referrerId,
            referred_id: referredId,
            event_type: eventType,
            commission_amount: 800,
            pool_allocation: 'critic_30',
            status: 'pending'
        }]);
      });

    it('should throw an error for an invalid event type', async () => {
        const referrerId = 'user-referrer-4';
        const referredId = 'user-referred-4';
        const eventType = 'invalid_event';

        await expect(processReferral(referrerId, referredId, eventType)).rejects.toThrow('Invalid event type');
    });

    it('should throw an error if the insert fails', async () => {
        const referrerId = 'user-referrer-5';
        const referredId = 'user-referred-5';
        const eventType = 'student_subscription';

        supabase.single.mockResolvedValue({ data: null, error: new Error('Insert failed') });

        await expect(processReferral(referrerId, referredId, eventType)).rejects.toThrow('Insert failed');
    });
  });

  describe('validateReferralCode action', () => {
    it('should return valid for a correct code', async () => {
      const code = 'VALID123';
      const user = { id: 'user-1', first_name: 'John', last_name: 'Doe', role_type: 'student' };
      supabase.single.mockResolvedValue({ data: user, error: null });

      const result = await validateReferralCode(code);

      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(supabase.eq).toHaveBeenCalledWith('referral_code', code);
      expect(result.valid).toBe(true);
      expect(result.referrer?.name).toBe('John Doe');
    });

    it('should return invalid for an incorrect code', async () => {
      const code = 'INVALID1';
      supabase.single.mockResolvedValue({ data: null, error: new Error('Not found') });

      const result = await validateReferralCode(code);

      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(supabase.eq).toHaveBeenCalledWith('referral_code', code);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid referral code');
    });
  });

  describe('getReferralCode action', () => {
    it('should return the referral code for the authenticated user', async () => {
        const referralCode = 'MYCODE123';
        supabase.single.mockResolvedValue({ data: { referral_code: referralCode }, error: null });

        const result = await getReferralCode();

        expect(supabase.from).toHaveBeenCalledWith('profiles');
        expect(supabase.eq).toHaveBeenCalledWith('id', 'user-1');
        expect(result).toBe(referralCode);
    });

    it('should throw an error if the user is not authenticated', async () => {
        supabase.auth.getUser.mockResolvedValue({ data: { user: null } });

        await expect(getReferralCode()).rejects.toThrow('User not authenticated');
    });
  });

  describe('getReferralHistory action', () => {
    it('should return the referral history for the authenticated user', async () => {
        const history = [{ id: '1', referred_id: '2' }];
        supabase.select.mockResolvedValue({ data: history, error: null });

        const result = await getReferralHistory();

        expect(supabase.from).toHaveBeenCalledWith('v_user_referral_history');
        expect(result).toEqual(history);
    });

    it('should throw an error if the user is not authenticated', async () => {
        supabase.auth.getUser.mockResolvedValue({ data: { user: null } });

        await expect(getReferralHistory()).rejects.toThrow('User not authenticated');
    });
  });
});
