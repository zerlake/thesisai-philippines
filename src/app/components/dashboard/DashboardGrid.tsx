'use client';

import React, { ReactNode } from 'react';

interface DashboardGridProps {
  children: ReactNode;
  columns?: 'auto' | 1 | 2 | 3 | 4;
  gap?: 'small' | 'medium' | 'large';
}

/**
 * Responsive grid layout for dashboard widgets
 * Adjusts column count based on screen size
 */
export function DashboardGrid({
  children,
  columns = 'auto',
  gap = 'medium'
}: DashboardGridProps) {
  const gapClass = {
    small: 'gap-2',
    medium: 'gap-4',
    large: 'gap-6'
  }[gap];

  const gridClass = columns === 'auto'
    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    : `grid-cols-${columns}`;

  return (
    <div className={`grid ${gridClass} ${gapClass}`}>
      {children}
    </div>
  );
}

/**
 * Wrapper for individual widget containers
 */
export function WidgetContainer({
  children,
  className = ''
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Widget header with title and actions
 */
export function WidgetHeader({
  title,
  subtitle,
  actions,
  className = ''
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`border-b border-gray-100 px-6 py-4 flex items-start justify-between ${className}`}>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2 ml-4">{actions}</div>}
    </div>
  );
}

/**
 * Widget content area
 */
export function WidgetContent({
  children,
  className = ''
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}
