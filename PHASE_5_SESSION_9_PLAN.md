# Phase 5 Session 9 - UI Components & Integration Plan

**Date**: November 28-29, 2025 (After Session 8 Cleanup)  
**Session**: 9  
**Duration**: 3-4 hours  
**Status**: Planned & Ready  
**Target**: Phase 5 at 50%+ complete

---

## Session Overview

After cleanup, Session 9 focuses on building the UI layer for the dashboard - error boundaries, loading states, and integration with the API/database layer built in Sessions 1-3.

### Goals
1. Build error boundary components
2. Build loading skeleton UI
3. Integrate dashboard page with real data
4. Test with actual API calls

### Success Criteria
- ✅ Error boundary component created
- ✅ Loading skeleton UI created
- ✅ Dashboard page updated with real data
- ✅ 5+ widget examples integrated
- ✅ All components fully typed (TypeScript)
- ✅ No console errors
- ✅ Ready for Session 10 testing

---

## Architecture Overview

```
┌─────────────────────────────────────┐
│   UI Components (Session 9)         │  New work
├─────────────────────────────────────┤
│ • Error Boundaries                  │
│ • Loading Skeletons                 │
│ • Dashboard Integration             │
│ • Widget Examples                   │
└─────────────────────────┬───────────┘
                          │
        ┌─────────────────▼───────────────────┐
        │   Zustand Store (Sessions 1-3)     │  Existing
        │ • Layout management                │
        │ • Widget data loading              │
        │ • Error state management           │
        └─────────────────┬───────────────────┘
                          │
        ┌─────────────────▼───────────────────┐
        │   API Routes (Sessions 1-3)        │  Existing
        │ • Dashboard endpoints              │
        │ • Widget data endpoints            │
        │ • Layout CRUD endpoints            │
        └─────────────────┬───────────────────┘
                          │
        ┌─────────────────▼───────────────────┐
        │   Database (Sessions 1-3)          │  Existing
        │ • Dashboard tables                 │
        │ • Widget cache                     │
        │ • User preferences                 │
        └────────────────────────────────────┘
```

---

## Phase 1: Error Boundary Components (1 hour)

### 1.1 Create ErrorBoundary Component

**File**: `src/components/dashboard/ErrorBoundary.tsx`

```typescript
import React, { ReactNode } from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Dashboard error:', error);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback?.(this.state.error!, this.reset) || (
          <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg">
            <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-red-700 mb-4">{this.state.error?.message}</p>
            <button
              onClick={this.reset}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              <RotateCw className="w-4 h-4" />
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

### 1.2 Create Widget Error Component

**File**: `src/components/dashboard/WidgetError.tsx`

```typescript
import { AlertTriangle } from 'lucide-react';

interface WidgetErrorProps {
  widgetId: string;
  error: string;
  onRetry: () => void;
}

