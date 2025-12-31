// components/admin/alert-section.tsx
import { Card, Text } from '@tremor/react';
import { PoolStatus } from '@/lib/referral-monitor';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

interface AlertSectionProps {
  poolStatus: PoolStatus;
}

interface FraudCount {
  count: number;
}

export function AlertSection({ poolStatus }: AlertSectionProps) {
  const [alerts, setAlerts] = useState<string[]>([]);
  const [fraudCount, setFraudCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchFraudData();
    
    // Subscribe to referral audits for real-time updates
    const channel = supabase
      .channel('fraud-alerts')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'referral_audits' }, 
        () => fetchFraudData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    // Generate alerts based on pool status
    const newAlerts: string[] = [];
    
    if (poolStatus.utilization_student > 85) {
      newAlerts.push('⚠️ Student pool >85% utilized - review pending referrals');
    }
    
    if (poolStatus.utilization_advisor > 85) {
      newAlerts.push('⚠️ Advisor pool >85% utilized - review pending referrals');
    }
    
    if (poolStatus.utilization_critic > 85) {
      newAlerts.push('⚠️ Critic pool >85% utilized - review pending referrals');
    }
    
    if (fraudCount > 5) {
      newAlerts.push(`🚨 High fraud score activity detected (${fraudCount} high-risk audits in last 7 days)`);
    }
    
    // Check for unusual referral velocity
    if (poolStatus.student_referrals_approved > 50) { // Threshold could be configurable
      newAlerts.push(`📈 Unusually high student referrals (${poolStatus.student_referrals_approved} approved)`);
    }
    
    if (newAlerts.length === 0) {
      newAlerts.push('✅ All systems healthy');
    }
    
    setAlerts(newAlerts);
  }, [poolStatus, fraudCount]);

  const fetchFraudData = async () => {
    try {
      setLoading(true);
      
      // Get count of high-risk fraud audits in the last 7 days
      const { data, error } = await supabase
        .from('referral_audits')
        .select('count', { count: 'exact' })
        .gte('score', 75)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        console.error('Error fetching fraud count:', error);
        return;
      }

      setFraudCount(data?.[0]?.count || 0);
    } catch (err) {
      console.error('Error in fetchFraudData:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card 
      title="Action Required" 
      className={alerts.some(alert => alert.includes('🚨') || alert.includes('⚠️')) ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}
    >
      <Text className="font-semibold mb-2">System Status</Text>
      <div className="space-y-2">
        {alerts.map((alert, i) => (
          <div 
            key={i} 
            className={`flex items-center space-x-2 p-2 rounded ${
              alert.includes('🚨') || alert.includes('⚠️') 
                ? 'bg-red-100 text-red-800' 
                : alert.includes('📈') 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-green-100 text-green-800'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${
              alert.includes('🚨') || alert.includes('⚠️') 
                ? 'bg-red-500' 
                : alert.includes('📈') 
                  ? 'bg-yellow-500' 
                  : 'bg-green-500'
            }`} />
            <Text>{alert}</Text>
          </div>
        ))}
      </div>
    </Card>
  );
}