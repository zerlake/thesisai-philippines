# Phase 5 Quick Start Guide

## What's New in Phase 5

Phase 5 adds **real data connectivity** to Phase 4's beautiful UI. Widgets now fetch actual data from your database, persist layouts, handle errors gracefully, and provide performance insights.

---

## Core Concepts

### 1. API Integration Layer
Widgets get data from multiple sources:
- **Supabase** - User data, layouts, preferences
- **API Routes** - Next.js API handlers
- **Cache** - Client-side caching with TTL
- **Real-time** - Optional real-time subscriptions

### 2. Data Source Manager
Routes data requests intelligently:
```typescript
// Automatically picks the best source
const data = await dataSourceManager.fetchWidgetData('research-progress');
```

### 3. Widget Data Hooks
React hooks for easy data access:
```typescript
// Single widget
const { data, isLoading, error } = useWidgetData('research-progress');

// Multiple widgets
const { data, isLoading } = useWidgetsData(['research-progress', 'quick-stats']);
```

### 4. Auto-save & Persistence
Layouts are automatically saved:
```typescript
// Just use the dashboard, auto-save handles the rest
const { isDirty, lastSaved } = useDashboardPersistence();
```

### 5. Error Boundaries
Errors in one widget don't break the whole dashboard:
```typescript
<DashboardErrorBoundary>
  <Dashboard />
</DashboardErrorBoundary>
```

---

## Implementation Phases

### Phase 5.1: API Integration (Current)
✅ DataSourceManager - Route data requests  
✅ useWidgetData - Fetch data with hooks  
✅ Widget schemas - Validate data  
✅ API routes - Backend endpoints  
✅ Enhanced store - Async data loading  

### Phase 5.2: Persistence
LayoutPersistenceService - Database saves  
AutosaveManager - Debounced saves  
SyncManager - Multi-device sync  

### Phase 5.3: Error Handling
ErrorBoundary - Isolate failures  
LoadingStates - Show progress  
ErrorRecovery - Retry logic  

### Phase 5.4: Full Integration
Dashboard page - Complete example  
Layout selector - Manage layouts  
Widget integration - Real data demo  

### Phase 5.5: Monitoring
MetricsCollector - Track performance  
Analytics page - View metrics  
PerformanceReporter - Generate reports  

---

## Quick Start Commands

```bash
# Run Phase 5 tests
npm test -- phase-5

# Check TypeScript
npm run type-check

# Build the project
npm run build

# Start development
npm run dev
```

---

## File Locations

### New Files Created This Session
```
src/lib/dashboard/
├── data-source-manager.ts      ← Core data layer
├── widget-schemas.ts            ← Data validation
├── api-error-handler.ts         ← Error handling
└── loading-state-manager.ts     ← Loading state

src/hooks/
├── useWidgetData.ts             ← Data fetching hook
└── useWidgetsData.ts            ← Batch fetching

src/app/api/dashboard/
├── route.ts                     ← Get/save layouts
├── layouts/route.ts             ← List layouts
├── layouts/[id]/route.ts        ← Update layout
└── widgets/[widgetId]/route.ts  ← Get widget data
```

### Updated Files
```
src/lib/personalization/dashboard-state.ts
  + Async data loading actions
  + Widget data state management

src/components/personalization/DashboardCustomizer.tsx
  + Real data integration
  + Loading state display
  + Error boundary integration
```

---

## Example: Using Widget Data

### Step 1: Define Data Shape
```typescript
// src/lib/dashboard/widget-schemas.ts
const ResearchProgressSchema = z.object({
  papersRead: z.number(),
  notesCreated: z.number(),
  weeklyTrend: z.array(z.object({
    date: z.string(),
    value: z.number()
  }))
});
```

### Step 2: Create API Endpoint
```typescript
// src/app/api/dashboard/widgets/research-progress/route.ts
export async function GET(request: Request) {
  const user = await auth.getUser();
  const data = await supabase
    .from('research_progress')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  return Response.json(data);
}
```

### Step 3: Use in Widget
```typescript
function ResearchProgressWidget() {
  const { data, isLoading, error } = useWidgetData('research-progress');
  
  if (isLoading) return <WidgetSkeleton />;
  if (error) return <WidgetError error={error} />;
  
  return (
    <div>
      <h3>Papers Read: {data.papersRead}</h3>
      <Chart data={data.weeklyTrend} />
    </div>
  );
}
```

That's it! The hook handles:
- Fetching data
- Caching results
- Refetching on interval
- Error handling
- Loading states

---

## Testing Phase 5

### Unit Tests
```bash
npm test -- data-source-manager.test.ts
npm test -- widget-schemas.test.ts
npm test -- api-error-handler.test.ts
```

### Integration Tests
```bash
npm test -- dashboard.integration.test.tsx
```

### E2E Tests
```bash
npm test:e2e -- dashboard
```

---

## Performance Tips

