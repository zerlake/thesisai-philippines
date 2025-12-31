// components/admin/fraud-signals-chart.tsx
'use client';

import { Card, BarChart, Title, Text } from '@tremor/react';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { getFraudSignalsMockData, getMockDataEnabled } from '@/lib/mock-referral-data';

interface FraudDataPoint {
  date: string;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
}

export function FraudSignalsChart() {
  const [data, setData] = useState<FraudDataPoint[]>([]);
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

    // Subscribe to referral audits for real-time updates
    const channel = supabase
      .channel('fraud-signals')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'referral_audits' },
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

      // Get fraud audit counts by date and risk level for the last 30 days
      const { data: auditData, error } = await supabase
        .from('referral_audits')
        .select(`
          created_at,
          score
        `)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching fraud signals data:', error);
        // Fall back to mock data on error
        if (useMockData) {
          setData(getFraudSignalsMockData());
        }
        return;
      }

      // Group data by date and risk level
      const groupedData: Record<string, { high_risk: number; medium_risk: number; low_risk: number }> = {};

      auditData.forEach(audit => {
        const date = new Date(audit.created_at).toISOString().split('T')[0];
        if (!groupedData[date]) {
          groupedData[date] = { high_risk: 0, medium_risk: 0, low_risk: 0 };
        }

        // Use score field
        if (audit.score >= 75) {
          groupedData[date].high_risk += 1;
        } else if (audit.score >= 50) {
          groupedData[date].medium_risk += 1;
        } else {
          groupedData[date].low_risk += 1;
        }
      });

      // Convert to array and sort by date
      const result: FraudDataPoint[] = Object.entries(groupedData)
        .map(([date, counts]) => ({
          date,
          high_risk: counts.high_risk,
          medium_risk: counts.medium_risk,
          low_risk: counts.low_risk
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setData(result);

      // If no real data and mock data is enabled, use mock data
      if (result.length === 0 && useMockData) {
        console.log('No real data available, using mock data');
        setData(getFraudSignalsMockData());
      }
    } catch (err) {
      console.error('Error in fetchData:', err);
      // Fall back to mock data on error
      if (useMockData) {
        setData(getFraudSignalsMockData());
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Title>Fraud Signals (Daily)</Title>
      <Text className="mt-2">Risk level distribution of referral audits over the last 30 days</Text>
      
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <BarChart
          className="mt-6"
          data={data}
          index="date"
          categories={['low_risk', 'medium_risk', 'high_risk']}
          colors={['emerald', 'yellow', 'red']}
          yAxisWidth={60}
          showLegend
        />
      )}
    </Card>
  );
}