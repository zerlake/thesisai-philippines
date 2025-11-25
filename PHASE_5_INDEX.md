# Phase 5: Dashboard Integration & Real Data
## Complete Index & Navigation Guide

**Phase Status**: 🟡 In Progress (Foundation Complete)  
**Overall Completion**: 10-15% (Foundation files created)  
**Session**: November 24, 2024

---

## 📚 Essential Reading Order

### For Quick Understanding (15 min)
1. **[PHASE_5_QUICKSTART.md](./PHASE_5_QUICKSTART.md)** - Core concepts and quick patterns

### For Complete Understanding (45 min)
1. Start: [PHASE_5_QUICKSTART.md](./PHASE_5_QUICKSTART.md)
2. Then: [PHASE_5_IMPLEMENTATION_PLAN.md](./PHASE_5_IMPLEMENTATION_PLAN.md)
3. Details: [PHASE_5_SESSION_1_SUMMARY.md](./PHASE_5_SESSION_1_SUMMARY.md)

### For Implementation (ongoing)
- Reference: [PHASE_5_IMPLEMENTATION_PLAN.md](./PHASE_5_IMPLEMENTATION_PLAN.md) - Full specifications
- Track: [PHASE_5_SESSION_1_SUMMARY.md](./PHASE_5_SESSION_1_SUMMARY.md) - What's done
- Code: Files in `src/lib/dashboard/` and `src/hooks/`

---

## 📊 Phase 5 Structure

### Track 1: API Integration (Priority 1) - IN PROGRESS
**Goal**: Connect widgets to real data sources

**Status**: 30% (Foundation complete)

Files Created:
- ✅ `src/lib/dashboard/widget-schemas.ts` - Data validation
- ✅ `src/lib/dashboard/api-error-handler.ts` - Error handling
- ✅ `src/lib/dashboard/data-source-manager.ts` - Data routing
- ✅ `src/hooks/useWidgetData.ts` - React hooks

Files Needed:
- 🔲 `src/app/api/dashboard/widgets/[widgetId]/route.ts` - Get widget data
- 🔲 `src/app/api/dashboard/widgets/batch/route.ts` - Batch fetch
- 🔲 `src/app/api/dashboard/layouts/route.ts` - Layout endpoints
- 🔲 Zustand store enhancements
- 🔲 Database migrations
- 🔲 Unit tests (70+ cases)

### Track 2: Database Persistence (Priority 2) - NOT STARTED
**Goal**: Save/load custom layouts persistently

Files Needed:
- 🔲 `src/lib/dashboard/layout-persistence.ts`
- 🔲 `src/lib/dashboard/autosave-manager.ts`
- 🔲 `src/lib/dashboard/sync-manager.ts`
- 🔲 `src/hooks/useDashboardPersistence.ts`
- 🔲 UI components for persistence
- 🔲 Integration tests (30+ cases)

### Track 3: Error Handling & Loading (Priority 3) - NOT STARTED
**Goal**: Robust error feedback and loading states

Files Needed:
- 🔲 `src/components/dashboard/DashboardErrorBoundary.tsx`
- 🔲 `src/lib/dashboard/loading-state-manager.ts`
- 🔲 `src/components/dashboard/WidgetSkeleton.tsx`
- 🔲 `src/components/dashboard/WidgetError.tsx`
- 🔲 Hook enhancements
- 🔲 Tests (25+ cases)

### Track 4: Full Integration (Priority 4) - NOT STARTED
**Goal**: Complete dashboard page demonstrating all features

Files Needed:
- 🔲 `src/app/dashboard/page.tsx`
- 🔲 `src/components/dashboard/LayoutSelector.tsx`
- 🔲 Widget-to-data integration examples
- 🔲 Integration tests (20+ cases)
- 🔲 E2E tests (15+ cases)

### Track 5: Performance Monitoring (Priority 5) - NOT STARTED
**Goal**: Monitor and report dashboard performance

Files Needed:
- 🔲 `src/lib/dashboard/metrics-collector.ts`
- 🔲 `src/hooks/useDashboardMonitoring.ts`
- 🔲 `src/app/dashboard/analytics/page.tsx`
- 🔲 Sentry integration
- 🔲 Tests (20+ cases)

