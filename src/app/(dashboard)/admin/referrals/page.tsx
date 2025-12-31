"use client";

import React from 'react';
import { useReferralPool } from '@/lib/referral-monitor';
import { Card, Metric, Flex, Text } from '@tremor/react';
import { PoolCard } from '@/components/admin/pool-card';
import { ReferralVelocityChart } from '@/components/admin/referral-velocity-chart';
import { FraudSignalsChart } from '@/components/admin/fraud-signals-chart';
import { TopRecruitersChart } from '@/components/admin/top-recruiters-chart';
import { AlertSection } from '@/components/admin/alert-section';
import { useToast, toast } from '@/hooks/use-toast';
import { FraudIdentificationChecklist } from '@/components/admin/fraud-identification-checklist';
import { getFinancialDashboardMetrics } from '@/actions/referral-dashboard-metrics';
import { getFinancialDashboardMetricsMock, getMockDataEnabled, setGlobalMockDataEnabled, getAuditTrailMock } from '@/lib/mock-referral-data';
import type { FinancialDashboardMetrics } from '@/types/referral';

export default function ReferralDashboard() {
  const { poolStatus, loading, error, refetch } = useReferralPool();
  const [useMockData, setUseMockData] = React.useState(getMockDataEnabled());
  const [activeTab, setActiveTab] = React.useState<'overview' | 'pools' | 'payouts' | 'risk' | 'audit' | 'revenue'>('overview');
  const [metrics, setMetrics] = React.useState<FinancialDashboardMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = React.useState(false);
  const [auditTrail, setAuditTrail] = React.useState<any[]>([]);
  const [auditTrailLoading, setAuditTrailLoading] = React.useState(false);

  // Handle mock data toggle
  const handleToggleMockData = () => {
    const newValue = !useMockData;
    setUseMockData(newValue);
    setGlobalMockDataEnabled(newValue);

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('mock-data-toggle'));

    // Reload both metrics and pool status to maintain consistency
    if (newValue) {
      setMetrics(getFinancialDashboardMetricsMock());
      // The useReferralPool hook will automatically update due to the event dispatch
    } else {
      loadRealMetrics();
      refetch(); // Refetch pool status as well
    }

    // Show toast notification
    if (newValue) {
      toast('Mock Data Enabled', {
        description: 'Using sample data for dashboard development and testing'
      });
    } else {
      toast('Mock Data Disabled', {
        description: 'Using real data from production database'
      });
    }
  };

  // Load real metrics from database
  const loadRealMetrics = async () => {
    setMetricsLoading(true);
    try {
      const data = await getFinancialDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
      toast('Error', {
        description: 'Failed to load dashboard metrics: ' + (err as Error).message,
        variant: 'destructive'
      });
    } finally {
      setMetricsLoading(false);
    }
  };

  // Load comprehensive metrics on mount
  React.useEffect(() => {
    async function loadMetrics() {
      setMetricsLoading(true);
      try {
        const data = await getFinancialDashboardMetrics();
        if (data) {
          setMetrics(data);
        } else if (useMockData) {
          console.log('No real metrics available, using mock data');
          setMetrics(getFinancialDashboardMetricsMock());
        } else {
          setMetrics(null);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
        toast('Error', {
          description: 'Failed to load dashboard metrics: ' + (err as Error).message,
          variant: 'destructive'
        });
        // Fall back to mock data on error
        if (useMockData) {
          console.log('Error occurred, using mock data fallback');
          setMetrics(getFinancialDashboardMetricsMock());
        }
      } finally {
        setMetricsLoading(false);
      }
    }
    loadMetrics();
  }, []);

  // Listen for mock data toggle events
  React.useEffect(() => {
    const handleMockDataToggle = () => {
      const enabled = getMockDataEnabled();
      setUseMockData(enabled);

      // Reload metrics based on new mock data setting
      if (enabled) {
        setMetrics(getFinancialDashboardMetricsMock());
      } else {
        loadRealMetrics();
      }
    };

    window.addEventListener('mock-data-toggle', handleMockDataToggle);

    return () => {
      window.removeEventListener('mock-data-toggle', handleMockDataToggle);
    };
  }, []);

  // Load audit trail data
  const loadAuditTrail = async () => {
    setAuditTrailLoading(true);
    try {
      if (useMockData) {
        // Use mock audit trail data
        const mockAuditTrail = await new Promise<any[]>(resolve => {
          setTimeout(() => resolve(getAuditTrailMock()), 500); // Simulate API delay
        });
        setAuditTrail(mockAuditTrail);
        toast.success('Mock audit trail data loaded successfully');
      } else {
        // Fetch real audit trail data from the API
        const response = await fetch('/api/admin/audit-trail?limit=50');
        if (!response.ok) {
          throw new Error(`Failed to fetch audit trail: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        if (result.success) {
          setAuditTrail(result.data);
          toast.success(`Loaded ${result.data.length} audit trail entries`);
        } else {
          throw new Error(result.error || 'Unknown error occurred');
        }
      }
    } catch (err) {
      console.error('Failed to load audit trail:', err);
      toast('Error', {
        description: 'Failed to load audit trail: ' + (err as Error).message,
        variant: 'destructive'
      });
    } finally {
      setAuditTrailLoading(false);
    }
  };

  if (loading || metricsLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">Financial Monitoring Dashboard</h1>
        <div className="text-center py-10">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">Financial Monitoring Dashboard</h1>
        <div className="text-center py-10 text-red-500">
          Error loading dashboard data: {error}
          <button
            onClick={refetch}
            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">Financial Monitoring Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Real-time financial oversight: pool health, payout management, risk monitoring, and audit trail
          </p>
        </div>

        {/* Mock Data Toggle Button - Upper Right */}
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

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-8 border-b pb-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium rounded-t ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('pools')}
          className={`px-4 py-2 font-medium rounded-t ${
            activeTab === 'pools'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Pool Health
        </button>
        <button
          onClick={() => setActiveTab('payouts')}
          className={`px-4 py-2 font-medium rounded-t ${
            activeTab === 'payouts'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Payouts
        </button>
        <button
          onClick={() => setActiveTab('risk')}
          className={`px-4 py-2 font-medium rounded-t ${
            activeTab === 'risk'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Risk & Fraud
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 font-medium rounded-t ${
            activeTab === 'audit'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Audit Trail
        </button>
        <button
          onClick={() => setActiveTab('revenue')}
          className={`px-4 py-2 font-medium rounded-t ${
            activeTab === 'revenue'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Revenue Attribution
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && metrics && (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <Text>Total Revenue</Text>
              <Metric>₱{(metrics.totalRevenue || 0).toLocaleString('en-PH')}</Metric>
            </Card>
            <Card>
              <Text>Total Pool</Text>
              <Metric>₱{(metrics.totalReferralPool || 0).toLocaleString('en-PH')}</Metric>
            </Card>
            <Card>
              <Text>Allocated</Text>
              <Metric>₱{(metrics.allocatedPool || 0).toLocaleString('en-PH')}</Metric>
            </Card>
            <Card>
              <Text>Unallocated</Text>
              <Metric className={metrics.unallocatedPool > 1000 ? 'text-orange-500' : ''}>
                ₱{(metrics.unallocatedPool || 0).toLocaleString('en-PH')}
              </Metric>
            </Card>
            <Card>
              <Text>Total Paid Out</Text>
              <Metric>₱{(metrics.totalPaidOut || 0).toLocaleString('en-PH')}</Metric>
            </Card>
            <Card>
              <Text>Pending Payouts</Text>
              <Metric>
                {metrics.pendingPayouts || 0} (₱{(metrics.payoutStatus?.pendingAmount || 0).toLocaleString('en-PH')})
              </Metric>
            </Card>
            <Card>
              <Text>Avg Referral Value</Text>
              <Metric>₱{(metrics.avgReferralValue || 0).toFixed(2)}</Metric>
            </Card>
            <Card>
              <Text>Fraud Flags</Text>
              <Metric className={metrics.fraudFlagsCount > 0 ? 'text-red-500' : ''}>
                {metrics.fraudFlagsCount || 0}
              </Metric>
            </Card>
            <Card>
              <Text>Active Referrers (30d)</Text>
              <Metric>{metrics.activeReferrers || 0}</Metric>
            </Card>
            <Card>
              <Text>Payout Ratio</Text>
              <Metric>{(metrics.payoutRatio || 0).toFixed(1)}%</Metric>
            </Card>
          </div>

          {/* Top Referrers */}
          {metrics && metrics.topReferrers && metrics.topReferrers.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Top Referrers</h3>
              <div className="mt-4 space-y-2">
                {metrics.topReferrers.slice(0, 5).map((referrer) => (
                  <Flex key={referrer.id} className="items-center justify-between p-3 bg-muted rounded">
                    <div>
                      <Text className="font-medium">{referrer.first_name} {referrer.last_name}</Text>
                      <Text className="text-sm text-muted-foreground">{referrer.email}</Text>
                    </div>
                    <div className="text-right">
                      <Text className="text-sm">{referrer.total_referrals} referrals</Text>
                      <Text className="font-bold text-blue-600">₱{referrer.total_earnings.toLocaleString('en-PH')}</Text>
                    </div>
                  </Flex>
                ))}
              </div>
            </Card>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ReferralVelocityChart />
            <FraudSignalsChart />
          </div>
        </div>
      )}

      {/* Pool Health Tab */}
      {activeTab === 'pools' && metrics && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <Text>Total Revenue</Text>
              <Metric>₱{(metrics.poolHealth?.totalRevenue || 0).toLocaleString('en-PH')}</Metric>
            </Card>
            <Card>
              <Text>Pool Percentage</Text>
              <Metric>{(metrics.poolHealth?.poolPercentage || 0)}%</Metric>
            </Card>
            <Card>
              <Text>Remaining Balance</Text>
              <Metric className={metrics.poolHealth?.remainingBalance > 0 ? 'text-green-600' : 'text-red-600'}>
                ₱{(metrics.poolHealth?.remainingBalance || 0).toLocaleString('en-PH')}
              </Metric>
            </Card>
            <Card>
              <Text>Utilization Rate</Text>
              <Metric className={(metrics.poolHealth?.utilizationRate || 0) > 80 ? 'text-orange-500' : ''}>
                {(metrics.poolHealth?.utilizationRate || 0).toFixed(1)}%
              </Metric>
            </Card>
          </div>

          {/* Pool Allocations */}
          <Card className="p-6">
            <h3 className="font-semibold mb-3">Pool Allocations</h3>
            <div className="mt-6 space-y-4">
              <Flex className="items-center justify-between">
                <Text>Student Pool</Text>
                <div className="text-right">
                  <Text>₱{(metrics.poolHealth?.studentAllocationUsed || 0).toLocaleString('en-PH')} used</Text>
                  <Text className="text-sm text-muted-foreground">
                    of ₱{(metrics.poolHealth?.studentAllocationRemaining || 0).toLocaleString('en-PH')} remaining
                  </Text>
                </div>
              </Flex>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{
                    width: metrics.poolHealth?.studentAllocationRemaining !== undefined && (metrics.poolHealth?.studentAllocationUsed || 0) + (metrics.poolHealth?.studentAllocationRemaining || 0) > 0
                      ? `${(metrics.poolHealth?.studentAllocationUsed || 0) / ((metrics.poolHealth?.studentAllocationUsed || 0) + (metrics.poolHealth?.studentAllocationRemaining || 0)) * 100}%`
                      : '0%'
                  }}
                ></div>
              </div>

              <Flex className="items-center justify-between">
                <Text>Advisor Pool</Text>
                <div className="text-right">
                  <Text>₱{(metrics.poolHealth?.advisorAllocationUsed || 0).toLocaleString('en-PH')} used</Text>
                  <Text className="text-sm text-muted-foreground">
                    of ₱{(metrics.poolHealth?.advisorAllocationRemaining || 0).toLocaleString('en-PH')} remaining
                  </Text>
                </div>
              </Flex>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{
                    width: metrics.poolHealth?.advisorAllocationRemaining !== undefined && (metrics.poolHealth?.advisorAllocationUsed || 0) + (metrics.poolHealth?.advisorAllocationRemaining || 0) > 0
                      ? `${(metrics.poolHealth?.advisorAllocationUsed || 0) / ((metrics.poolHealth?.advisorAllocationUsed || 0) + (metrics.poolHealth?.advisorAllocationRemaining || 0)) * 100}%`
                      : '0%'
                  }}
                ></div>
              </div>

              <Flex className="items-center justify-between">
                <Text>Critic Pool</Text>
                <div className="text-right">
                  <Text>₱{(metrics.poolHealth?.criticAllocationUsed || 0).toLocaleString('en-PH')} used</Text>
                  <Text className="text-sm text-muted-foreground">
                    of ₱{(metrics.poolHealth?.criticAllocationRemaining || 0).toLocaleString('en-PH')} remaining
                  </Text>
                </div>
              </Flex>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-purple-500"
                  style={{
                    width: metrics.poolHealth?.criticAllocationRemaining !== undefined && (metrics.poolHealth?.criticAllocationUsed || 0) + (metrics.poolHealth?.criticAllocationRemaining || 0) > 0
                      ? `${(metrics.poolHealth?.criticAllocationUsed || 0) / ((metrics.poolHealth?.criticAllocationUsed || 0) + (metrics.poolHealth?.criticAllocationRemaining || 0)) * 100}%`
                      : '0%'
                  }}
                ></div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Payouts Tab */}
      {activeTab === 'payouts' && metrics && metrics.payoutStatus && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card>
              <Text>Pending</Text>
              <Metric>{metrics.payoutStatus.pendingCount || 0}</Metric>
              <Text className="text-sm text-muted-foreground mt-2">
                ₱{(metrics.payoutStatus.pendingAmount || 0).toLocaleString('en-PH')}
              </Text>
            </Card>
            <Card>
              <Text>Approved</Text>
              <Metric>{metrics.payoutStatus.approvedCount || 0}</Metric>
              <Text className="text-sm text-muted-foreground mt-2">
                ₱{(metrics.payoutStatus.approvedAmount || 0).toLocaleString('en-PH')}
              </Text>
            </Card>
            <Card>
              <Text>Paid</Text>
              <Metric className="text-green-600">{metrics.payoutStatus.paidCount || 0}</Metric>
              <Text className="text-sm text-muted-foreground mt-2">
                ₱{(metrics.payoutStatus.paidAmount || 0).toLocaleString('en-PH')}
              </Text>
            </Card>
            <Card>
              <Text>Cancelled</Text>
              <Metric className="text-red-500">{metrics.payoutStatus.cancelledCount || 0}</Metric>
              <Text className="text-sm text-muted-foreground mt-2">
                ₱{(metrics.payoutStatus.cancelledAmount || 0).toLocaleString('en-PH')}
              </Text>
            </Card>
            <Card>
              <Text>Total Pending</Text>
              <Metric>₱{(metrics.pendingPayouts || 0).toLocaleString('en-PH')}</Metric>
            </Card>
            <Card>
              <Text>Total Paid Out</Text>
              <Metric>₱{(metrics.totalPaidOut || 0).toLocaleString('en-PH')}</Metric>
            </Card>
          </div>
        </div>
      )}

      {/* Risk & Fraud Tab */}
      {activeTab === 'risk' && metrics && metrics.riskIndicators && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <Text>Total Flags</Text>
              <Metric>{metrics.riskIndicators.totalFlags || 0}</Metric>
            </Card>
            <Card>
              <Text>Critical Flags</Text>
              <Metric className="text-red-600">{metrics.riskIndicators.criticalFlags || 0}</Metric>
            </Card>
            <Card>
              <Text>High Flags</Text>
              <Metric className="text-orange-500">{metrics.riskIndicators.highFlags || 0}</Metric>
            </Card>
            <Card>
              <Text>Recent Fraud (30d)</Text>
              <Metric className="text-red-500">{metrics.riskIndicators.recentFraud || 0}</Metric>
            </Card>
          </div>

          {metrics.riskIndicators.usersUnderReview > 0 && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded">
              <p className="text-sm text-orange-800">
                <strong>Warning:</strong> {metrics.riskIndicators.usersUnderReview} users currently under review for potential fraud
              </p>
            </div>
          )}

          {/* Fraud Identification Checklist */}
          <div className="mt-6">
            <FraudIdentificationChecklist />
          </div>
        </div>
      )}

      {/* Audit Trail Tab */}
      {activeTab === 'audit' && (
        <Card className="p-6">
          <h3 className="font-semibold mb-3">Admin Audit Trail</h3>
          <Text className="text-sm text-muted-foreground mb-4">
            Complete record of all admin financial actions for compliance and accountability
          </Text>
          <div className="flex justify-center mb-6">
            <button
              onClick={loadAuditTrail}
              disabled={auditTrailLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {auditTrailLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              ) : 'Load Recent Activity'}
            </button>
          </div>

          {auditTrail.length > 0 ? (
            <div className="space-y-4">
              {auditTrail.map((audit) => (
                <div key={audit.id} className="border rounded-lg p-4 hover:bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium capitalize">{audit.action.replace('_', ' ')}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(audit.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{audit.details}</p>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Admin: {audit.user_id}</span>
                        <span>User: {audit.target_user_id}</span>
                        <span>IP: {audit.ip_address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {auditTrailLoading
                ? 'Loading audit trail data...'
                : 'No audit trail data loaded yet. Click "Load Recent Activity" to view recent admin actions.'}
            </div>
          )}
        </Card>
      )}

      {/* Revenue Attribution Tab */}
      {activeTab === 'revenue' && (
        <Card className="p-6">
          <h3 className="font-semibold mb-3">Revenue Attribution</h3>
          <Text className="text-sm text-muted-foreground mb-4">
            Track which revenue events fund which referral commissions
          </Text>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-muted rounded">
              <Text className="text-sm">Student Subscriptions</Text>
              <Text className="text-2xl font-bold mt-2">₱{(metrics?.poolHealth?.totalRevenue * 0.4 || 0).toLocaleString('en-PH')}</Text>
            </div>
            <div className="p-4 bg-muted rounded">
              <Text className="text-sm">Advisor Payments</Text>
              <Text className="text-2xl font-bold mt-2">₱{(metrics?.poolHealth?.totalRevenue * 0.35 || 0).toLocaleString('en-PH')}</Text>
            </div>
            <div className="p-4 bg-muted rounded">
              <Text className="text-sm">Critic Payments</Text>
              <Text className="text-2xl font-bold mt-2">₱{(metrics?.poolHealth?.totalRevenue * 0.25 || 0).toLocaleString('en-PH')}</Text>
            </div>
          </div>
          <div className="mt-6">
            <h4 className="font-medium mb-2">Recent Revenue Events</h4>
            <div className="space-y-2">
              <Flex className="p-2 bg-muted rounded">
                <Text>Student Subscription</Text>
                <Text className="font-medium">₱990</Text>
              </Flex>
              <Flex className="p-2 bg-muted rounded">
                <Text>Advisor Payment</Text>
                <Text className="font-medium">₱2,500</Text>
              </Flex>
              <Flex className="p-2 bg-muted rounded">
                <Text>Critic Payment</Text>
                <Text className="font-medium">₱1,800</Text>
              </Flex>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
