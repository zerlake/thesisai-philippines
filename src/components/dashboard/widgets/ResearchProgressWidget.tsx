'use client';

import { TrendingUp } from 'lucide-react';
import type { z } from 'zod';
import type { ResearchProgressSchema } from '@/lib/dashboard/widget-schemas';

type ResearchProgressData = z.infer<typeof ResearchProgressSchema>;

interface ResearchProgressWidgetProps {
  data?: ResearchProgressData;
}

export function ResearchProgressWidget({
  data,
}: ResearchProgressWidgetProps) {
  if (!data) return null;

  const stats = [
    {
      label: 'Papers Read',
      value: data.papersRead,
      icon: '📄',
    },
    {
      label: 'Notes Created',
      value: data.notesCreated,
      icon: '📝',
    },
    {
      label: 'Goals Completed',
      value: `${data.goalsCompleted}/${data.goalsTotal}`,
      icon: '✓',
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Research Progress
        </h3>
        <TrendingUp className="w-5 h-5 text-blue-600" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-3 bg-gray-50 rounded-lg text-center"
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className="text-xl font-semibold text-gray-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Research Accuracy
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {data.researchAccuracy}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${data.researchAccuracy}%` }}
          />
        </div>
      </div>
    </div>
  );
}