---

## 🎯 Implementation Checklist

### Phase 5.1: API Integration Layer
- [x] Create widget schemas with validation
- [x] Build API error handler
- [x] Implement DataSourceManager
- [x] Create useWidgetData hooks
- [ ] Create API routes for widgets
- [ ] Create batch API endpoint
- [ ] Create dashboard layout API routes
- [ ] Add database migrations
- [ ] Update Zustand store
- [ ] Write comprehensive tests

**Subtasks**: 15  
**Completed**: 4  
**In Progress**: 6  
**Remaining**: 5

### Phase 5.2: Database Persistence
- [ ] Create LayoutPersistenceService
- [ ] Build AutosaveManager
- [ ] Implement DashboardSyncManager
- [ ] Create persistence hooks
- [ ] Build UI components
- [ ] Write integration tests

**Subtasks**: 6  
**Completed**: 0  
**Remaining**: 6

### Phase 5.3: Error Handling & Loading
- [ ] Create ErrorBoundary component
- [ ] Build LoadingStateManager
- [ ] Create WidgetSkeleton
- [ ] Create WidgetError component
- [ ] Enhance error handlers
- [ ] Write tests

**Subtasks**: 6  
**Completed**: 0  
**Remaining**: 6

### Phase 5.4: Full Integration
- [ ] Create dashboard page
- [ ] Build layout selector
- [ ] Integrate widget data
- [ ] Test full workflow
- [ ] Write E2E tests

**Subtasks**: 5  
**Completed**: 0  
**Remaining**: 5

### Phase 5.5: Performance Monitoring
- [ ] Create metrics collector
- [ ] Build analytics dashboard
- [ ] Setup Sentry integration
- [ ] Create performance reporter
- [ ] Write tests

**Subtasks**: 5  
**Completed**: 0  
**Remaining**: 5

---

## 📁 File Reference

### Data Layer (`src/lib/dashboard/`)
```
widget-schemas.ts              [✅ CREATED]
├─ ResearchProgressSchema
├─ StatsWidgetSchema
├─ RecentPapersSchema
├─ WritingGoalsSchema
├─ CollaborationWidgetSchema
├─ CalendarWidgetSchema
├─ TrendsWidgetSchema
├─ NotesWidgetSchema
├─ CitationWidgetSchema
├─ SuggestionsWidgetSchema
├─ TimeTrackerWidgetSchema
├─ CustomWidgetSchema
└─ Utilities: validate, getMock, getSchema

api-error-handler.ts           [✅ CREATED]
├─ DashboardApiErrorHandler class
├─ Error handling for 8+ types
├─ Recovery suggestions
├─ Error logging
└─ Monitoring integration

data-source-manager.ts         [✅ CREATED]
├─ DataSourceManager class
├─ Fetch single widget data
├─ Batch fetch multiple
├─ Cache management
├─ Real-time subscriptions
└─ Loading state tracking

[Future] layout-persistence.ts  [⏳ PHASE 5.2]
[Future] autosave-manager.ts    [⏳ PHASE 5.2]
[Future] sync-manager.ts        [⏳ PHASE 5.2]
[Future] loading-state-manager.ts [⏳ PHASE 5.3]
```

### Hooks (`src/hooks/`)
```
useWidgetData.ts               [✅ CREATED]
├─ useWidgetData()              Single widget
├─ useWidgetsData()             Multiple widgets
├─ useComputedWidgetData()      Derived data
└─ useWidgetDataWithPolling()   With retry logic

[Future] useDashboardPersistence.ts [⏳ PHASE 5.2]
[Future] useLayoutLibrary.ts        [⏳ PHASE 5.2]
[Future] useDashboardMonitoring.ts  [⏳ PHASE 5.5]
```

### API Routes (`src/app/api/dashboard/`)
```
[Future] /route.ts                         [⏳ PHASE 5.1]
[Future] /layouts/route.ts                 [⏳ PHASE 5.1]
[Future] /layouts/[id]/route.ts            [⏳ PHASE 5.1]
[Future] /widgets/[widgetId]/route.ts      [⏳ PHASE 5.1]
[Future] /widgets/batch/route.ts           [⏳ PHASE 5.1]
[Future] /metrics/route.ts                 [⏳ PHASE 5.5]
```

