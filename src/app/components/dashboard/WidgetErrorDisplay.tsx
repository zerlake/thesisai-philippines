'use client';

import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface WidgetErrorDisplayProps {
  widgetName: string;
  error: string | Error;
  onRetry?: () => void;
  onDismiss?: () => void;
}

/**
 * Error display for individual widgets
 * Shows what went wrong and allows retry/dismiss
 */
export function WidgetErrorDisplay({
  widgetName,
  error,
  onRetry,
  onDismiss
}: WidgetErrorDisplayProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-yellow-900 text-sm">
            {widgetName} couldn't load
          </h4>
          <p className="text-yellow-700 text-xs mt-1 line-clamp-2">
            {errorMessage}
          </p>
          <div className="flex gap-2 mt-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700 hover:text-yellow-900 bg-yellow-100 hover:bg-yellow-200 px-2 py-1 rounded transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Retry
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-xs font-medium text-yellow-600 hover:text-yellow-900 transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Fallback content when widget data fails to load
 */
export function WidgetErrorFallback({ widgetName }: { widgetName: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 text-center">
      <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
      <p className="text-gray-600 text-sm">
        Unable to load {widgetName}
      </p>
      <p className="text-gray-400 text-xs mt-1">
        Please refresh the page or try again later
      </p>
    </div>
  );
}
