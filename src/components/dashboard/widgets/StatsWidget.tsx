'use client';

import { BarChart3 } from 'lucide-react';
import type { z } from 'zod';
import type { StatsWidgetSchema } from '@/lib/dashboard/widget-schemas';

type StatsData = z.infer<typeof StatsWidgetSchema>;

interface StatsWidgetProps {
  data?: StatsData;
}

export function StatsWidget({ data }: StatsWidgetProps) {
  if (!data) return null;

  const defaultStats = [
    {
      label: 'Total Papers',
      value: data.totalPapers,
      icon: '📚',
    },
    {
      label: 'Total Notes',
      value: data.totalNotes,
      icon: '🗒️',
    },
    {
      label: 'Total Words',
      value: data.totalWords.toLocaleString(),
      icon: '✍️',
    },
    {
      label: 'Read Time',
      value: `${Math.round(data.totalReadTime / 60)}h`,
      icon: '⏱️',
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Statistics</h3>
        <BarChart3 className="w-5 h-5 text-green-600" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {defaultStats.map((stat) => (
          <div
            key={stat.label}
            className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg"
          >
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl">{stat.icon}</span>
              <p className="text-xl font-semibold text-gray-900">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {data.lastUpdated && (
        <p className="text-xs text-gray-500 mt-4 text-center">
          Last updated {new Date(data.lastUpdated).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
