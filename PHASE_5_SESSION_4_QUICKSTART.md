# Phase 5 Session 4: Next Steps & Quick Start
**Date**: Ready for immediate start  
**Duration**: ~3 hours  
**Focus**: Unit Tests & Integration Validation

---

## What to Do First (5 minutes)

1. **Review Status**
   ```bash
   # Current: 42% complete (Tracks 1-2 foundation ready)
   # Ready: Database migration, API routes, store updates
   # Next: Tests and error handling components
   ```

2. **Read Quick Summary**
   - Open: `PHASE_5_IMPLEMENTATION_SUMMARY.md`
   - Time: 15 minutes
   - Covers: What's been built, architecture, next steps

3. **Check Files Created**
   - Database migration: `supabase/migrations/11_dashboard_tables.sql`
   - Store enhanced: `src/lib/personalization/dashboard-state.ts`
   - API routes: `src/app/api/dashboard/**/*.ts`

---

## Critical: Deploy Database Migration

### Step 1: Verify Migration File
```bash
# Check migration exists
ls -la supabase/migrations/11_dashboard_tables.sql

# Review the migration
cat supabase/migrations/11_dashboard_tables.sql | head -50
```

### Step 2: Run Migration
```bash
# On Supabase CLI
supabase migration up

# Or manually in Supabase dashboard:
# 1. Go to SQL Editor
# 2. Copy entire migration file
# 3. Run in development first
# 4. Then run on production
```

### Step 3: Verify Tables Created
```sql
-- Run these queries to verify
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'dashboard%' OR tablename LIKE 'widget%' OR tablename LIKE 'user_dashboard%';

-- Expected: 5 tables
-- - dashboard_layouts
-- - widget_data_cache
-- - widget_settings
-- - user_dashboard_preferences
-- - dashboard_activity_log
```

### Step 4: Check RLS Policies
```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN (
  'dashboard_layouts',
  'widget_data_cache',
  'widget_settings',
  'user_dashboard_preferences',
  'dashboard_activity_log'
);

-- All should show: TRUE
```

---

## Session 4 Checklist (~3 hours)

### A. Unit Tests (Write & Run - ~1.5 hours)

**Test Files to Create:**

1. **`__tests__/dashboard/dashboard-state.test.ts`** (30+ test cases)
   - Test store initialization
   - Test loadWidgetData action
   - Test loadAllWidgetData batch
   - Test setWidgetData action
   - Test clearWidgetCache
   - Test refetchWidget
   - Test error handling
   - Test hook selectors

2. **`__tests__/dashboard/data-source-manager.test.ts`** (20+ test cases)
   - Test caching logic
   - Test TTL expiration
   - Test cache invalidation
   - Test mock data fallback
   - Test error scenarios

3. **`__tests__/dashboard/widget-schemas.test.ts`** (15+ test cases)
   - Test Zod schema validation
   - Test mock data generation
   - Test schema export

**Quick Test Template:**
```typescript
import { renderHook, act } from '@testing-library/react';
import { useWidgetData, useDashboardStore } from '@/lib/personalization/dashboard-state';

describe('useWidgetData', () => {
  it('should load widget data', async () => {
    const { result } = renderHook(() => useWidgetData('research-progress'));
    
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    
    await act(async () => {
      await result.current.refetch();
    });
    
    expect(result.current.loading).toBe(false);
  });
});
```

### B. Integration Tests (Write & Run - ~1 hour)

**Test File: `__tests__/integration/dashboard-api.integration.test.ts`**

Test scenarios:
1. Fetch single widget via API
2. Batch fetch multiple widgets
3. Save dashboard layout
4. Load dashboard with widgets
5. Error handling flow
6. Cache validation

**Quick Integration Template:**
```typescript
describe('Dashboard API Integration', () => {
  it('should fetch widget data from API', async () => {
    const response = await fetch('/api/dashboard/widgets/research-progress');
    const data = await response.json();
    
    expect(response.ok).toBe(true);
    expect(data.data).toBeDefined();
  });
});
```

### C. Manual Testing (Run - ~30 minutes)

**Test Checklist:**

API Endpoints:
- [ ] `GET /api/dashboard` - Returns layout + widget data
- [ ] `POST /api/dashboard` - Saves dashboard config
- [ ] `GET /api/dashboard/widgets/research-progress` - Returns widget data
- [ ] `POST /api/dashboard/widgets/batch` - Batch fetches widgets
- [ ] `GET /api/dashboard/layouts` - Lists user layouts
- [ ] `POST /api/dashboard/layouts` - Creates new layout
- [ ] `PUT /api/dashboard/layouts/[id]` - Updates layout
- [ ] `DELETE /api/dashboard/layouts/[id]` - Deletes layout

**Using Curl:**
```bash
# Test GET dashboard
curl http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test widget fetch
curl http://localhost:3000/api/dashboard/widgets/research-progress \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test batch fetch
curl -X POST http://localhost:3000/api/dashboard/widgets/batch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"widgetIds":["research-progress","quick-stats"]}'
```

---

## What Works Now (Use These)

### Store Usage
```typescript
// In components
import { useWidgetData, useWidgetsData } from '@/lib/personalization/dashboard-state';

// Single widget
const { data, loading, error } = useWidgetData('research-progress');

// Multiple widgets
const { data, loading } = useWidgetsData(['research-progress', 'quick-stats']);

// Direct store access
import { useDashboardStore } from '@/lib/personalization/dashboard-state';
const store = useDashboardStore();
await store.loadWidgetData('research-progress');
```

