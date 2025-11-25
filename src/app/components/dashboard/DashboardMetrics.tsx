'use client';

import React, { useEffect, useState } from 'react';
import { performanceMonitor } from '@/lib/dashboard/performance-monitor';
import { Activity } from 'lucide-react';

interface MetricsSummary {
  totalRequests: number;
  avgLoadTime: number;
  cacheHitRate: number;
  slowestWidget?: string;
  avgApiTime: number;
  lastUpdated: number;
}

/**
 * Performance metrics display component
 * Shows dashboard load times, cache hit rates, and API performance
 */
export function DashboardMetrics() {
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceMonitor.getSummary());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, []);

  if (!metrics) return null;

  const formatTime = (ms: number) => `${Math.round(ms)}ms`;
  const formatRate = (rate: number) => `${Math.round(rate * 100)}%`;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="h-4 w-4 text-blue-600" />
        <h4 className="font-semibold text-sm text-blue-900">Performance</h4>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
        <div>
          <p className="text-blue-700 font-medium">Avg Load</p>
          <p className="text-blue-900 font-semibold">{formatTime(metrics.avgLoadTime)}</p>
        </div>
        <div>
          <p className="text-blue-700 font-medium">Cache Hit</p>
          <p className="text-blue-900 font-semibold">{formatRate(metrics.cacheHitRate)}</p>
        </div>
        <div>
          <p className="text-blue-700 font-medium">API Time</p>
          <p className="text-blue-900 font-semibold">{formatTime(metrics.avgApiTime)}</p>
        </div>
      </div>
    </div>
  );
}