### Components (`src/components/dashboard/`)
```
[Future] DashboardErrorBoundary.tsx     [⏳ PHASE 5.3]
[Future] WidgetSkeleton.tsx             [⏳ PHASE 5.3]
[Future] WidgetError.tsx                [⏳ PHASE 5.3]
[Future] LayoutSelector.tsx             [⏳ PHASE 5.4]
[Future] SaveStatusIndicator.tsx        [⏳ PHASE 5.2]
[Future] LayoutLibraryModal.tsx         [⏳ PHASE 5.2]
```

### Pages
```
[Future] src/app/dashboard/page.tsx                    [⏳ PHASE 5.4]
[Future] src/app/dashboard/analytics/page.tsx         [⏳ PHASE 5.5]
[Future] src/app/dashboard/settings/page.tsx          [⏳ PHASE 5.2]
```

### Database
```
[Future] supabase/migrations/20241124_dashboard_tables.sql [⏳ PHASE 5.1]
```

### Tests
```
[Future] __tests__/lib/data-source-manager.test.ts     [⏳ PHASE 5.1]
[Future] __tests__/hooks/useWidgetData.test.ts         [⏳ PHASE 5.1]
[Future] __tests__/lib/api-error-handler.test.ts       [⏳ PHASE 5.1]
[Future] __tests__/integration/dashboard.integration.test.tsx [⏳ PHASE 5.4]
```

---

## 🔄 Data Flow Diagram

```
User Component
    ↓
useWidgetData('research-progress')
    ↓
DataSourceManager.fetchWidgetData()
    ├─ Check cache → Return if valid
    ├─ Check network → Fetch from API
    └─ Validate with schema
    ↓
API Route: /api/dashboard/widgets/research-progress
    ↓
Supabase Client
    ↓
Database Query
    ↓
Response Validation
    ├─ Valid → Cache + Return
    └─ Invalid → Mock Data + Return
    ↓
React State Update
    ↓
Component Re-render
```

---

## 🚀 Getting Started

### Step 1: Understand Phase 5 (15 min)
Read: [PHASE_5_QUICKSTART.md](./PHASE_5_QUICKSTART.md)

### Step 2: Create API Routes (2-3 hours)
Follow: [PHASE_5_IMPLEMENTATION_PLAN.md](./PHASE_5_IMPLEMENTATION_PLAN.md) Track 1 section

### Step 3: Setup Database (1 hour)
Run migrations and create tables

### Step 4: Update Zustand Store (1 hour)
Add async data loading actions

### Step 5: Write Tests (2-3 hours)
Create comprehensive test suites

### Step 6: Integrate Components (1-2 hours)
Connect widgets to data hooks

---

## 💡 Key Concepts

### 1. Widget Schemas
Define what data looks like + validation
```typescript
const schema = ResearchProgressSchema;
const result = schema.safeParse(apiData);
```

### 2. Data Source Manager
Intelligent routing of data requests
```typescript
const data = await dataSourceManager.fetchWidgetData('research-progress');
```

### 3. useWidgetData Hook
Easy access to widget data in React
```typescript
const { data, isLoading, error } = useWidgetData('research-progress');
```

### 4. Error Handling
Comprehensive error management
```typescript
const message = errorHandler.handleError(statusCode, error);
```

### 5. Caching
Smart caching strategies
```typescript
cache: { ttl: 5min, strategy: 'cache-first' }
```

---

## 📈 Progress Tracking

### Overall Phase 5
```
0%     20%    40%    60%    80%    100%
|------|------|------|------|------|
█████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
15% (Foundation complete)
```

### Track 1 (API Integration)
```
0%     25%    50%    75%    100%
|------|------|------|------|
████░░░░░░░░░░░░░░░░░░░░░░░░░░
30% (Schema, error, manager, hooks done)
```

### Track 2 (Persistence)
```
0%     25%    50%    75%    100%
|------|------|------|------|
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
0% (Not started)
```

