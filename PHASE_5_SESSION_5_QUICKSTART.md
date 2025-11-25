# Phase 5 Session 5: Quick Start Guide

**Status**: UI Components Complete & Dashboard Page Ready  
**Time**: ~5-10 minutes to get running

---

## What Was Built

### 7 New Files (Session 5)
1. ✅ DashboardErrorBoundary.tsx - Error catching
2. ✅ WidgetSkeleton.tsx - Loading placeholders
3. ✅ WidgetErrorDisplay.tsx - Error UI
4. ✅ DashboardGrid.tsx - Responsive layout
5. ✅ DashboardMetrics.tsx - Performance display
6. ✅ dashboard/page.tsx - Main dashboard
7. ✅ performance-monitor.ts - Metrics tracking

### Key Features
- Error boundaries prevent app crashes
- Loading skeletons prevent layout shift
- Widget-level error handling
- Responsive grid layout
- Performance monitoring built-in
- Full TypeScript support

---

## Quick Start (2 minutes)

### 1. View Dashboard
```bash
npm run dev
# Open http://localhost:3000/dashboard
```

### 2. Check for Errors
```bash
npm run build
npm run type-check
npm run lint
```

### 3. View Performance Metrics
```typescript
// In browser console:
import { performanceMonitor } from '@/lib/dashboard/performance-monitor'
console.log(performanceMonitor.getSummary())
```

---

## File Structure

```
src/app/
├── dashboard/
│   └── page.tsx                    ← Main dashboard page
└── components/
    └── dashboard/
        ├── DashboardErrorBoundary.tsx
        ├── WidgetSkeleton.tsx
        ├── WidgetErrorDisplay.tsx
        ├── DashboardGrid.tsx
        ├── DashboardMetrics.tsx
        └── index.ts

src/lib/dashboard/
└── performance-monitor.ts          ← Performance tracking
```

---

## Component Usage

### Basic Import
```typescript
import {
  DashboardErrorBoundary,
  DashboardGrid,
  WidgetSkeleton,
  WidgetErrorDisplay
} from '@/app/components/dashboard';
```

### Using Error Boundary
```tsx
<DashboardErrorBoundary>
  <MyComponent />
</DashboardErrorBoundary>
```

### Using Grid Layout
```tsx
<DashboardGrid columns="auto" gap="medium">
  <Widget1 />
  <Widget2 />
  <Widget3 />
</DashboardGrid>
```

### Using Skeletons
```tsx
{isLoading ? <DashboardSkeleton /> : <Dashboard />}
{isLoading && <WidgetLoadingSpinner />}
```

### Handling Errors
```tsx
{error && (
  <WidgetErrorDisplay
    widgetName="My Widget"
    error={error}
    onRetry={() => refetch()}
  />
)}
```

---

## Dashboard Page Features

### What It Does
- Loads from `useDashboardStore()`
- Maps over widget IDs
- Renders each widget with full error handling
- Shows loading placeholders
- Displays header with layout info
- Responsive on all screen sizes

### How It Works
```
1. Page mounts → Check hydration
2. Load current layout → Get widget IDs
3. Trigger widget data loads → Batch fetch
4. Render grid → Map widget IDs
5. For each widget:
   - Show spinner while loading
   - Display error if failed
   - Show data when ready
```

---

## Testing the Dashboard

### Manual Testing Checklist
- [ ] Dashboard page loads without errors
- [ ] Loading skeletons appear
- [ ] Widgets load and display data
- [ ] Widget errors show with retry
- [ ] Empty state appears when no widgets
- [ ] Header shows correct layout name
- [ ] Responsive on mobile/tablet/desktop

### Checking Browser Console
```javascript
// Should see no errors
// Performance metrics available
const metrics = window.__performanceMonitor?.getSummary?.()
console.log(metrics)
```

---

## Performance Monitoring

### Automatic Tracking
- Widget load times
- API call durations
- Cache hit rates
- Slow component detection

### Access Metrics
```typescript
import { performanceMonitor } from '@/lib/dashboard/performance-monitor'

// Get summary
const summary = performanceMonitor.getSummary()
console.log({
  totalRequests: summary.totalRequests,
  avgLoadTime: `${summary.avgLoadTime}ms`,
  cacheHitRate: `${(summary.cacheHitRate * 100).toFixed(1)}%`,
  avgApiTime: `${summary.avgApiTime}ms`
})

// Get widget average
const widgetAvg = performanceMonitor.getAverageLoadTime('research-progress')
console.log(`research-progress: ${widgetAvg}ms`)

// Get cache hit rate
const cacheRate = performanceMonitor.getCacheHitRate()
console.log(`Cache effectiveness: ${(cacheRate * 100).toFixed(1)}%`)
```

