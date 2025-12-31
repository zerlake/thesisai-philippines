"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Zap,
  TrendingUp,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Filter
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";
import { format } from "date-fns";
import { getMockDataEnabled } from "@/lib/mock-referral-data";

interface AIUsageRecord {
  id: string;
  tool_name: string;
  action_type: string;
  tokens_used?: number;
  processing_time_ms?: number;
  cost_credits?: number;
  success: boolean;
  error_message?: string;
  created_at: string;
}

interface AIUsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalTokens: number;
  totalCost: number;
  averageProcessingTime: number;
  mostUsedTool: string;
}

export default function AIUsagePage() {
  const { session } = useAuth();
  const [usageRecords, setUsageRecords] = useState<AIUsageRecord[]>([]);
  const [stats, setStats] = useState<AIUsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTool, setFilterTool] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [useMockData] = useState(getMockDataEnabled());

  useEffect(() => {
    loadUsageData();
  }, []);

  const loadUsageData = async () => {
    setIsLoading(true);
    try {
      if (useMockData) {
        // Mock data
        const mockRecords: AIUsageRecord[] = [
          {
            id: '1',
            tool_name: 'Text Paraphraser',
            action_type: 'generate',
            tokens_used: 450,
            processing_time_ms: 1200,
            cost_credits: 0.05,
            success: true,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            tool_name: 'Research Gap Analyzer',
            action_type: 'analyze',
            tokens_used: 1250,
            processing_time_ms: 3500,
            cost_credits: 0.15,
            success: true,
            created_at: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: '3',
            tool_name: 'Citation Generator',
            action_type: 'create',
            tokens_used: 320,
            processing_time_ms: 890,
            cost_credits: 0.03,
            success: true,
            created_at: new Date(Date.now() - 7200000).toISOString()
          },
          {
            id: '4',
            tool_name: 'Document Summarizer',
            action_type: 'summarize',
            tokens_used: 2100,
            processing_time_ms: 5200,
            cost_credits: 0.25,
            success: false,
            error_message: 'Rate limit exceeded',
            created_at: new Date(Date.now() - 10800000).toISOString()
          },
          {
            id: '5',
            tool_name: 'Thesis Outliner',
            action_type: 'create',
            tokens_used: 850,
            processing_time_ms: 2100,
            cost_credits: 0.10,
            success: true,
            created_at: new Date(Date.now() - 14400000).toISOString()
          }
        ];

        const mockStats: AIUsageStats = {
          totalRequests: 45,
          successfulRequests: 42,
          failedRequests: 3,
          totalTokens: 23500,
          totalCost: 2.85,
          averageProcessingTime: 2100,
          mostUsedTool: 'Text Paraphraser'
        };

        setUsageRecords(mockRecords);
        setStats(mockStats);
      } else {
        // Fetch from API - would need to create this endpoint
        const { createBrowserClient } = await import('@/lib/supabase/client');
        const supabase = createBrowserClient();
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (!currentSession) {
          throw new Error('No active session');
        }

        // Direct query to ai_tool_usage table
        const { data: records, error: recordsError } = await supabase
          .from('ai_tool_usage')
          .select('*')
          .eq('user_id', currentSession.user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (recordsError) throw recordsError;

        setUsageRecords(records || []);

        // Calculate stats
        if (records && records.length > 0) {
          const successfulRecords = records.filter(r => r.success);
          const failedRecords = records.filter(r => !r.success);
          const totalTokens = records.reduce((sum, r) => sum + (r.tokens_used || 0), 0);
          const totalCost = records.reduce((sum, r) => sum + (r.cost_credits || 0), 0);
          const avgProcessingTime = records.reduce((sum, r) => sum + (r.processing_time_ms || 0), 0) / records.length;

          // Find most used tool
          const toolCounts: Record<string, number> = {};
          records.forEach(r => {
            toolCounts[r.tool_name] = (toolCounts[r.tool_name] || 0) + 1;
          });
          const mostUsedTool = Object.entries(toolCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

          setStats({
            totalRequests: records.length,
            successfulRequests: successfulRecords.length,
            failedRequests: failedRecords.length,
            totalTokens,
            totalCost,
            averageProcessingTime: avgProcessingTime,
            mostUsedTool
          });
        }
      }
    } catch (error) {
      console.error('Error loading AI usage data:', error);
      toast.error('Failed to load AI usage data');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecords = usageRecords.filter(record => {
    const matchesTool = filterTool === 'all' || record.tool_name === filterTool;
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'success' && record.success) ||
                         (filterStatus === 'failed' && !record.success);
    return matchesTool && matchesStatus;
  });

  const uniqueTools = Array.from(new Set(usageRecords.map(r => r.tool_name)));

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Usage Dashboard</h1>
        <p className="text-muted-foreground">Track your AI tool consumption and costs</p>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24 mb-2" />
                <div className="h-8 bg-muted rounded w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequests}</div>
              <p className="text-xs text-muted-foreground">
                {stats.successfulRequests} successful
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tokens Used</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTokens.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                ~{Math.round(stats.totalTokens / stats.totalRequests)} per request
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalCost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                in credits consumed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.averageProcessingTime)}ms</div>
              <p className="text-xs text-muted-foreground">
                per request
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Most Used Tool */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Most Used Tool
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.mostUsedTool}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Success rate: {((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={filterTool}
          onChange={(e) => setFilterTool(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="all">All Tools</option>
          {uniqueTools.map(tool => (
            <option key={tool} value={tool}>{tool}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="all">All Status</option>
          <option value="success">Successful</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Usage History */}
      <Card>
        <CardHeader>
          <CardTitle>Usage History</CardTitle>
          <CardDescription>Recent AI tool requests and their results</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 p-4 border rounded-lg">
                  <div className="h-10 w-10 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No usage records found</h3>
              <p className="text-muted-foreground">
                {filterTool !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Start using AI tools to see your usage history'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className={`flex-shrink-0 ${record.success ? 'text-green-600' : 'text-red-600'}`}>
                    {record.success ? (
                      <CheckCircle className="h-8 w-8" />
                    ) : (
                      <XCircle className="h-8 w-8" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{record.tool_name}</p>
                      <Badge variant="outline" className="text-xs">
                        {record.action_type}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {record.tokens_used && (
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {record.tokens_used} tokens
                        </span>
                      )}
                      {record.processing_time_ms && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {record.processing_time_ms}ms
                        </span>
                      )}
                      {record.cost_credits && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ${record.cost_credits.toFixed(3)}
                        </span>
                      )}
                      <span>{format(new Date(record.created_at), 'MMM d, h:mm a')}</span>
                    </div>
                    {record.error_message && (
                      <p className="text-xs text-red-600 mt-1">{record.error_message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