### Track 3 (Error Handling)
```
0%     25%    50%    75%    100%
|------|------|------|------|
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
0% (Not started)
```

### Track 4 (Full Integration)
```
0%     25%    50%    75%    100%
|------|------|------|------|
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
0% (Not started)
```

### Track 5 (Monitoring)
```
0%     25%    50%    75%    100%
|------|------|------|------|
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
0% (Not started)
```

---

## 🎓 Learning Path

### Beginner
1. Read PHASE_5_QUICKSTART.md
2. Understand useWidgetData hook
3. Look at widget-schemas.ts
4. Try using hook in a component

### Intermediate
1. Study DataSourceManager
2. Learn error handling
3. Understand caching strategies
4. Read implementation plan Track 1

### Advanced
1. Study all 5 tracks
2. Understand full architecture
3. Plan optimizations
4. Contribute improvements

---

## 🔗 Related Documentation

### Previous Phases
- [Phase 4 Documentation](./PHASE_4_FINAL_COMPLETION.md) - UI Foundation
- [Phase 3 Documentation](./PERSONALIZATION_SYSTEM_OVERVIEW.md) - Personalization
- [Baseline Documentation](./README.md) - Project Overview

### Current Phase
- [Full Implementation Plan](./PHASE_5_IMPLEMENTATION_PLAN.md) - Complete specs
- [Quick Start Guide](./PHASE_5_QUICKSTART.md) - Quick reference
- [Session 1 Summary](./PHASE_5_SESSION_1_SUMMARY.md) - What's done

### Implementation Guides
- [Widget Schema Reference](./src/lib/dashboard/widget-schemas.ts) - Data shapes
- [Error Handler Usage](./src/lib/dashboard/api-error-handler.ts) - Error handling
- [Data Source Manager Guide](./src/lib/dashboard/data-source-manager.ts) - Data routing
- [useWidgetData Examples](./src/hooks/useWidgetData.ts) - Hook usage

---

## ❓ FAQ

**Q: Where do I start?**  
A: Read PHASE_5_QUICKSTART.md, then look at created files

**Q: How are widgets connected to data?**  
A: Through useWidgetData hook → DataSourceManager → API routes → Database

**Q: How do I add a new widget?**  
A: Create schema in widget-schemas.ts, add endpoint config, implement API route

**Q: How do I handle errors?**  
A: Use DashboardApiErrorHandler for consistent error messages

**Q: Is offline supported?**  
A: Yes, through caching. Full offline queue in Phase 5.2

**Q: How do I test this?**  
A: Use created widget schemas for mock data, write tests with vitest

---

## 🚨 Common Pitfalls

❌ **Don't**: Fetch data without validation  
✅ **Do**: Use validateWidgetData() from widget-schemas

❌ **Don't**: Ignore loading states  
✅ **Do**: Show WidgetSkeleton while loading

❌ **Don't**: Make request per widget  
✅ **Do**: Use useWidgetsData() for batch requests

❌ **Don't**: Hardcode cache TTL  
✅ **Do**: Use DataSourceManager config per widget

❌ **Don't**: Swallow errors  
✅ **Do**: Use dashboardErrorHandler for consistent handling

---

## 📞 Support

For questions about Phase 5:
1. Check [PHASE_5_QUICKSTART.md](./PHASE_5_QUICKSTART.md)
2. Review [PHASE_5_IMPLEMENTATION_PLAN.md](./PHASE_5_IMPLEMENTATION_PLAN.md)
3. Look at source code comments
4. Check test files for examples

---

## 📝 Revision History

| Date | Status | Summary |
|------|--------|---------|
| 2024-11-24 | Created | Phase 5 foundation files |
| 2024-11-24 | In Progress | API integration layer (30%) |
| Future | In Progress | Database persistence |
| Future | In Progress | Error handling & loading |
| Future | In Progress | Full integration |
| Future | In Progress | Performance monitoring |
| Future | Complete | Phase 5 done |

---

**Phase 5 Index Created**: November 24, 2024  
**Last Updated**: November 24, 2024  
**Maintained By**: Development Team  
**Status**: 🟡 In Progress