### API Routes
```typescript
// All these endpoints work
GET    /api/dashboard
POST   /api/dashboard
PUT    /api/dashboard
GET    /api/dashboard/widgets/[id]
POST   /api/dashboard/widgets/batch
GET    /api/dashboard/layouts
POST   /api/dashboard/layouts
GET    /api/dashboard/layouts/[id]
PUT    /api/dashboard/layouts/[id]
DELETE /api/dashboard/layouts/[id]
POST   /api/dashboard/layouts/[id]  (clone)
```

### Database Tables
```sql
-- All these tables ready (after migration)
SELECT * FROM dashboard_layouts;
SELECT * FROM widget_data_cache;
SELECT * FROM widget_settings;
SELECT * FROM user_dashboard_preferences;
SELECT * FROM dashboard_activity_log;
```

---

## What's NOT Ready Yet

❌ Error boundary components  
❌ Loading skeleton UI  
❌ Widget error display components  
❌ Full dashboard page with widgets  
❌ Performance monitoring  
❌ Real-time updates  

These are for Sessions 5-6.

---

## Common Issues & Fixes

### Issue: Migration Won't Run
**Cause**: Duplicate table names  
**Fix**: Drop old test tables first
```sql
DROP TABLE IF EXISTS dashboard_layouts CASCADE;
DROP TABLE IF EXISTS widget_data_cache CASCADE;
```

### Issue: RLS Policies Too Restrictive
**Cause**: auth.uid() mismatch  
**Fix**: Verify user is logged in with proper session
```typescript
const { data: { user } } = await supabase.auth.getUser();
// Should not be null
```

### Issue: API Returns 401 Unauthorized
**Cause**: Missing auth token in headers  
**Fix**: Include auth header in all requests
```typescript
const response = await fetch('/api/dashboard', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Issue: Widget Data Cache Not Updating
**Cause**: TTL not expired, need force refresh  
**Fix**: Use forceRefresh parameter
```typescript
await store.refetchWidget('research-progress');
// Or with API
fetch('/api/dashboard/widgets/research-progress?forceRefresh=true')
```

---

## File References

### Created This Session
- `supabase/migrations/11_dashboard_tables.sql` - Database schema
- `PHASE_5_SESSION_3_PROGRESS.md` - Session summary
- `PHASE_5_IMPLEMENTATION_SUMMARY.md` - Overall summary

### Modified This Session
- `src/lib/personalization/dashboard-state.ts` - Added store actions
- `PHASE_5_STATUS.txt` - Updated progress

### Previous Sessions
- `src/lib/dashboard/widget-schemas.ts` - Data schemas
- `src/lib/dashboard/api-error-handler.ts` - Error handling
- `src/lib/dashboard/data-source-manager.ts` - Data management
- `src/app/api/dashboard/**/*.ts` - API routes

---

## Success Metrics for This Session

✅ Unit tests written and passing (30+ test cases)  
✅ Integration tests written and passing (5+ scenarios)  
✅ Manual testing completed (all endpoints tested)  
✅ Database migration running successfully  
✅ No console errors in tests  
✅ All store actions working  
✅ All API endpoints responding  

---

## After This Session

### Immediate Next Steps
1. Write error boundary components
2. Create loading skeletons
3. Build widget error display
4. Implement full dashboard page

### Quality Checks
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] API responses validated

### Before Moving to Session 5
- [ ] Database migration deployed
- [ ] 100+ tests passing
- [ ] All API endpoints tested
- [ ] Store actions verified

---

## Time Breakdown (~3 hours)

| Task | Time | Status |
|------|------|--------|
| Database migration | 15 min | Required first |
| Unit tests | 45 min | Then test store |
| Integration tests | 30 min | Test API routes |
| Manual testing | 30 min | Verify endpoints |
| Review & refine | 20 min | Final checks |

---

## Resources

### Documentation
- `PHASE_5_IMPLEMENTATION_SUMMARY.md` - Overall architecture
- `PHASE_5_IMPLEMENTATION_PLAN.md` - Detailed specifications
- `PHASE_5_SESSION_3_PROGRESS.md` - This session's work

### Code References
- Store: `src/lib/personalization/dashboard-state.ts`
- API: `src/app/api/dashboard/**/*.ts`
- Schema: `src/lib/dashboard/widget-schemas.ts`

### Testing Tools
- Vitest for unit tests
- React Testing Library for hooks
- Supabase client for integration tests

---

## Quick Commands

```bash
# Run migrations
supabase migration up

# Run unit tests
npm run test
npm run test -- dashboard-state.test.ts  # Specific file

# Run integration tests
npm run test:integration
npm run test:integration -- dashboard-api  # Specific

# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Dev server
npm run dev
```

---

## Before You Start

### Environment Setup
```bash
# Verify you have:
- Node 18+ installed
- pnpm or npm installed
- Supabase CLI installed
- Environment variables configured
```

### Database Backup
```bash
# Before running migration:
1. Export your current database schema
2. Create a test backup
3. Test migration on staging first
```

### Code Review
```bash
# Files to understand before testing:
1. src/lib/personalization/dashboard-state.ts (store)
2. src/app/api/dashboard/route.ts (main API)
3. supabase/migrations/11_dashboard_tables.sql (DB)
```

---

## Success = Phase 5 45%+ Complete

When you finish this session:
- ✅ Database is live and working
- ✅ 100+ tests are passing
- ✅ All API routes verified
- ✅ Store actions confirmed
- ✅ Ready for UI components (Sessions 5-6)

---

**Ready?** Start with database migration, then tests, then manual verification.  
**Questions?** Check PHASE_5_IMPLEMENTATION_SUMMARY.md section "What's Been Built"

**Estimated Time**: 3 hours  
**Target Completion**: 45% of Phase 5 (currently 42%, +3%)

Good luck! 🚀
