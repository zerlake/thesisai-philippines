"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, LineChart } from 'recharts';

// Types for our chart data
type HourlyMetricsData = {
  hourStart: string;
  totalRequests: number;
  successfulRequests: number;
  rateLimitedRequests: number;
  status4xx: number;
  status5xx: number;
  avgResponseTimeMs: number;
  uniqueUsers: number;
  uniqueIps: number;
};

type ViolationData = {
  featureName: string;
  violationCount: number;
  affectedUsers: number;
};

type UsageByFeatureData = {
  featureName: string;
  totalUses: number;
  violations: number;
  violationRate: number;
};

// Hourly Metrics Chart Component
export function HourlyMetricsChart({ 
  data, 
  timeRange 
}: { 
  data: HourlyMetricsData[]; 
  timeRange: '24h' | '7d' | '30d' 
}) {
  // Format the time labels based on the time range
  const formatTimeLabel = (timestamp: string) => {
    const date = new Date(timestamp);
    
    if (timeRange === '24h') {
      // For 24h, show hour:minute
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      // For 7d/30d, show date and hour
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' });
    }
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 60,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="hourStart" 
          tick={{ fontSize: 12 }}
          tickFormatter={formatTimeLabel}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis />
        <Tooltip 
          formatter={(value) => [value, 'Requests']}
          labelFormatter={(label) => `Time: ${formatTimeLabel(label)}`}
        />
        <Legend />
        <Bar dataKey="totalRequests" name="Total Requests" fill="#8884d8" />
        <Bar dataKey="successfulRequests" name="Successful Requests" fill="#82ca9d" />
        <Bar dataKey="rateLimitedRequests" name="Rate Limited Requests" fill="#ff8042" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Response Time Chart Component
export function ResponseTimeChart({ 
  data 
}: { 
  data: HourlyMetricsData[] 
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="hourStart" 
          tick={{ fontSize: 12 }}
          tickFormatter={(timestamp) => {
            const date = new Date(timestamp);
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          }}
        />
        <YAxis />
        <Tooltip 
          formatter={(value) => [`${value}ms`, 'Response Time']}
          labelFormatter={(label) => `Time: ${new Date(label).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="avgResponseTimeMs" 
          name="Avg Response Time (ms)" 
          stroke="#ff7300" 
          activeDot={{ r: 8 }} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Violations by Feature Chart Component
export function ViolationsByFeatureChart({ 
  data 
}: { 
  data: ViolationData[] 
}) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        layout="horizontal"
        margin={{
          top: 20,
          right: 30,
          left: 100,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis 
          dataKey="featureName" 
          type="category" 
          width={90}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value) => [value, 'Violations']}
          labelFormatter={(label) => `Feature: ${label}`}
        />
        <Legend />
        <Bar dataKey="violationCount" name="Violation Count" fill="#ff8042" />
        <Bar dataKey="affectedUsers" name="Affected Users" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Usage by Feature Chart Component
export function UsageByFeatureChart({ 
  data 
}: { 
  data: UsageByFeatureData[] 
}) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="featureName" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip 
          formatter={(value, name) => {
            if (name === 'violationRate') {
              return [`${value}%`, 'Violation Rate'];
            }
            return [value, name === 'totalUses' ? 'Total Uses' : 'Violations'];
          }}
        />
        <Legend />
        <Bar yAxisId="left" dataKey="totalUses" name="Total Uses" fill="#8884d8" />
        <Bar yAxisId="left" dataKey="violations" name="Violations" fill="#ff8042" />
        <Line 
          yAxisId="right" 
          type="monotone" 
          dataKey="violationRate" 
          name="Violation Rate (%)" 
          stroke="#ff0000" 
          strokeWidth={2}
          activeDot={{ r: 8 }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}