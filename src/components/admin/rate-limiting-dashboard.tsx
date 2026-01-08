"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  Users,
  Clock,
  BarChart3,
  ShieldAlert,
  Database,
  Server,
  Calendar,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";
import {
  HourlyMetricsChart,
  ResponseTimeChart,
  ViolationsByFeatureChart,
  UsageByFeatureChart
} from "./rate-limit-metrics-charts";

// Types for our API responses
type RateLimitMetrics = {
  summary: {
    totalRequests: number;
    successfulRequests: number;
    rateLimitedRequests: number;
    status4xx: number;
    status5xx: number;
    successRate: number;
    rateLimitRate: number;
    errorRate: number;
    avgResponseTimeMs: number;
    totalUniqueUsers: number;
    totalUniqueIps: number;
    hourlyDataPoints: number;
  };
  metrics: Array<{
    hourStart: string;
    endpointPath: string;
    featureName: string;
    totalRequests: number;
    successfulRequests: number;
    rateLimitedRequests: number;
    status4xx: number;
    status5xx: number;
    avgResponseTimeMs: number;
    uniqueUsers: number;
    uniqueIps: number;
    maxRequestsPerUser: number;
  }>;
  meta: {
    startDate: string;
    endDate: string;
    filters: {
      endpointPath?: string;
      featureName?: string;
    };
  };
};

type RateLimitViolations = {
  summary: Array<{
    featureName: string;
    violationType: string;
    violationCount: number;
    affectedUsers: number;
    uniqueIdentifiers: number;
    maxExcess: number;
    firstSeen: string;
    lastSeen: string;
  }>;
  aggregates: {
    totalViolations: number;
    totalAffectedUsers: number;
    mostViolatedFeature: string;
    violationTypes: string[];
    featuresAffected: string[];
  };
  meta: {
    startDate: string;
    endDate: string;
    filters: {
      featureName?: string;
      violationType?: string;
    };
  };
};

type RateLimitUsage = {
  summary: {
    totalUses: number;
    uniqueUsers: number;
    uniqueDates: number;
    violations: number;
    violationRate: number;
    avgUsesPerUser: number;
  };
  usageByFeature: Record<string, { total: number; users: number; violations: number }>;
  usageByPlan: Record<string, number>;
  meta: {
    startDate: string;
    endDate: string;
  };
};

type TopViolatingUsers = {
  users: Array<{
    userId: string;
    fullName: string | null;
    email: string | null;
    totalViolations: number;
    featuresViolated: number;
    lastViolation: string;
  }>;
  patterns: {
    violationsByFeature: Record<string, number>;
    violationsByPlan: Record<string, number>;
  };
  meta: {
    totalUsers: number;
    topViolator: any;
  };
};

