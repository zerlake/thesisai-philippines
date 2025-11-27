'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/lib/personalization/dashboard-state';
import { ErrorBoundary } from './ErrorBoundary';
import { DashboardSkeleton } from './LoadingSkeleton';
import { WidgetError } from './WidgetError';
import { ResearchProgressWidget } from './widgets/ResearchProgressWidget';
import { StatsWidget } from './widgets/StatsWidget';
import { RecentPapersWidget } from './widgets/RecentPapersWidget';
import { WritingGoalsWidget } from './widgets/WritingGoalsWidget';
import { CollaborationWidget } from './widgets/CollaborationWidget';
import { CalendarWidget } from './widgets/CalendarWidget';

export function DashboardPageContent() {
  const store = useDashboardStore();
  const { widgetData, isLoadingAllWidgets } = store;

  useEffect(() => {
    // Load all widgets on mount
    store.loadAllWidgetData([
      'research-progress',
      'stats',
      'recent-papers',
      'writing-goals',
      'collaboration',
      'calendar',
    ]);
  }, [store]);

  if (isLoadingAllWidgets) {
    return <DashboardSkeleton />;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Dashboard header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's your research overview.
          </p>
        </div>

        {/* Widgets grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Research Progress Widget */}
          <ErrorBoundary>
            {widgetData['research-progress']?.error ? (
              <WidgetError
                widgetId="research-progress"
                error={widgetData['research-progress'].error}
                onRetry={() => store.refetchWidget('research-progress')}
              />
            ) : widgetData['research-progress']?.loading ? (
              <div className="bg-white p-6 rounded-lg border border-gray-200 h-64 animate-pulse" />
            ) : widgetData['research-progress']?.data ? (
              <ResearchProgressWidget
                data={widgetData['research-progress'].data as any}
              />
            ) : null}
          </ErrorBoundary>

          {/* Stats Widget */}
          <ErrorBoundary>
            {widgetData['stats']?.error ? (
              <WidgetError
                widgetId="stats"
                error={widgetData['stats'].error}
                onRetry={() => store.refetchWidget('stats')}
              />
            ) : widgetData['stats']?.loading ? (
              <div className="bg-white p-6 rounded-lg border border-gray-200 h-64 animate-pulse" />
            ) : widgetData['stats']?.data ? (
              <StatsWidget data={widgetData['stats'].data as any} />
            ) : null}
          </ErrorBoundary>

          {/* Recent Papers Widget */}
          <ErrorBoundary>
            {widgetData['recent-papers']?.error ? (
              <WidgetError
                widgetId="recent-papers"
                error={widgetData['recent-papers'].error}
                onRetry={() => store.refetchWidget('recent-papers')}
              />
            ) : widgetData['recent-papers']?.loading ? (
              <div className="bg-white p-6 rounded-lg border border-gray-200 h-64 animate-pulse" />
            ) : widgetData['recent-papers']?.data ? (
              <RecentPapersWidget data={widgetData['recent-papers'].data as any} />
            ) : null}
          </ErrorBoundary>

          {/* Writing Goals Widget */}
          <ErrorBoundary>
            {widgetData['writing-goals']?.error ? (
              <WidgetError
                widgetId="writing-goals"
                error={widgetData['writing-goals'].error}
                onRetry={() => store.refetchWidget('writing-goals')}
              />
            ) : widgetData['writing-goals']?.loading ? (
              <div className="bg-white p-6 rounded-lg border border-gray-200 h-64 animate-pulse" />
            ) : widgetData['writing-goals']?.data ? (
              <WritingGoalsWidget data={widgetData['writing-goals'].data as any} />
            ) : null}
          </ErrorBoundary>

          {/* Collaboration Widget */}
          <ErrorBoundary>
            {widgetData['collaboration']?.error ? (
              <WidgetError
                widgetId="collaboration"
                error={widgetData['collaboration'].error}
                onRetry={() => store.refetchWidget('collaboration')}
              />
            ) : widgetData['collaboration']?.loading ? (
              <div className="bg-white p-6 rounded-lg border border-gray-200 h-64 animate-pulse" />
            ) : widgetData['collaboration']?.data ? (
              <CollaborationWidget data={widgetData['collaboration'].data as any} />
            ) : null}
          </ErrorBoundary>

          {/* Calendar Widget */}
          <ErrorBoundary>
            {widgetData['calendar']?.error ? (
              <WidgetError
                widgetId="calendar"
                error={widgetData['calendar'].error}
                onRetry={() => store.refetchWidget('calendar')}
              />
            ) : widgetData['calendar']?.loading ? (
              <div className="bg-white p-6 rounded-lg border border-gray-200 h-64 animate-pulse" />
            ) : widgetData['calendar']?.data ? (
              <CalendarWidget data={widgetData['calendar'].data as any} />
            ) : null}
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  );
}
