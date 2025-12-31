// components/admin/referral-velocity-chart.tsx
'use client';

import { Card, LineChart, Title, Text } from '@tremor/react';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { getReferralVelocityMockData, getMockDataEnabled } from '@/lib/mock-referral-data';

interface ReferralDataPoint {
  date: string;
  student: number;
  advisor: number;
  critic: number;
}

export function ReferralVelocityChart() {
  const [data, setData] = useState<ReferralDataPoint[]>([]);
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
      .channel('referral-velocity')
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

      // Get referral counts by date and type for the last 30 days, only approved referrals
      const { data: dailyData, error } = await supabase
        .from('referral_events')
        .select(`
          created_at,
          event_type,
          status
        `)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .in('event_type', ['student_subscription', 'advisor_recruitment', 'critic_recruitment'])
        .eq('status', 'approved') // Only count approved referrals
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching referral velocity data:', error);
        // Fall back to mock data on error
        if (useMockData) {
          setData(getReferralVelocityMockData());
        }
        return;
      }

      // Group data by date and event type
      const groupedData: Record<string, { student: number; advisor: number; critic: number }> = {};

      dailyData.forEach(event => {
        const date = new Date(event.created_at).toISOString().split('T')[0];
        if (!groupedData[date]) {
          groupedData[date] = { student: 0, advisor: 0, critic: 0 };
        }

        switch (event.event_type) {
          case 'student_subscription':
            groupedData[date].student += 1;
            break;
          case 'advisor_recruitment':
            groupedData[date].advisor += 1;
            break;
          case 'critic_recruitment':
            groupedData[date].critic += 1;
            break;
        }
      });

      // Convert to array and sort by date
      const result: ReferralDataPoint[] = Object.entries(groupedData)
        .map(([date, counts]) => ({
          date,
          student: counts.student,
          advisor: counts.advisor,
          critic: counts.critic
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setData(result);

      // If no real data and mock data is enabled, use mock data
      if (result.length === 0 && useMockData) {
        console.log('No real data available, using mock data');
        setData(getReferralVelocityMockData());
      }
    } catch (err) {
      console.error('Error in fetchData:', err);
      // Fall back to mock data on error
      if (useMockData) {
        setData(getReferralVelocityMockData());
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Title>Referral Velocity (Daily)</Title>
      <Text className="mt-2">Number of referrals by type over the last 30 days</Text>
      
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <LineChart
          className="mt-6"
          data={data}
          index="date"
          categories={['student', 'advisor', 'critic']}
          colors={['blue', 'orange', 'green']}
          yAxisWidth={60}
          showLegend
        />
      )}
    </Card>
  );
}