export function RateLimitingDashboard() {
  const { supabase } = useAuth();
  const [activeTab, setActiveTab] = useState<'metrics' | 'violations' | 'usage'>('metrics');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<RateLimitMetrics | null>(null);
  const [violations, setViolations] = useState<RateLimitViolations | null>(null);
  const [usage, setUsage] = useState<RateLimitUsage | null>(null);
  const [topUsers, setTopUsers] = useState<TopViolatingUsers | null>(null);

  // Calculate date ranges based on time range
  const getDateRange = () => {
    const endDate = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
    }
    
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
  };

  // Fetch metrics data
  const fetchMetrics = async () => {
    try {
      const { startDate, endDate } = getDateRange();
      const response = await fetch(`/api/admin/rate-limiting/metrics?startDate=${startDate}&endDate=${endDate}`, {
        headers: {
          'Authorization': `Bearer ${await getAccessToken()}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch metrics');
      }
      
      const data = await response.json();
      setMetrics(data);
    } catch (error: any) {
      console.error('Error fetching metrics:', error);
      toast.error(`Failed to fetch metrics: ${error.message}`);
    }
  };

  // Fetch violations data
  const fetchViolations = async () => {
    try {
      const { startDate, endDate } = getDateRange();
      const response = await fetch(`/api/admin/rate-limiting/violations?startDate=${startDate}&endDate=${endDate}&view=summary`, {
        headers: {
          'Authorization': `Bearer ${await getAccessToken()}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch violations');
      }
      
      const data = await response.json();
      setViolations(data);
    } catch (error: any) {
      console.error('Error fetching violations:', error);
      toast.error(`Failed to fetch violations: ${error.message}`);
    }
  };

  // Fetch usage data
  const fetchUsage = async () => {
    try {
      const { startDate, endDate } = getDateRange();
      const response = await fetch(`/api/admin/rate-limiting/usage?startDate=${startDate}&endDate=${endDate}&view=overview`, {
        headers: {
          'Authorization': `Bearer ${await getAccessToken()}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch usage');
      }
      
      const data = await response.json();
      setUsage(data);
    } catch (error: any) {
      console.error('Error fetching usage:', error);
      toast.error(`Failed to fetch usage: ${error.message}`);
    }
  };

  // Fetch top violating users
  const fetchTopUsers = async () => {
    try {
      const response = await fetch('/api/admin/rate-limiting/violations?view=users', {
        headers: {
          'Authorization': `Bearer ${await getAccessToken()}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch top users');
      }
      
      const data = await response.json();
      setTopUsers(data);
    } catch (error: any) {
      console.error('Error fetching top users:', error);
      toast.error(`Failed to fetch top users: ${error.message}`);
    }
  };

  // Helper function to get access token
  const getAccessToken = async (): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || '';
  };

  // Fetch all data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchMetrics(),
        fetchViolations(),
        fetchUsage(),
        fetchTopUsers()
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  // Format numbers with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  // Format percentage
  const formatPercentage = (num: number): string => {
    return num.toFixed(2) + '%';
  };

  // Format time in ms
  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-red-500" />
            Rate Limiting Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor API usage, violations, and system performance
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">Time Range:</span>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-background border rounded px-2 py-1 text-sm"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchData}
            disabled={isLoading}
          >
            <Filter className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {metrics ? formatNumber(metrics.summary.totalRequests) : '0'}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {metrics ? `Success: ${formatPercentage(metrics.summary.successRate)}` : 'Loading...'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rate Limited</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-red-500">
                {metrics ? formatNumber(metrics.summary.rateLimitedRequests) : '0'}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {metrics ? `Rate: ${formatPercentage(metrics.summary.rateLimitRate)}` : 'Loading...'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {metrics ? formatNumber(metrics.summary.totalUniqueUsers) : '0'}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {violations ? `Violations: ${formatNumber(violations.aggregates.totalAffectedUsers)}` : 'Loading...'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {metrics ? formatTime(metrics.summary.avgResponseTimeMs) : '0ms'}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {metrics ? `Errors: ${formatPercentage(metrics.summary.errorRate)}` : 'Loading...'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="violations" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Violations
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Usage Analytics
          </TabsTrigger>
        </TabsList>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Request Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Request Overview
                </CardTitle>
                <CardDescription>
                  Distribution of request types and status codes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : metrics ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Requests</span>
                      <span className="font-medium">{formatNumber(metrics.summary.totalRequests)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Successful</span>
                      <span className="font-medium text-green-600">{formatNumber(metrics.summary.successfulRequests)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate Limited</span>
                      <span className="font-medium text-red-600">{formatNumber(metrics.summary.rateLimitedRequests)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>4xx Errors</span>
                      <span className="font-medium text-yellow-600">{formatNumber(metrics.summary.status4xx)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>5xx Errors</span>
                      <span className="font-medium text-red-600">{formatNumber(metrics.summary.status5xx)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No metrics data available</p>
                )}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>
                  System performance and efficiency metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : metrics ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Success Rate</span>
                      <span className="font-medium">{formatPercentage(metrics.summary.successRate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate Limit Rate</span>
                      <span className="font-medium">{formatPercentage(metrics.summary.rateLimitRate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Error Rate</span>
                      <span className="font-medium">{formatPercentage(metrics.summary.errorRate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Response Time</span>
                      <span className="font-medium">{formatTime(metrics.summary.avgResponseTimeMs)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Unique IPs</span>
                      <span className="font-medium">{formatNumber(metrics.summary.totalUniqueIps)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No performance data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Hourly Metrics Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Hourly Request Trends
              </CardTitle>
              <CardDescription>
                Request volume and rate limiting over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-80">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : metrics && metrics.metrics.length > 0 ? (
                <HourlyMetricsChart data={metrics.metrics} timeRange={timeRange} />
              ) : (
                <div className="h-80 flex items-center justify-center border rounded-lg bg-muted/50">
                  <p className="text-muted-foreground">No hourly data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Response Time Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Response Time Trends
              </CardTitle>
              <CardDescription>
                Average response time over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-60">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : metrics && metrics.metrics.length > 0 ? (
                <ResponseTimeChart data={metrics.metrics} />
              ) : (
                <div className="h-60 flex items-center justify-center border rounded-lg bg-muted/50">
                  <p className="text-muted-foreground">No response time data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Violations Tab */}
        <TabsContent value="violations" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Violation Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Violation Summary
                </CardTitle>
                <CardDescription>
                  Overview of rate limit violations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : violations ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Violations</span>
                      <span className="font-medium text-red-600">{formatNumber(violations.aggregates.totalViolations)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Affected Users</span>
                      <span className="font-medium">{formatNumber(violations.aggregates.totalAffectedUsers)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Most Violated Feature</span>
                      <span className="font-medium">{violations.aggregates.mostViolatedFeature}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Violation Types</span>
                      <span className="font-medium">{violations.aggregates.violationTypes.length}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No violation data available</p>
                )}
              </CardContent>
            </Card>

            {/* Top Violating Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Top Violating Users
                </CardTitle>
                <CardDescription>
                  Users with the most violations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : topUsers && topUsers.users.length > 0 ? (
                  <div className="space-y-3">
                    {topUsers.users.slice(0, 5).map((user, index) => (
                      <div key={user.userId} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{user.fullName || user.email || 'Unknown User'}</p>
                          <p className="text-xs text-muted-foreground">Violations: {user.totalViolations}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {user.featuresViolated} features
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No top violating users found</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Violations by Feature */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Violations by Feature
                </CardTitle>
                <CardDescription>
                  Breakdown of violations by feature type
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-64">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : violations && violations.summary.length > 0 ? (
                  <div className="h-64 overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Feature</th>
                          <th className="text-left py-2">Type</th>
                          <th className="text-right py-2">Violations</th>
                          <th className="text-right py-2">Affected Users</th>
                          <th className="text-right py-2">Last Seen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {violations.summary.map((violation, index) => (
                          <tr key={index} className="border-b last:border-0">
                            <td className="py-2 font-medium">{violation.featureName}</td>
                            <td className="py-2">
                              <Badge variant="outline" className="text-xs">
                                {violation.violationType}
                              </Badge>
                            </td>
                            <td className="py-2 text-right">{formatNumber(violation.violationCount)}</td>
                            <td className="py-2 text-right">{formatNumber(violation.affectedUsers)}</td>
                            <td className="py-2 text-right text-xs text-muted-foreground">
                              {format(violation.lastSeen, 'MMM dd, HH:mm')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/50">
                    <p className="text-muted-foreground">No violation data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Violations Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Violations Visualization
                </CardTitle>
                <CardDescription>
                  Visual representation of violations by feature
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-64">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : violations && violations.summary.length > 0 ? (
                  <ViolationsByFeatureChart
                    data={violations.summary.map(v => ({
                      featureName: v.featureName,
                      violationCount: v.violationCount,
                      affectedUsers: v.affectedUsers
                    }))}
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/50">
                    <p className="text-muted-foreground">No violation data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Usage Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Usage Overview
                </CardTitle>
                <CardDescription>
                  Overall system usage statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : usage ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Uses</span>
                      <span className="font-medium">{formatNumber(usage.summary.totalUses)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Unique Users</span>
                      <span className="font-medium">{formatNumber(usage.summary.uniqueUsers)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Days Tracked</span>
                      <span className="font-medium">{formatNumber(usage.summary.uniqueDates)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Violations</span>
                      <span className="font-medium text-red-600">{formatNumber(usage.summary.violations)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Violation Rate</span>
                      <span className="font-medium">{formatPercentage(usage.summary.violationRate)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No usage data available</p>
                )}
              </CardContent>
            </Card>

            {/* Usage by Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Usage by Plan
                </CardTitle>
                <CardDescription>
                  How different user plans utilize the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : usage ? (
                  <div className="space-y-3">
                    {Object.entries(usage.usageByPlan).map(([plan, uses]) => (
                      <div key={plan} className="flex justify-between items-center">
                        <span className="capitalize">{plan}</span>
                        <span className="font-medium">{formatNumber(uses)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No plan usage data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Usage by Feature */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Usage by Feature
                </CardTitle>
                <CardDescription>
                  Breakdown of system usage by feature
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-64">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : usage ? (
                  <div className="h-64 overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Feature</th>
                          <th className="text-right py-2">Total Uses</th>
                          <th className="text-right py-2">Users</th>
                          <th className="text-right py-2">Violations</th>
                          <th className="text-right py-2">Violation Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(usage.usageByFeature).map(([feature, data], index) => (
                          <tr key={index} className="border-b last:border-0">
                            <td className="py-2 font-medium capitalize">{feature}</td>
                            <td className="py-2 text-right">{formatNumber(data.total)}</td>
                            <td className="py-2 text-right">{formatNumber(data.users)}</td>
                            <td className="py-2 text-right">{formatNumber(data.violations)}</td>
                            <td className="py-2 text-right">
                              {data.total > 0 ? formatPercentage((data.violations / data.total) * 100) : '0%'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/50">
                    <p className="text-muted-foreground">No usage data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Usage Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Usage Visualization
                </CardTitle>
                <CardDescription>
                  Visual representation of usage by feature
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-64">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : usage ? (
                  <UsageByFeatureChart
                    data={Object.entries(usage.usageByFeature).map(([feature, data]) => ({
                      featureName: feature,
                      totalUses: data.total,
                      violations: data.violations,
                      violationRate: data.total > 0 ? (data.violations / data.total) * 100 : 0
                    }))}
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/50">
                    <p className="text-muted-foreground">No usage data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}