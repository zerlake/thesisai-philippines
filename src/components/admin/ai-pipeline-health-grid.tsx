/**
 * AI Pipeline Health Grid Component
 * Phase 5: Real-time Monitoring & Analytics
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HealthStatus {
  module: string;
  status: 'healthy' | 'warning' | 'error' | 'offline';
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastUpdated: number;
}

interface HealthGridProps {
  refreshInterval?: number;
}

const HealthGrid: React.FC<HealthGridProps> = ({ refreshInterval = 5000 }) => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate fetching health data - in real app, this would come from WebSocket or API
  useEffect(() => {
    const fetchHealthData = async () => {
      setLoading(true);

      // In a real implementation, this would fetch from Supabase or WebSocket
      const mockHealthData: HealthStatus[] = [
        {
          module: 'cache',
          status: Math.random() > 0.1 ? 'healthy' : 'warning',
          uptime: 99.9,
          responseTime: Math.random() * 50, // ms
          errorRate: Math.random() * 0.1, // %
          lastUpdated: Date.now()
        },
        {
          module: 'orchestration',
          status: Math.random() > 0.15 ? 'healthy' : 'warning',
          uptime: 99.8,
          responseTime: Math.random() * 100, // ms
          errorRate: Math.random() * 0.2, // %
          lastUpdated: Date.now()
        },
        {
          module: 'errors',
          status: 'healthy',
          uptime: 100,
          responseTime: Math.random() * 20, // ms
          errorRate: 0,
          lastUpdated: Date.now()
        },
        {
          module: 'context',
          status: Math.random() > 0.05 ? 'healthy' : 'warning',
          uptime: 99.95,
          responseTime: Math.random() * 150, // ms
          errorRate: Math.random() * 0.05, // %
          lastUpdated: Date.now()
        },
        {
          module: 'feedback',
          status: Math.random() > 0.1 ? 'healthy' : 'warning',
          uptime: 99.85,
          responseTime: Math.random() * 200, // ms
          errorRate: Math.random() * 0.15, // %
          lastUpdated: Date.now()
        },
        {
          module: 'suggestions',
          status: Math.random() > 0.2 ? 'healthy' : 'warning',
          uptime: 99.7,
          responseTime: Math.random() * 80, // ms
          errorRate: Math.random() * 0.3, // %
          lastUpdated: Date.now()
        },
        {
          module: 'semantic',
          status: Math.random() > 0.15 ? 'healthy' : 'warning',
          uptime: 99.8,
          responseTime: Math.random() * 300, // ms
          errorRate: Math.random() * 0.2, // %
          lastUpdated: Date.now()
        },
        {
          module: 'multimodal',
          status: Math.random() > 0.1 ? 'healthy' : 'warning',
          uptime: 99.75,
          responseTime: Math.random() * 500, // ms
          errorRate: Math.random() * 0.25, // %
          lastUpdated: Date.now()
        },
        {
          module: 'adaptive',
          status: Math.random() > 0.05 ? 'healthy' : 'warning',
          uptime: 99.9,
          responseTime: Math.random() * 120, // ms
          errorRate: Math.random() * 0.1, // %
          lastUpdated: Date.now()
        },
        {
          module: 'integration',
          status: Math.random() > 0.08 ? 'healthy' : 'warning',
          uptime: 99.88,
          responseTime: Math.random() * 250, // ms
          errorRate: Math.random() * 0.12, // %
          lastUpdated: Date.now()
        }
      ];

      setHealthStatus(mockHealthData);
      setLoading(false);
    };

    fetchHealthData();

    const interval = setInterval(fetchHealthData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getStatusColor = (status: HealthStatus['status']) => {
    switch (status) {
      case 'healthy': return 'bg-success';
      case 'warning': return 'bg-warning';
      case 'error': return 'bg-destructive';
      case 'offline': return 'bg-muted-foreground';
      default: return 'bg-muted-foreground';
    }
  };

  const getStatusText = (status: HealthStatus['status']) => {
    switch (status) {
      case 'healthy': return 'Healthy';
      case 'warning': return 'Warning';
      case 'error': return 'Error';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI Pipeline Health Status</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {healthStatus.map((status) => (
              <div key={status.module} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold capitalize">{status.module}</h3>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(status.status)}`}></div>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={status.status === 'healthy' ? 'default' : status.status === 'warning' ? 'secondary' : 'destructive'}>
                      {getStatusText(status.status)}
                    </Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uptime:</span>
                    <span>{status.uptime}%</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Response:</span>
                    <span>{status.responseTime.toFixed(1)}ms</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Error Rate:</span>
                    <span>{status.errorRate.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthGrid;