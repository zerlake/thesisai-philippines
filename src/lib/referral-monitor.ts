// lib/referral-monitor.ts - Realtime monitoring hooks
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { getPoolStatusMock, getMockDataEnabled } from './mock-referral-data';

const supabase = createClient();

export interface PoolStatus {
  period_start: string;
  pool_amount: number;
  student_remaining: number;
  advisor_remaining: number;
  critic_remaining: number;
  student_referrals_approved: number;
  advisor_recruitments_approved: number;
  critic_recruitments_approved: number;
  utilization_student: number; // percentage used
  utilization_advisor: number; // percentage used
  utilization_critic: number; // percentage used
}

export function useReferralPool() {
  const [poolStatus, setPoolStatus] = useState<PoolStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(getMockDataEnabled());
  
  useEffect(() => {
    // Initial load from dashboard view
    fetchPoolStatus();

    // Listen for custom event when mock data is toggled
    const handleMockDataToggle = () => {
      const enabled = getMockDataEnabled();
      setUseMockData(enabled);
      fetchPoolStatus();
    };

    window.addEventListener('mock-data-toggle', handleMockDataToggle);

    // Realtime subscription to referral_events and recruitment_pool
    const poolChannel = supabase
      .channel('pool_monitoring')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'recruitment_pool' },
        payload => fetchPoolStatus()
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'referral_events' },
        payload => fetchPoolStatus()
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'referral_events' },
        payload => fetchPoolStatus()
      )
      .subscribe();

    return () => {
      window.removeEventListener('mock-data-toggle', handleMockDataToggle);
      supabase.removeChannel(poolChannel);
    };
  }, []);
  
  const fetchPoolStatus = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('v_recruitment_dashboard')
        .select('*')
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data) {
        const utilizationStudent = data.student_allocation > 0
          ? ((data.student_allocation - data.student_remaining) / data.student_allocation) * 100
          : 0;

        const utilizationAdvisor = data.advisor_allocation > 0
          ? ((data.advisor_allocation - data.advisor_remaining) / data.advisor_allocation) * 100
          : 0;

        const utilizationCritic = data.critic_allocation > 0
          ? ((data.critic_allocation - data.critic_remaining) / data.critic_allocation) * 100
          : 0;

        setPoolStatus({
          ...data,
          utilization_student: parseFloat(utilizationStudent.toFixed(2)),
          utilization_advisor: parseFloat(utilizationAdvisor.toFixed(2)),
          utilization_critic: parseFloat(utilizationCritic.toFixed(2))
        });
      } else if (useMockData) {
        console.log('No pool data available, using mock data');
        setPoolStatus(getPoolStatusMock());
      }
    } catch (err) {
      console.error('Error fetching pool status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch pool status');
      // Fall back to mock data on error
      if (useMockData) {
        console.log('Error occurred, using mock data fallback');
        setPoolStatus(getPoolStatusMock());
      }
    } finally {
      setLoading(false);
    }
  };
  
  return { poolStatus, loading, error, refetch: fetchPoolStatus };
}