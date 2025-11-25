'use client';

import React from 'react';

interface WidgetSkeletonProps {
  count?: number;
  variant?: 'default' | 'large' | 'compact';
}

/**
 * Loading skeleton for widget containers
 * Shows a placeholder while data is being fetched
 */
export function WidgetSkeleton({
  count = 1,
  variant = 'default'
}: WidgetSkeletonProps) {
  const getHeight = () => {
    switch (variant) {
      case 'large':
        return 'h-96';
      case 'compact':
        return 'h-32';
      default:
        return 'h-64';
    }
  };

  const skeletons = Array.from({ length: count }).map((_, i) => (
    <div
      key={i}
      className={`${getHeight()} bg-slate-200 rounded-lg animate-pulse overflow-hidden`}
    >
      <div className="p-4 space-y-3 h-full flex flex-col">
        <div className="h-4 bg-slate-300 rounded w-1/3" />
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-slate-300 rounded" />
          <div className="h-3 bg-slate-300 rounded w-5/6" />
          <div className="h-3 bg-slate-300 rounded w-4/6" />
        </div>
      </div>
    </div>
  ));

  return <>{skeletons}</>;
}

/**
 * Loading skeleton for dashboard grid
 */
export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <WidgetSkeleton count={6} />
    </div>
  );
}

/**
 * Minimal loading indicator for widget updates
 */
export function WidgetLoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-12">
      <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
}
