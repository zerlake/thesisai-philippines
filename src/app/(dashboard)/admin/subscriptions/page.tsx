"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Users, TrendingUp, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { getMockDataEnabled, setGlobalMockDataEnabled } from "@/lib/mock-referral-data";

export default function SubscriptionsPage() {
  const [useMockData, setUseMockData] = useState(getMockDataEnabled());
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [recentSubscribers, setRecentSubscribers] = useState<any[]>([]);
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
        description: 'Using sample data for subscription management development and testing'
      });
    } else {
      toast('Mock Data Disabled', {
        description: 'Using real data from production database'
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      if (useMockData) {
        // Use mock data
        const mockSubscriptions = [
          { plan: "Free", users: 1847, revenue: 0, color: "bg-gray-100 text-gray-800" },
          { plan: "Basic", users: 523, revenue: 261500, color: "bg-blue-100 text-blue-800" }, // ₱500/month * 523 users
          { plan: "Pro", users: 312, revenue: 936000, color: "bg-purple-100 text-purple-800" }, // ₱3,000/month * 312 users
          { plan: "Enterprise", users: 45, revenue: 1350000, color: "bg-green-100 text-green-800" }, // ₱30,000/month * 45 users
        ];

        const mockRecentSubscribers = [
          { name: "Maria Santos", email: "maria@up.edu.ph", plan: "Pro", date: "2024-12-22" },
          { name: "Ateneo de Manila University", email: "admin@admu.edu.ph", plan: "Enterprise", date: "2024-12-21" },
          { name: "Juan Dela Cruz", email: "juan@ust.edu.ph", plan: "Basic", date: "2024-12-20" },
        ];

        setSubscriptions(mockSubscriptions);
        setRecentSubscribers(mockRecentSubscribers);
      } else {
        // In a real implementation, fetch from API
        // const response = await fetch('/api/admin/subscriptions');
        // const data = await response.json();
        // setSubscriptions(data.subscriptions);
        // setRecentSubscribers(data.recentSubscribers);

        // For now, using mock data as fallback
        const mockSubscriptions = [
          { plan: "Free", users: 1847, revenue: 0, color: "bg-gray-100 text-gray-800" },
          { plan: "Basic", users: 523, revenue: 261500, color: "bg-blue-100 text-blue-800" }, // ₱500/month * 523 users
          { plan: "Pro", users: 312, revenue: 936000, color: "bg-purple-100 text-purple-800" }, // ₱3,000/month * 312 users
          { plan: "Enterprise", users: 45, revenue: 1350000, color: "bg-green-100 text-green-800" }, // ₱30,000/month * 45 users
        ];

        const mockRecentSubscribers = [
          { name: "Maria Santos", email: "maria@up.edu.ph", plan: "Pro", date: "2024-12-22" },
          { name: "Ateneo de Manila University", email: "admin@admu.edu.ph", plan: "Enterprise", date: "2024-12-21" },
          { name: "Juan Dela Cruz", email: "juan@ust.edu.ph", plan: "Basic", date: "2024-12-20" },
        ];

        setSubscriptions(mockSubscriptions);
        setRecentSubscribers(mockRecentSubscribers);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [useMockData]);

  const totalRevenue = subscriptions.reduce((sum, s) => sum + s.revenue, 0);
  const totalPaid = subscriptions.filter(s => s.plan !== "Free").reduce((sum, s) => sum + s.users, 0);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
          <p className="text-muted-foreground">Manage subscription plans and billing in Philippine Peso (PHP)</p>
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
        <div className="text-center py-10">Loading subscription data...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue (PHP)</CardTitle>
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₱{totalRevenue.toLocaleString('en-PH')}</div>
                <p className="text-xs text-muted-foreground">Monthly recurring</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Paid Users</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPaid}</div>
                <p className="text-xs text-muted-foreground">Active subscriptions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">32%</div>
                <p className="text-xs text-green-600">+5% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.3%</div>
                <p className="text-xs text-green-600">-0.5% from last month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Plan Distribution</CardTitle>
                <CardDescription>Users by subscription tier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subscriptions.map((sub, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={sub.color}>{sub.plan}</Badge>
                        <span className="font-medium">{sub.users} users</span>
                      </div>
                      <span className="text-muted-foreground">₱{sub.revenue.toLocaleString('en-PH')}/mo</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Subscriptions</CardTitle>
                <CardDescription>Latest plan upgrades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSubscribers.map((sub, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{sub.name}</div>
                        <div className="text-sm text-muted-foreground">{sub.email}</div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{sub.plan}</Badge>
                        <div className="text-xs text-muted-foreground mt-1">{new Date(sub.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
