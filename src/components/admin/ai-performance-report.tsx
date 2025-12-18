/**
 * Dynamic Performance Report Component
 * Phase 5: Real-time Monitoring & Analytics
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrendingUp, Activity, AlertCircle, Users } from 'lucide-react';
import { format } from 'date-fns';

interface PerformanceMetrics {
  totalEvents: number;
  cacheHitRate: number;
  avgResponseTime: number;
  errorRate: number;
  activeUsers: number;
  lastUpdated: Date;
}

interface PerformanceReportProps {
  refreshInterval?: number;
  className?: string;
}

const PerformanceReport: React.FC<PerformanceReportProps> = ({ 
  refreshInterval = 5000, 
  className = "" 
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalEvents: 0,
    cacheHitRate: 0,
    avgResponseTime: 0,
    errorRate: 0,
    activeUsers: 0,
    lastUpdated: new Date()
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate fetching real-time data
  useEffect(() => {
    const fetchMetrics = async () => {
      setIsRefreshing(true);
      
      // In a real implementation, this would fetch from Supabase WebSocket or API
      // For simulation, we'll generate realistic changes to the metrics
      setMetrics(prev => {
        // Generate realistic fluctuations based on current metrics
        const newTotalEvents = prev.totalEvents + Math.floor(Math.random() * 10) + 1;
        const newCacheHitRate = Math.max(70, Math.min(99.9, prev.cacheHitRate + (Math.random() * 2 - 1)));
        const newAvgResponseTime = Math.max(50, Math.min(1000, prev.avgResponseTime + (Math.random() * 40 - 20)));
        const newErrorRate = Math.max(0, Math.min(5, prev.errorRate + (Math.random() * 0.5 - 0.25)));
        const newActiveUsers = Math.max(0, Math.min(200, prev.activeUsers + Math.floor(Math.random() * 3 - 1)));

        return {
          totalEvents: newTotalEvents,
          cacheHitRate: parseFloat(newCacheHitRate.toFixed(1)),
          avgResponseTime: parseFloat(newAvgResponseTime.toFixed(1)),
          errorRate: parseFloat(newErrorRate.toFixed(2)),
          activeUsers: newActiveUsers,
          lastUpdated: new Date()
        };
      });

      setLoading(false);
      setIsRefreshing(false);
    };

    // Initial fetch
    fetchMetrics();

    // Set up interval for updates
    const interval = setInterval(fetchMetrics, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const refreshMetrics = async () => {
    setLoading(true);
    setIsRefreshing(true);
    
    // Simulate a manual refresh
    setMetrics(prev => ({
      ...prev,
      lastUpdated: new Date()
    }));
    
    // In real implementation, would fetch fresh data from API
    setTimeout(() => {
      setLoading(false);
      setIsRefreshing(false);
    }, 800);
  };

  // Calculate trend indicators
  const getCacheRateTrend = (current: number, baseline: number = 90) => {
    if (current >= baseline) return { trend: 'up', color: 'text-success' };
    return { trend: 'down', color: 'text-destructive' };
  };

  const getResponseTimeTrend = (current: number, baseline: number = 300) => {
    if (current <= baseline) return { trend: 'down', color: 'text-success' };
    return { trend: 'up', color: 'text-destructive' };
  };

  const getErrorRateTrend = (current: number, baseline: number = 2) => {
    if (current <= baseline) return { trend: 'down', color: 'text-success' };
    return { trend: 'up', color: 'text-destructive' };
  };

  const getActiveUsersTrend = (current: number) => {
    if (current > 100) return { trend: 'up', color: 'text-success' };
    if (current > 50) return { trend: 'up', color: 'text-warning' };
    return { trend: 'up', color: 'text-muted-foreground' };
  };

  // Get trend indicators
  const cacheTrend = getCacheRateTrend(metrics.cacheHitRate);
  const responseTrend = getResponseTimeTrend(metrics.avgResponseTime);
  const errorTrend = getErrorRateTrend(metrics.errorRate);
  const usersTrend = getActiveUsersTrend(metrics.activeUsers);

  const getMetricColor = (value: number, type: 'cache' | 'response' | 'error') => {
    switch(type) {
      case 'cache':
        return value > 95 ? 'text-success' : value > 90 ? 'text-warning' : 'text-destructive';
      case 'response':
        return value < 150 ? 'text-success' : value < 300 ? 'text-warning' : 'text-destructive';
      case 'error':
        return value < 1 ? 'text-success' : value < 2 ? 'text-warning' : 'text-destructive';
      default:
        return 'text-foreground';
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <CardTitle className="text-xl font-bold">Performance Report</CardTitle>
          <Badge variant="outline" className="text-xs capitalize">
            {isRefreshing ? 'Updating...' : 'Live'}
          </Badge>
        </div>
        <button
          onClick={refreshMetrics}
          disabled={isRefreshing}
          className="p-2 rounded-full hover:bg-accent transition-colors disabled:opacity-50"
          title="Refresh metrics"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Total Events Card */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-muted-foreground">Total Events</h3>
                </div>
                <TrendingUp className={`w-4 h-4 ${cacheTrend.color}`} />
              </div>
              <div className="text-2xl font-bold">{metrics.totalEvents.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Updated: {format(metrics.lastUpdated, 'h:mm:ss a')}
              </div>
            </div>

            {/* Cache Hit Rate Card */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-muted-foreground">Cache Hit Rate</h3>
                </div>
                <TrendingUp className={`w-4 h-4 ${cacheTrend.color}`} />
              </div>
              <div className={`text-2xl font-bold ${getMetricColor(metrics.cacheHitRate, 'cache')}`}>
                {metrics.cacheHitRate}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {metrics.cacheHitRate > 95 ? 'Excellent' : metrics.cacheHitRate > 90 ? 'Good' : 'Needs attention'}
              </div>
            </div>

            {/* Avg Response Time Card */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-muted-foreground">Avg Response</h3>
                </div>
                <TrendingUp className={`w-4 h-4 ${responseTrend.color}`} />
              </div>
              <div className={`text-2xl font-bold ${getMetricColor(metrics.avgResponseTime, 'response')}`}>
                {metrics.avgResponseTime}ms
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {metrics.avgResponseTime < 150 ? 'Fast' : metrics.avgResponseTime < 300 ? 'Average' : 'Slow'}
              </div>
            </div>

            {/* Error Rate Card */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-muted-foreground">Error Rate</h3>
                </div>
                <TrendingUp className={`w-4 h-4 ${errorTrend.color}`} />
              </div>
              <div className={`text-2xl font-bold ${getMetricColor(metrics.errorRate, 'error')}`}>
                {metrics.errorRate}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {metrics.errorRate < 1 ? 'Excellent' : metrics.errorRate < 2 ? 'Good' : 'High'}
              </div>
            </div>

            {/* Active Users Card */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-muted-foreground">Active Users</h3>
                </div>
                <TrendingUp className={`w-4 h-4 ${usersTrend.color}`} />
              </div>
              <div className="text-2xl font-bold">{metrics.activeUsers}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Online now
              </div>
            </div>
          </div>
        )}

        {/* Additional metrics section */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">Additional Metrics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Throughput</div>
              <div className="font-medium">{Math.round(metrics.totalEvents / 60)} req/min</div>
            </div>
            <div>
              <div className="text-muted-foreground">Cache Efficiency</div>
              <div className={`font-medium ${getMetricColor(metrics.cacheHitRate, 'cache')}`}>
                {metrics.cacheHitRate > 95 ? 'Optimal' : metrics.cacheHitRate > 90 ? 'Good' : 'Needs Optimization'}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Reliability</div>
              <div className={`font-medium ${getMetricColor(100 - metrics.errorRate, 'error')}`}>
                {Math.round(100 - metrics.errorRate)}%
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Performance Index</div>
              <div className={`font-medium ${
                metrics.cacheHitRate > 90 && metrics.avgResponseTime < 300 && metrics.errorRate < 2 
                  ? 'text-success' 
                  : 'text-warning'
              }`}>
                {metrics.cacheHitRate > 90 && metrics.avgResponseTime < 300 && metrics.errorRate < 2 
                  ? 'Optimal' 
                  : 'Monitor'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceReport;