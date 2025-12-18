/**
 * Provider Routing Component
 * Phase 5: Real-time Monitoring & Analytics
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProviderStats {
  provider: string;
  requests: number;
  successRate: number;
  avgLatency: number;
  fallbacks: number;
  lastActivity: number;
}

interface ProviderRoutingProps {
  refreshInterval?: number;
}

const ProviderRouting: React.FC<ProviderRoutingProps> = ({ refreshInterval = 5000 }) => {
  const [providerStats, setProviderStats] = useState<ProviderStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate fetching provider routing data
  useEffect(() => {
    const fetchProviderData = async () => {
      setLoading(true);
      
      // In a real implementation, this would fetch from Supabase
      const mockProviderStats: ProviderStats[] = [
        {
          provider: 'puter',
          requests: Math.floor(Math.random() * 1000) + 500,
          successRate: 99.5 + Math.random() * 0.4, // 99.5-99.9%
          avgLatency: 150 + Math.random() * 100, // 150-250ms
          fallbacks: Math.floor(Math.random() * 10),
          lastActivity: Date.now() - Math.random() * 10000
        },
        {
          provider: 'openai',
          requests: Math.floor(Math.random() * 800) + 400,
          successRate: 98.5 + Math.random() * 1.4, // 98.5-99.9%
          avgLatency: 300 + Math.random() * 200, // 300-500ms
          fallbacks: Math.floor(Math.random() * 20),
          lastActivity: Date.now() - Math.random() * 10000
        },
        {
          provider: 'mock',
          requests: Math.floor(Math.random() * 100) + 50,
          successRate: 100,
          avgLatency: 10 + Math.random() * 20, // 10-30ms
          fallbacks: 0,
          lastActivity: Date.now() - Math.random() * 10000
        }
      ];

      setProviderStats(mockProviderStats);
      setLoading(false);
    };

    fetchProviderData();

    const interval = setInterval(fetchProviderData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const totalRequests = providerStats.reduce((sum, stat) => sum + stat.requests, 0);
  const totalFallbacks = providerStats.reduce((sum, stat) => sum + stat.fallbacks, 0);
  const overallSuccessRate = providerStats.length > 0 
    ? providerStats.reduce((sum, stat) => sum + (stat.successRate * stat.requests), 0) / totalRequests
    : 0;

  // Data for the bar chart
  const chartData = providerStats.map(stat => ({
    name: stat.provider,
    requests: stat.requests,
    avgLatency: stat.avgLatency,
    successRate: stat.successRate
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Provider Routing Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Total Requests</h3>
                <p className="text-2xl font-bold">{totalRequests.toLocaleString()}</p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Overall Success Rate</h3>
                <p className="text-2xl font-bold text-success">{overallSuccessRate.toFixed(2)}%</p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Total Fallbacks</h3>
                <p className="text-2xl font-bold text-warning">{totalFallbacks}</p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Active Providers</h3>
                <p className="text-2xl font-bold">{providerStats.length}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Provider Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="requests" name="Requests" fill="hsl(267, 75%, 47%)" />
                    <Bar dataKey="avgLatency" name="Avg Latency (ms)" fill="hsl(186, 74%, 61%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Provider Details</h3>
              <div className="space-y-4">
                {providerStats.map((stat) => (
                  <div key={stat.provider} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold capitalize">{stat.provider}</h4>
                      <Badge variant={stat.provider === 'puter' ? 'default' : stat.provider === 'openai' ? 'secondary' : 'outline'}>
                        {stat.provider}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Requests</p>
                        <p className="font-semibold">{stat.requests.toLocaleString()}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                        <div className="flex items-center">
                          <p className="font-semibold">{stat.successRate.toFixed(2)}%</p>
                          <div className="ml-2 flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                stat.successRate > 99 ? 'bg-success' :
                                stat.successRate > 95 ? 'bg-warning' :
                                'bg-destructive'
                              }`}
                              style={{ width: `${stat.successRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Avg Latency</p>
                        <p className="font-semibold">{stat.avgLatency.toFixed(1)}ms</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Fallbacks</p>
                        <p className="font-semibold text-warning">{stat.fallbacks}</p>
                      </div>
                    </div>

                    <div className="mt-2 text-sm text-muted-foreground">
                      Last activity: {new Date(stat.lastActivity).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProviderRouting;