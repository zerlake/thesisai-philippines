// components/admin/top-recruiters-chart.tsx
'use client';

import { Card, BarChart, Title, Text } from '@tremor/react';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { getTopRecruitersMockData, getMockDataEnabled } from '@/lib/mock-referral-data';

interface TopRecruiter {
  referrer_name: string;
  total_referrals: number;
  approved_referrals: number;
  total_earnings: number;
}

export function TopRecruitersChart() {
  const [data, setData] = useState<TopRecruiter[]>([]);
  const [loading, setLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(getMockDataEnabled());
  const supabase = createClient();

  useEffect(() => {
    fetchData();

    // Listen for custom event when mock data is toggled
    const handleMockDataToggle = () => {
      const enabled = getMockDataEnabled();
      setUseMockData(enabled);
      fetchData();
    };

    window.addEventListener('mock-data-toggle', handleMockDataToggle);

    // Subscribe to referral events for real-time updates
    const channel = supabase
      .channel('top-recruiters')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'referral_events' },
        () => fetchData()
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'referral_events' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      window.removeEventListener('mock-data-toggle', handleMockDataToggle);
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Get top recruiters by approved referrals with commission data
      const { data: referrerData, error } = await supabase
        .from('referral_events')
        .select(`
          referrer_id,
          profiles:first_name,
          profiles:last_name,
          commission_amount,
          status
        `)
        .eq('status', 'approved')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching top recruiters data:', error);
        // Fall back to mock data on error
        if (useMockData) {
          setData(getTopRecruitersMockData());
        }
        return;
      }

      // Group by referrer and calculate stats
      const referrerStats: Record<string, TopRecruiter> = {};

      referrerData.forEach(referral => {
        const referrerId = referral.referrer_id;
        const referrerName = `${referral.profiles?.first_name || 'Unknown'} ${referral.profiles?.last_name || ''}`;

        if (!referrerStats[referrerId]) {
          referrerStats[referrerId] = {
            referrer_name: referrerName,
            total_referrals: 0,
            approved_referrals: 0,
            total_earnings: 0
          };
        }

        referrerStats[referrerId].total_referrals += 1;
        referrerStats[referrerId].approved_referrals += 1;
        referrerStats[referrerId].total_earnings += referral.commission_amount || 0;
      });

      // Convert to array and sort by total earnings (descending)
      const result: TopRecruiter[] = Object.values(referrerStats)
        .sort((a, b) => b.total_earnings - a.total_earnings)
        .slice(0, 10); // Top 10

      setData(result);

      // If no real data and mock data is enabled, use mock data
      if (result.length === 0 && useMockData) {
        console.log('No real data available, using mock data');
        setData(getTopRecruitersMockData());
      }
    } catch (err) {
      console.error('Error in fetchData:', err);
      // Fall back to mock data on error
      if (useMockData) {
        setData(getTopRecruitersMockData());
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Title>Top Recruiters</Title>
      <Text className="mt-2">Top 10 referrers by approved referrals</Text>
      
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : data.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No recruiter data available</div>
      ) : (
        <BarChart
          className="mt-6"
          data={data}
          index="referrer_name"
          categories={['approved_referrals']}
          colors={['blue']}
          yAxisWidth={60}
          showAnimation
        />
      )}
    </Card>
  );
}