### 1. Use Batch Fetching
```typescript
// ❌ Bad - 12 separate requests
widgets.forEach(w => useWidgetData(w.id));

// ✅ Good - 1 batch request
const { data } = useWidgetsData(widgets.map(w => w.id));
```

### 2. Set Appropriate Cache TTLs
```typescript
const { data } = useWidgetData('research-progress', {
  cacheConfig: {
    ttl: 5 * 60 * 1000, // 5 minutes
    strategy: 'cache-first' // Use cache if available
  }
});
```

### 3. Use Selective Subscriptions
```typescript
// Only subscribe to data you need
const { data } = useWidgetData('research-progress', {
  realtime: false // Disable if not needed
});
```

### 4. Lazy Load Widgets
```typescript
// Use IntersectionObserver to load only visible widgets
const { data } = useWidgetData('research-progress', {
  enabled: isVisible // Only fetch when visible
});
```

---

## Common Patterns

### Pattern 1: Widget with Loading & Error
```typescript
function MyWidget({ widgetId }: { widgetId: string }) {
  const { data, isLoading, error } = useWidgetData(widgetId);
  
  return (
    <div>
      {isLoading && <WidgetSkeleton />}
      {error && <WidgetError error={error} />}
      {data && <WidgetContent data={data} />}
    </div>
  );
}
```

### Pattern 2: Multiple Widgets with Batch Fetch
```typescript
function Dashboard({ layoutId }: { layoutId: string }) {
  const layout = getLayout(layoutId);
  const widgetIds = layout.widgets.map(w => w.widgetId);
  
  const { data, isLoading } = useWidgetsData(widgetIds);
  
  return (
    <div>
      {isLoading && <DashboardSkeleton />}
      {layout.widgets.map(w => (
        <Widget key={w.id} data={data[w.widgetId]} />
      ))}
    </div>
  );
}
```

### Pattern 3: Auto-save with Dirty Check
```typescript
function DashboardEditor() {
  const layout = useDashboardStore(s => s.currentLayout);
  const { isDirty, save } = useDashboardPersistence();
  
  useEffect(() => {
    if (isDirty) {
      const timer = setTimeout(() => save(), 2000);
      return () => clearTimeout(timer);
    }
  }, [isDirty, save]);
  
  return <Dashboard />;
}
```

### Pattern 4: Error Recovery with Retry
```typescript
function SmartWidget({ widgetId }: { widgetId: string }) {
  const { data, error, refetch } = useWidgetData(widgetId);
  
  if (error) {
    return (
      <div>
        <p>Error loading widget: {error.message}</p>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }
  
  return <WidgetContent data={data} />;
}
```

---

## Debugging Tips

### 1. Check DataSourceManager State
```typescript
// In browser console
import { dataSourceManager } from '@/lib/dashboard/data-source-manager';
dataSourceManager.getLoadingState();
dataSourceManager.getCacheStats();
```

### 2. Monitor API Calls
```typescript
// Network tab in DevTools
// Look for /api/dashboard/* calls
```

### 3. Check Store State
```typescript
// In browser console
import { useDashboardStore } from '@/lib/personalization/dashboard-state';
const state = useDashboardStore.getState();
console.log(state.widgetData);
console.log(state.widgetErrors);
```

### 4. Validate Data Schemas
```typescript
// In code
import { widgetSchemas } from '@/lib/dashboard/widget-schemas';
const result = widgetSchemas['research-progress'].safeParse(data);
if (!result.success) console.log(result.error);
```

---

## Troubleshooting

### Issue: Widget shows loading forever
**Cause**: Data fetch not completing  
**Solution**:
1. Check browser network tab
2. Check server logs
3. Verify API endpoint exists
4. Check data schema validation

### Issue: Auto-save not working
**Cause**: AutosaveManager not initialized  
**Solution**:
1. Check useDashboardPersistence is called
2. Verify database connection
3. Check browser console for errors

### Issue: Data is stale
**Cause**: Cache TTL too long  
**Solution**:
1. Reduce cache TTL
2. Manual refetch: `await refetch()`
3. Disable cache for real-time data

### Issue: Type errors on widget data
**Cause**: API response doesn't match schema  
**Solution**:
1. Check API response format
2. Update schema to match data
3. Add data transformation

---

## What's Next

After Phase 5.1 completes:
1. Start Phase 5.2 (Database Persistence)
2. Run integration tests
3. Deploy to production
4. Monitor performance
5. Plan Phase 6

---

## Resources

- [Phase 5 Full Plan](./PHASE_5_IMPLEMENTATION_PLAN.md)
- [Phase 4 Documentation](./PHASE_4_FINAL_COMPLETION.md)
- [Widget Registry](./src/lib/personalization/widget-registry.ts)
- [Zustand Store](./src/lib/personalization/dashboard-state.ts)

---

**Last Updated**: November 24, 2024  
**Status**: Phase 5.1 Implementation Starting
