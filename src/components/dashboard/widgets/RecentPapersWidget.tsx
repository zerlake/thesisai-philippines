'use client';

import { FileText, ExternalLink, CheckCircle } from 'lucide-react';
import type { z } from 'zod';
import type { RecentPapersSchema } from '@/lib/dashboard/widget-schemas';

type RecentPapersData = z.infer<typeof RecentPapersSchema>;

interface RecentPapersWidgetProps {
  data?: RecentPapersData;
}

const statusColors: Record<string, string> = {
  reading: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  saved: 'bg-gray-100 text-gray-800',
};

export function RecentPapersWidget({ data }: RecentPapersWidgetProps) {
  if (!data || data.papers.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Papers</h3>
        </div>
        <p className="text-sm text-gray-500 text-center py-8">
          No papers yet. Start reading to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Papers
          </h3>
        </div>
        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
          {data.total} total
        </span>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {data.papers.slice(0, 5).map((paper) => (
          <div
            key={paper.id}
            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start gap-3">
              {paper.status === 'completed' && (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              )}
              {paper.status !== 'completed' && (
                <FileText className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {Array.isArray(paper.title) ? (paper.title[0] || 'Untitled') : (paper.title || 'Untitled')}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {paper.authors.slice(0, 2).join(', ')}
                  {paper.authors.length > 2 && ` +${paper.authors.length - 2}`}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      statusColors[paper.status]
                    }`}
                  >
                    {paper.status}
                  </span>
                  {paper.notes > 0 && (
                    <span className="text-xs text-gray-600">
                      {paper.notes} note{paper.notes !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
              {paper.url && (
                <a
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0"
                >
                  <ExternalLink className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 text-center">
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View all papers →
        </button>
      </div>
    </div>
  );
}
