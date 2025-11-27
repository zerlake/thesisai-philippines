'use client';

import { Target, CheckCircle2 } from 'lucide-react';
import type { z } from 'zod';
import type { WritingGoalsSchema } from '@/lib/dashboard/widget-schemas';

type WritingGoalsData = z.infer<typeof WritingGoalsSchema>;

interface WritingGoalsWidgetProps {
  data?: WritingGoalsData;
}

const priorityColors: Record<string, string> = {
  low: 'border-gray-300 bg-gray-50',
  medium: 'border-blue-300 bg-blue-50',
  high: 'border-red-300 bg-red-50',
};

export function WritingGoalsWidget({ data }: WritingGoalsWidgetProps) {
  if (!data) return null;

  const activeGoals = data.goals.filter((g) => g.status === 'active');

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Writing Goals</h3>
        </div>
        <div className="text-sm font-medium text-gray-600">
          {data.completedGoals} of {data.totalGoals}
        </div>
      </div>

      <div className="mb-4 space-y-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-orange-600 h-2 rounded-full transition-all"
            style={{
              width: `${
                data.totalGoals > 0
                  ? (data.completedGoals / data.totalGoals) * 100
                  : 0
              }%`,
            }}
          />
        </div>
        <p className="text-xs text-gray-600 text-right">
          {Math.round(
            data.totalGoals > 0 ? (data.completedGoals / data.totalGoals) * 100 : 0
          )}
          % complete
        </p>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {activeGoals.length > 0 ? (
          activeGoals.map((goal) => (
            <div
              key={goal.id}
              className={`p-3 border rounded-lg ${priorityColors[goal.priority]}`}
            >
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {goal.title}
                  </p>
                  {goal.targetWords && (
                    <div className="mt-2 w-full bg-gray-300 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all"
                        style={{
                          width: `${
                            (goal.currentWords / goal.targetWords) * 100
                          }%`,
                        }}
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-600">
                      {goal.currentWords}{goal.targetWords && `/${goal.targetWords}`} words
                    </span>
                    <span className="text-xs font-medium text-gray-700">
                      {goal.progress}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center py-6">
            No active goals. Create one to get started!
          </p>
        )}
      </div>
    </div>
  );
}
