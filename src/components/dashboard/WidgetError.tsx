'use client';

import { AlertTriangle, RotateCw } from 'lucide-react';

interface WidgetErrorProps {
  widgetId: string;
  error: string | Error;
  onRetry: () => void;
}

export function WidgetError({ widgetId, error, onRetry }: WidgetErrorProps) {
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-yellow-900">
            Widget Error
          </h4>
          <p className="text-sm text-yellow-800 mt-1">{errorMessage}</p>
          <button
            onClick={onRetry}
            className="flex items-center gap-1 mt-3 text-sm text-yellow-700 hover:text-yellow-900 font-medium transition-colors"
          >
            <RotateCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}
