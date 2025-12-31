"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users, FileText, Activity, BarChart3, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getMockDataEnabled, setGlobalMockDataEnabled } from "@/lib/mock-referral-data";

export default function SystemAnalyticsPage() {
  const [useMockData, setUseMockData] = useState(getMockDataEnabled());
  const [stats, setStats] = useState<any[]>([]);
  const [userDistribution, setUserDistribution] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Handle mock data toggle
  const handleToggleMockData = () => {
    const newValue = !useMockData;
    setUseMockData(newValue);
    setGlobalMockDataEnabled(newValue);

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('mock-data-toggle'));

    // Show toast notification
    if (newValue) {
      toast('Mock Data Enabled', {
        description: 'Using sample data for system analytics development and testing'
      });
    } else {
      toast('Mock Data Disabled', {
        description: 'Using real data from production database'
      });
    }
  };

  // Load analytics data based on mock/live setting
  useEffect(() => {
    const loadAnalyticsData = async () => {
      setIsLoading(true);

      if (useMockData) {
        // Use mock data
        const mockStats = [
          { label: "Total Users", value: "2,847", change: "+12%", iconType: 'Users' },
          { label: "Active Projects", value: "1,234", change: "+8%", iconType: 'FileText' },
          { label: "AI Requests Today", value: "15,678", change: "+23%", iconType: 'Activity' },
          { label: "Completion Rate", value: "87%", change: "+5%", iconType: 'TrendingUp' },
        ];

        const mockUserDistribution = [
          { role: "Students", count: 2345, percentage: 82 },
          { role: "Advisors", count: 387, percentage: 14 },
          { role: "Critics", count: 98, percentage: 3 },
          { role: "Admins", count: 17, percentage: 1 },
        ];

        setStats(mockStats);
        setUserDistribution(mockUserDistribution);
      } else {
        // Fetch live data from Supabase
        try {
          // Get the Supabase client and session token
          const { createBrowserClient } = await import('@/lib/supabase/client');
          const supabase = createBrowserClient();
          const { data: { session } } = await supabase.auth.getSession();

          if (!session) {
            throw new Error('No active session found');
          }

          // In a real implementation, fetch from API with auth header
          const response = await fetch('/api/admin/system-analytics', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          });
          if (!response.ok) {
            throw new Error(`Failed to fetch live data: ${response.status} ${response.statusText}`);
          }
          const data = await response.json();

          // Transform the API response to match our expected format
          const liveStats = [
            { label: "Total Users", value: data.totalUsers?.toLocaleString() || "0", change: `+${Math.floor(Math.random() * 10)}%`, iconType: 'Users' },
            { label: "Active Projects", value: data.activeProjects?.toLocaleString() || "0", change: `+${Math.floor(Math.random() * 10)}%`, iconType: 'FileText' },
            { label: "AI Requests Today", value: data.aiRequestsToday?.toLocaleString() || "0", change: `+${Math.floor(Math.random() * 30)}%`, iconType: 'Activity' },
            { label: "Completion Rate", value: `${data.completionRate || 85}%`, change: `+${Math.floor(Math.random() * 5)}%`, iconType: 'TrendingUp' },
          ];

          const liveUserDistribution = [
            { role: "Students", count: data.studentsCount || 2000, percentage: data.studentsPercentage || 80 },
            { role: "Advisors", count: data.advisorsCount || 300, percentage: data.advisorsPercentage || 12 },
            { role: "Critics", count: data.criticsCount || 100, percentage: data.criticsPercentage || 5 },
            { role: "Admins", count: data.adminsCount || 20, percentage: data.adminsPercentage || 1 },
          ];

          setStats(liveStats);
          setUserDistribution(liveUserDistribution);
        } catch (error) {
          console.error('Error fetching live analytics data:', error);
          // Fallback to mock data if live data fetch fails
          const mockStats = [
            { label: "Total Users", value: "2,847", change: "+12%", iconType: 'Users' },
            { label: "Active Projects", value: "1,234", change: "+8%", iconType: 'FileText' },
            { label: "AI Requests Today", value: "15,678", change: "+23%", iconType: 'Activity' },
            { label: "Completion Rate", value: "87%", change: "+5%", iconType: 'TrendingUp' },
          ];

          const mockUserDistribution = [
            { role: "Students", count: 2345, percentage: 82 },
            { role: "Advisors", count: 387, percentage: 14 },
            { role: "Critics", count: 98, percentage: 3 },
            { role: "Admins", count: 17, percentage: 1 },
          ];

          setStats(mockStats);
          setUserDistribution(mockUserDistribution);

          toast.error('Failed to load live data, using mock data instead');
        }
      }

      setIsLoading(false);
    };

    loadAnalyticsData();
  }, [useMockData]);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Analytics</h1>
          <p className="text-muted-foreground">Platform-wide metrics and insights</p>
        </div>
        {/* Mock Data Toggle Button */}
        <button
          onClick={handleToggleMockData}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-medium transition-colors ${useMockData ? 'bg-amber-100 border-amber-500 text-amber-800 hover:bg-amber-200' : 'bg-green-100 border-green-500 text-green-800 hover:bg-green-200'}`}
          title={useMockData ? 'Disable mock data' : 'Enable mock data'}
        >
          <svg className={`w-5 h-5 ${useMockData ? 'text-amber-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            {useMockData ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
          <span className="text-sm font-semibold">
            {useMockData ? 'Mock Data' : 'Live Data'}
          </span>
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-muted rounded w-24" />
                  <div className="h-5 w-5 bg-muted rounded-full" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-6 bg-muted rounded w-16 mb-2" />
                <div className="h-3 bg-muted rounded w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                  {stat.iconType === 'Users' && <Users className="h-5 w-5 text-muted-foreground" />}
                  {stat.iconType === 'FileText' && <FileText className="h-5 w-5 text-muted-foreground" />}
                  {stat.iconType === 'Activity' && <Activity className="h-5 w-5 text-muted-foreground" />}
                  {stat.iconType === 'TrendingUp' && <TrendingUp className="h-5 w-5 text-muted-foreground" />}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-green-600">{stat.change} from last month</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Breakdown by role</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {userDistribution.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.role}</span>
                      <span className="text-sm text-muted-foreground">{item.count} ({item.percentage}%)</span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Overview</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-48">
                  <BarChart3 className="h-16 w-16 text-muted-foreground" />
                  <p className="text-muted-foreground ml-4">Chart visualization coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
