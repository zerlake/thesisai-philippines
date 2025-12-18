/**
 * Request Trace Component
 * Phase 5: Real-time Monitoring & Analytics
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AIPipelineEvent } from '@/lib/ai/monitoring/event-schema';

interface RequestTraceProps {
  refreshInterval?: number;
}

interface TraceStep {
  module: string;
  operation: string;
  duration: number;
  status: 'success' | 'warning' | 'error';
  timestamp: number;
  metadata?: Record<string, any>;
}

const RequestTrace: React.FC<RequestTraceProps> = ({ refreshInterval = 5000 }) => {
  const [traces, setTraces] = useState<{ id: string; steps: TraceStep[]; totalDuration: number; status: 'success' | 'warning' | 'error' }[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate fetching trace data
  useEffect(() => {
    const fetchTraceData = async () => {
      setLoading(true);

      // In a real implementation, this would fetch from Supabase or WebSocket
      const mockTraces = Array.from({ length: 5 }, (_, i) => {
        const steps: TraceStep[] = [
          {
            module: 'integration',
            operation: 'provider_route',
            duration: Math.random() * 50,
            status: Math.random() > 0.1 ? 'success' : 'warning',
            timestamp: Date.now() - Math.random() * 10000
          },
          {
            module: 'cache',
            operation: 'get',
            duration: Math.random() * 20,
            status: Math.random() > 0.05 ? 'success' : 'warning',
            timestamp: Date.now() - Math.random() * 8000
          },
          {
            module: 'orchestration',
            operation: 'workflow_start',
            duration: Math.random() * 30,
            status: 'success',
            timestamp: Date.now() - Math.random() * 6000
          },
          {
            module: 'context',
            operation: 'extract',
            duration: Math.random() * 100,
            status: Math.random() > 0.15 ? 'success' : 'warning',
            timestamp: Date.now() - Math.random() * 4000
          },
          {
            module: 'semantic',
            operation: 'analyze',
            duration: Math.random() * 200,
            status: Math.random() > 0.1 ? 'success' : 'warning',
            timestamp: Date.now() - Math.random() * 2000
          },
          {
            module: 'feedback',
            operation: 'aggregate',
            duration: Math.random() * 80,
            status: Math.random() > 0.05 ? 'success' : 'warning',
            timestamp: Date.now() - Math.random() * 1000
          }
        ];

        const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
        const hasErrors = steps.some(step => step.status === 'error');
        const hasWarnings = steps.some(step => step.status === 'warning');

        const traceStatus: 'error' | 'warning' | 'success' = hasErrors ? 'error' : hasWarnings ? 'warning' : 'success';

        return {
          id: `trace_${Date.now()}_${i}`,
          steps,
          totalDuration,
          status: traceStatus
        };
      });

      setTraces(mockTraces);
      setLoading(false);
    };

    fetchTraceData();

    const interval = setInterval(fetchTraceData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getStatusColor = (status: TraceStep['status']) => {
    switch (status) {
      case 'success': return 'bg-success/10 text-success-foreground';
      case 'warning': return 'bg-warning/10 text-warning-foreground';
      case 'error': return 'bg-destructive/10 text-destructive-foreground';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  const getOverallStatusColor = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success': return 'border-success';
      case 'warning': return 'border-warning';
      case 'error': return 'border-destructive';
      default: return 'border-border';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Request Tracing</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {traces.map((trace) => (
              <div
                key={trace.id}
                className={`border-l-4 rounded ${getOverallStatusColor(trace.status)} p-4 bg-muted/50`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Request: {trace.id}</h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant={trace.status === 'success' ? 'default' : trace.status === 'warning' ? 'secondary' : 'destructive'}>
                      {trace.status}
                    </Badge>
                    <span className="text-sm font-mono">{trace.totalDuration.toFixed(1)}ms</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {trace.steps.map((step, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-24 text-sm text-muted-foreground truncate">
                        {new Date(step.timestamp).toLocaleTimeString()}
                      </div>

                      <div className="w-24">
                        <Badge className={`${getStatusColor(step.status)}`}>
                          {step.module}
                        </Badge>
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span>{step.operation}</span>
                          <span>{step.duration.toFixed(1)}ms</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                          <div
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: `${(step.duration / Math.max(...trace.steps.map(s => s.duration))) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RequestTrace;