export function WidgetError({ widgetId, error, onRetry }: WidgetErrorProps) {
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-yellow-900">
            Widget Error
          </h4>
          <p className="text-sm text-yellow-800 mt-1">{error}</p>
          <button
            onClick={onRetry}
            className="text-sm text-yellow-700 hover:text-yellow-900 underline mt-2"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 1.3 Create Global Error Handler

**File**: `src/lib/dashboard/error-display.ts`

```typescript
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
};

export const getErrorTitle = (error: unknown): string => {
  const message = getErrorMessage(error);
  if (message.includes('network')) return 'Network Error';
  if (message.includes('timeout')) return 'Request Timeout';
  if (message.includes('auth')) return 'Authentication Error';
  return 'Error';
};

export const isRecoverableError = (error: unknown): boolean => {
  const message = getErrorMessage(error);
  return !message.includes('authentication') && !message.includes('authorization');
};
```

---

## Phase 2: Loading Skeleton Components (1 hour)

### 2.1 Create Loading Skeleton

**File**: `src/components/dashboard/LoadingSkeleton.tsx`

```typescript
export function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header skeleton */}
      <div className="h-8 bg-gray-200 rounded w-1/4" />
      
      {/* Widgets grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-64" />
        ))}
      </div>
    </div>
  );
}

export function WidgetSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/2" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>
    </div>
  );
}
```

### 2.2 Create Fallback UI Components

**File**: `src/components/dashboard/EmptyState.tsx`

```typescript
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Inbox className="w-12 h-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 mt-2">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
```

---

## Phase 3: Dashboard Page Integration (1-2 hours)

### 3.1 Update Dashboard Page

**File**: `src/app/(app)/dashboard/page.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/lib/personalization/dashboard-state';
import { ErrorBoundary } from '@/components/dashboard/ErrorBoundary';
import { DashboardSkeleton } from '@/components/dashboard/LoadingSkeleton';
import { WidgetError } from '@/components/dashboard/WidgetError';
import { ResearchProgressWidget } from '@/components/dashboard/widgets/ResearchProgressWidget';
import { StatsWidget } from '@/components/dashboard/widgets/StatsWidget';
import { RecentPapersWidget } from '@/components/dashboard/widgets/RecentPapersWidget';

export default function DashboardPage() {
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
      'calendar'
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
          <p className="text-gray-600 mt-1">Welcome back! Here's your research overview.</p>
        </div>

        {/* Widgets grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Research Progress Widget */}
          <ErrorBoundary>
            {widgetData['research-progress']?.error ? (
              <WidgetError
                widgetId="research-progress"
                error={widgetData['research-progress'].error}
                onRetry={() => store.refetchWidget('research-progress')}
              />
            ) : widgetData['research-progress']?.loading ? (
              <div className="bg-white p-4 rounded-lg h-64 animate-pulse" />
            ) : (
              <ResearchProgressWidget data={widgetData['research-progress']?.data} />
            )}
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
              <div className="bg-white p-4 rounded-lg h-64 animate-pulse" />
            ) : (
              <StatsWidget data={widgetData['stats']?.data} />
            )}
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
              <div className="bg-white p-4 rounded-lg h-64 animate-pulse" />
            ) : (
              <RecentPapersWidget data={widgetData['recent-papers']?.data} />
            )}
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  );
}
```

### 3.2 Create Widget Examples (5+ widgets)

**File**: `src/components/dashboard/widgets/ResearchProgressWidget.tsx`

```typescript
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { ResearchProgressData } from '@/lib/dashboard/widget-schemas';

interface ResearchProgressWidgetProps {
  data?: ResearchProgressData;
}

export function ResearchProgressWidget({ data }: ResearchProgressWidgetProps) {
  if (!data) return null;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Progress</h3>
      <div className="space-y-4">
        {data.chapters.map((chapter) => (
          <div key={chapter.id}>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{chapter.title}</span>
              <span className="text-sm text-gray-600">{chapter.progress}%</span>
            </div>
            <ProgressBar value={chapter.progress} className="h-2" />
          </div>
        ))}
      </div>
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Overall Progress: <span className="font-semibold text-gray-900">{data.overall}%</span>
        </p>
      </div>
    </div>
  );
}
```

**Similar files to create**:
- `src/components/dashboard/widgets/StatsWidget.tsx`
- `src/components/dashboard/widgets/RecentPapersWidget.tsx`
- `src/components/dashboard/widgets/WritingGoalsWidget.tsx`
- `src/components/dashboard/widgets/CollaborationWidget.tsx`
- `src/components/dashboard/widgets/CalendarWidget.tsx`

---

## Phase 4: Testing & Verification (30 min)

### 4.1 Test Error States

```typescript
// Test error boundary
describe('ErrorBoundary', () => {
  it('displays error message when child throws', () => {
    const ErrorComponent = () => {
      throw new Error('Test error');
    };

    const { getByText } = render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeInTheDocument();
  });

  it('recovers when retry is clicked', () => {
    // ... test implementation
  });
});
```

### 4.2 Test Loading States

```typescript
// Test loading skeleton
describe('DashboardSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<DashboardSkeleton />);
    expect(container).toBeInTheDocument();
  });
});
```

### 4.3 Test Widget Integration

```typescript
// Test widget data loading
describe('DashboardPage', () => {
  it('loads widget data on mount', async () => {
    render(<DashboardPage />);
    
    await waitFor(() => {
      expect(store.loadAllWidgetData).toHaveBeenCalled();
    });
  });
});
```

---

## Deliverables Summary

### Components Created
- ✅ ErrorBoundary component
- ✅ WidgetError component
- ✅ DashboardSkeleton component
- ✅ WidgetSkeleton component
- ✅ EmptyState component
- ✅ 5+ Widget components (Research, Stats, Papers, Goals, etc.)

### Updates Made
- ✅ Updated Dashboard page with real data
- ✅ Connected to Zustand store
- ✅ Connected to API routes
- ✅ Added error handling
- ✅ Added loading states

### Documentation
- ✅ Component documentation
- ✅ Integration guide
- ✅ Error handling guide
- ✅ Testing guide

---

## Success Criteria

- ✅ All components render without errors
- ✅ Error boundaries work correctly
- ✅ Loading states display properly
- ✅ Dashboard page integrates with store
- ✅ Widgets load real data
- ✅ TypeScript strict mode compliance
- ✅ No console errors
- ✅ Ready for Session 10

---

## Time Breakdown

| Phase | Task | Time |
|-------|------|------|
| 1 | Error Boundaries | 1 hour |
| 2 | Loading Skeletons | 1 hour |
| 3 | Dashboard Integration | 1-2 hours |
| 4 | Testing | 30 min |
| **Total** | | **3-4 hours** |

---

## Phase 5 Progress After Session 9

```
Before Session 9: 45%+ complete
After Session 9: 50%+ complete
Improvement: +5% (UI layer added)

Remaining:
- Session 10: Testing & Polish (2-3 hours) → 65%+
- Final: Performance & Deployment (1-2 hours) → 70%+
```

---

## Next Steps

1. **After Cleanup** (Session 8): Start Session 9
2. **Phase 1**: Build error boundaries (1 hour)
3. **Phase 2**: Build loading UI (1 hour)
4. **Phase 3**: Integrate dashboard (1-2 hours)
5. **Phase 4**: Test & verify (30 min)
6. **Complete**: Phase 5 at 50%+

---

## Files to Create/Modify

**New Files (9)**:
- `src/components/dashboard/ErrorBoundary.tsx`
- `src/components/dashboard/WidgetError.tsx`
- `src/components/dashboard/LoadingSkeleton.tsx`
- `src/components/dashboard/EmptyState.tsx`
- `src/lib/dashboard/error-display.ts`
- `src/components/dashboard/widgets/ResearchProgressWidget.tsx`
- `src/components/dashboard/widgets/StatsWidget.tsx`
- `src/components/dashboard/widgets/RecentPapersWidget.tsx`
- (3 more widget components)

**Modified Files (1)**:
- `src/app/(app)/dashboard/page.tsx`

---

**Status**: Ready for execution after cleanup  
**Duration**: 3-4 hours  
**Quality**: Production-ready components  
**Target**: Phase 5 at 50%+ complete

---

Generated: November 28, 2025