---

## Common Tasks

### Add New Component
```typescript
// 1. Create file in src/app/components/dashboard/
// 2. Add export to index.ts
// 3. Import where needed

export { MyComponent } from './MyComponent';
```

### Use Dashboard in Route
```tsx
import { DashboardPage } from '@/app/dashboard/page';

export default function Page() {
  return <DashboardPage />;
}
```

### Track Performance
```typescript
import { performanceMonitor, trackedFetch } from '@/lib/dashboard/performance-monitor'

// Automatic tracking
const response = await trackedFetch('/api/dashboard/widgets/research-progress')

// Manual tracking
const start = performance.now()
const data = await fetchData()
const duration = performance.now() - start
performanceMonitor.recordWidgetMetric('my-widget', duration, renderTime)
```

---

## Troubleshooting

### Dashboard Page Blank
- Check browser console for errors
- Verify `useDashboardStore()` has widgets
- Check if layout is hydrated correctly

### Widgets Not Loading
- Check API endpoints in `/api/dashboard/`
- Verify authentication tokens
- Check network tab for failed requests

### Errors Not Showing
- Check error boundary is wrapping component
- Verify error is being passed to store
- Check console for uncaught errors

### Poor Performance
- Check `performanceMonitor.getSummary()`
- Look for slow widgets (>3s load)
- Check cache hit rate (should be high after initial load)
- Review API call durations (should be <5s)

---

## Next Steps

### Immediate (Today)
- [x] Run `npm run dev`
- [x] Navigate to `/dashboard`
- [x] Verify page loads
- [x] Check for errors in console

### Short Term (Next Session)
- [ ] Add real-time widget updates
- [ ] Implement WebSocket support
- [ ] Add offline support
- [ ] Test performance under load

### Medium Term (Sessions 7-8)
- [ ] Add drag-and-drop reordering
- [ ] Widget customization UI
- [ ] Layout persistence
- [ ] Mobile optimization

---

## Files to Review

### Before Starting
1. `PHASE_5_SESSION_5_START.md` - Full session documentation
2. `PHASE_5_IMPLEMENTATION_SUMMARY.md` - Architecture overview
3. `src/lib/personalization/dashboard-state.ts` - Store implementation

### Dashboard Components
1. `src/app/dashboard/page.tsx` - Main page
2. `src/app/components/dashboard/DashboardErrorBoundary.tsx` - Error handling
3. `src/app/components/dashboard/WidgetSkeleton.tsx` - Loading UI

---

## Quick Commands

```bash
# Development
npm run dev                    # Start dev server

# Building
npm run build                  # Build for production
npm run type-check             # Check TypeScript
npm run lint                   # Lint code

# Testing (when implemented)
npm run test                   # Run tests
npm run test:coverage          # Coverage report

# Dashboard
# Navigate to: http://localhost:3000/dashboard
```

---

## Success Criteria

✅ **Session 5 Complete** when:
1. Dashboard page loads without errors
2. Error boundaries catch errors
3. Loading skeletons appear
4. Widgets load and display data
5. Performance metrics available
6. No TypeScript errors
7. No console warnings

---

## Performance Targets

### Expected Metrics
- Widget load: 200-500ms (cached)
- API response: 100-300ms
- Cache hit rate: 70%+
- First contentful paint: <2s

### Monitor These
```typescript
const metrics = performanceMonitor.getSummary()
metrics.avgLoadTime       // Should be < 500ms
metrics.cacheHitRate      // Should be > 0.7
metrics.avgApiTime        // Should be < 300ms
```

---

## Support & Questions

### Check These Files
- `PHASE_5_SESSION_5_START.md` - Full documentation
- Component JSDoc comments - Usage patterns
- `src/app/dashboard/page.tsx` - Complete example
- Test files (next session) - Expected behavior

### Common Patterns
- Error handling: WidgetErrorDisplay
- Loading states: WidgetSkeleton + WidgetLoadingSpinner
- Layout: DashboardGrid + WidgetContainer
- Performance: performanceMonitor API

---

**Status**: ✅ Session 5 UI Components Complete

**Next**: Run tests, then implement real-time updates (Session 6)

**Timeline**: 50% of Phase 5 complete (45% → 50%)
