'use client';

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DocumentationMetricsChartProps {
  data: Array<{
    id: string;
    title: string;
    category: string;
    status: 'published' | 'draft' | 'archived';
    lastUpdated: string;
    views: number;
    engagementRate: number;
    feedbackScore: number;
    relatedFAQs: number;
    searchTerms: string[];
  }>;
}

export function DocumentationMetricsChart({ data }: DocumentationMetricsChartProps) {
  // Prepare data for the chart - take top 5 by views
  const chartData = data
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
    .map(item => ({
      name: item.title.substring(0, 15) + (item.title.length > 15 ? '...' : ''),
      views: item.views,
      engagement: item.engagementRate,
      feedback: item.feedbackScore
    }));

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 50,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip 
            formatter={(value, name) => {
              if (name === 'views') return [value, 'Views'];
              if (name === 'engagement') return [`${value}%`, 'Engagement'];
              if (name === 'feedback') return [`${value}/5`, 'Feedback'];
              return [value, name];
            }}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="views" name="Views" fill="#3b82f6" />
          <Bar yAxisId="left" dataKey="engagement" name="Engagement %" fill="#10b981" />
          <Bar yAxisId="right" dataKey="feedback" name="Feedback /5" fill="#8b5cf6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}