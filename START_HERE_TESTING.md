# 🧪 Dashboard Dynamic Workspace - Testing & Validation Guide

**Status:** ✅ All Implementation Complete - Ready for Testing

**Generated:** December 15, 2025

---

## Quick Start: Run Tests Now

```bash
# Install dependencies (if not already done)
pnpm install

# Run all tests (recommended first step)
pnpm test

# Expected result: ~75 tests passing in < 2 minutes
```

---

## Test Files Generated

### 1. Integration Tests
**File:** `src/__tests__/dashboard-dynamic-workspace.integration.test.ts`

**What it tests:**
- RPC function behavior ✅
- Priority logic ✅
- Database operations ✅
- Work context tracking ✅
- Performance (< 200ms) ✅

**Run:**
```bash
pnpm exec vitest src/__tests__/dashboard-dynamic-workspace.integration.test.ts
```

**Tests:** ~25 integration tests

### 2. Component Tests
**File:** `src/__tests__/whats-next-card.test.tsx`

**What it tests:**
- UI rendering ✅
- Urgency styling (blue/amber/red) ✅
- Progress bar display ✅
- Button functionality ✅
- URGENT badge ✅
- Edge cases ✅

**Run:**
```bash
pnpm exec vitest src/__tests__/whats-next-card.test.tsx
```

**Tests:** ~35 component tests

### 3. Hook Tests
**File:** `src/__tests__/useWorkContextListener.test.ts`

**What it tests:**
- Subscription management ✅
- Real-time event handling ✅
- Debouncing (500ms) ✅
- Cleanup on unmount ✅
- Error handling ✅

**Run:**
```bash
pnpm exec vitest src/__tests__/useWorkContextListener.test.ts
```

**Tests:** ~15 hook tests

---

## Test Execution Path

### Step 1: Unit Tests (No Dependencies)
```bash
pnpm exec vitest src/__tests__/whats-next-card.test.tsx \
                   src/__tests__/useWorkContextListener.test.ts
```

**Expected:** All pass (~50 tests)
**Time:** ~10 seconds
**Dependencies:** None needed

### Step 2: Integration Tests (Requires Supabase)
```bash
# Set environment variables first
$env:NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
$env:TEST_USER_ID="test-user-uuid"
$env:TEST_DOCUMENT_ID="test-doc-uuid"

# Then run
pnpm exec vitest src/__tests__/dashboard-dynamic-workspace.integration.test.ts
```

**Expected:** All pass (~25 tests)
**Time:** ~30 seconds
**Dependencies:** Supabase connection, migrations applied

### Step 3: Complete Test Suite
```bash
pnpm test
```

**Expected:** All pass (~75 tests)
**Time:** < 2 minutes
**Coverage:** Full feature validation

---

## Test Validation Checklist

### Core Functionality
- [ ] RPC function returns correct action types
- [ ] Priority logic: feedback > overdue > active > task
- [ ] Progress bar renders with correct percentage
- [ ] URGENT badge shows for critical items
- [ ] Work context updates trigger dashboard updates

### User Experience
- [ ] Card updates within 2 seconds
- [ ] No console errors
- [ ] Mobile UI works properly
- [ ] Touch interactions responsive
- [ ] Progress displays correctly

### Performance
- [ ] RPC query < 200ms
- [ ] Dashboard update < 1s
- [ ] No excessive re-renders
- [ ] Memory stable over time
- [ ] CPU impact minimal

### Edge Cases
- [ ] Handles NULL values
- [ ] Rejects invalid percentages
- [ ] Works with long titles
- [ ] Handles rapid updates
- [ ] Survives WebSocket disconnect

---

## What Each Test Validates

### Integration Tests Validate:
```
✓ RPC returns chapter_continuation for active work
✓ RPC prioritizes feedback (HIGH) over active work
✓ RPC returns milestone_overdue with CRITICAL urgency
✓ RPC returns milestone_upcoming with HIGH urgency
✓ RPC returns completion message when done
✓ Work context table updates work
✓ Timestamp auto-updates on changes
✓ Completion percentage tracking
✓ Priority order is correct
✓ Days overdue calculation
✓ Days until deadline calculation
✓ Data consistency between tables
✓ RPC performance < 200ms
✓ Concurrent RPC calls work
✓ +10 more specific scenarios
```

### Component Tests Validate:
```
✓ Card renders null when no action
✓ Card shows skeleton when loading
✓ Title and detail display correctly
✓ Normal urgency uses blue styling
✓ High urgency uses amber styling
✓ Critical urgency uses red styling
✓ URGENT badge shows for critical
✓ Progress bar shows with percentage
✓ Progress bar hidden without percentage
✓ Start Now button has correct href
✓ Icon displays correctly
✓ Handles chapter_continuation type
✓ Handles feedback type
✓ Handles milestone type
✓ Handles task type
✓ +20 more UI validation tests
```

### Hook Tests Validate:
```
✓ Subscribes on mount
✓ Cleans up on unmount
✓ Doesn't subscribe without session
✓ Doesn't subscribe if disabled
✓ Calls callback on document change
✓ Calls callback on context change
✓ Debounces rapid updates (500ms)
✓ Respects custom debounce time
✓ Handles missing session
✓ Handles missing supabase
✓ +5 more real-time scenarios
```

---

## Expected Test Results

### Success Criteria
```
✅ All tests pass
✅ No errors or warnings
✅ No skipped tests
✅ Coverage > 80%
✅ Execution time < 2 min
```

### Sample Output
```
PASS  src/__tests__/whats-next-card.test.tsx (35 tests)
PASS  src/__tests__/useWorkContextListener.test.ts (15 tests)
PASS  src/__tests__/dashboard-dynamic-workspace.integration.test.ts (25 tests)

Test Files  3 passed (3)
     Tests  75 passed (75)
  Duration  89.2 ms
```

---

## Manual Testing Scenarios

After automated tests pass, run these manual tests:

### Manual Test 1: Basic Flow (5 min)
```
1. Login as test student
2. Go to dashboard
3. Verify "What's Next?" appears
4. Save document in Chapter 1
5. Verify card shows "Continue: Chapter 1"
6. Edit content in Chapter 2
7. Wait 1-2 seconds
8. Verify card updates to "Continue: Chapter 2"
✅ If this works, real-time is functional
```

### Manual Test 2: Priority Testing (5 min)
```
1. Submit document for advisor review
2. Within 1-2 seconds, card should show "Revise" (HIGH - amber)
3. Check advisor feedback has priority over other actions
✅ If this works, priority logic is correct
```

### Manual Test 3: Overdue Testing (5 min)
```
1. Create a milestone with deadline = yesterday
2. Dashboard should immediately show "Overdue" (CRITICAL - red)
3. Should show "X days overdue"
✅ If this works, overdue detection is correct
```

### Manual Test 4: Mobile Testing (5 min)
```
1. Open dashboard on mobile/tablet
2. Verify card displays properly
3. Verify progress bar renders
4. Tap "Start Now" button
5. Verify navigation works
✅ If this works, mobile is responsive
```

---

## Troubleshooting Failed Tests

### If Integration Tests Fail:

**Error: "Cannot connect to Supabase"**
- [ ] Check NEXT_PUBLIC_SUPABASE_URL is correct
- [ ] Check SUPABASE_SERVICE_ROLE_KEY is valid
- [ ] Verify Supabase project is running
- [ ] Check network connection

**Error: "RPC function not found"**
- [ ] Run `supabase db push --include-all` first
- [ ] Verify migrations 54 & 55 applied
- [ ] Check Supabase migrations list

**Error: "Permission denied"**
- [ ] Check RLS policies are set up
- [ ] Verify TEST_USER_ID exists
- [ ] Check user has read permissions

### If Component Tests Fail:

**Error: "Cannot find module"**
- [ ] Check import paths use @ alias
- [ ] Verify tsconfig.json paths
- [ ] Run `pnpm install`

**Error: "Element not found"**
- [ ] Verify component renders
- [ ] Check test uses correct selector
- [ ] Verify test data is correct

### If Hook Tests Fail:

**Error: "Mock not working"**
- [ ] Check mock setup in beforeEach
- [ ] Verify useAuth hook is mocked
- [ ] Check Supabase client is mocked

---

## Test Coverage Report

```bash
# Generate coverage report
pnpm test:coverage

# View coverage in browser
# Coverage report will be in coverage/ directory
```

**Expected Coverage:**
```
dashboard-dynamic-workspace:  ~85%
whats-next-card:              ~90%
useWorkContextListener:        ~80%
update-work-context:          ~85%

Overall Target:               > 80%
```

---

## Continuous Testing

### Watch Mode (For Development)
```bash
pnpm exec vitest --watch
```

### UI Viewer (For Visual Testing)
```bash
pnpm test:ui
```

### Before Deployment
```bash
pnpm test:coverage
```

---

## Test Documentation

For detailed test documentation, see:
- `TEST_EXECUTION_GUIDE.md` - Complete test guide
- `COMPLETE_DELIVERABLES.md` - What was delivered
- `IMPLEMENTATION_COMPLETE_SUMMARY.txt` - Summary

---

## Integration Testing Checklist

After running automated tests, verify these integrations:

- [ ] Database migrations applied
- [ ] RPC function exists and works
- [ ] Real-time events firing
- [ ] WebSocket connections stable
- [ ] Dashboard component loading
- [ ] Work context updates triggering
- [ ] UI updates visible
- [ ] Progress bar rendering
- [ ] Urgency colors showing
- [ ] Mobile responsive

---

## Performance Validation

Run these checks to validate performance:

```bash
# Browser DevTools - Network Tab
- RPC query time: should be < 200ms
- Real-time event lag: should be < 50ms
- DOM update time: should be < 500ms

# Browser DevTools - Performance Tab
- JS execution: minimal spike on updates
- Memory: should not continuously grow
- CPU: should drop back to baseline

# Supabase Dashboard
- RPC execution time: should be < 100ms
- Real-time messages: should have low latency
- No error logs: should see 0 errors
```

---

## Post-Test Deployment

After all tests pass:

1. **Code Review**
   - [ ] All code looks good
   - [ ] No breaking changes
   - [ ] Follows conventions

2. **Deployment**
   - [ ] Database migrations applied
   - [ ] Code deployed to production
   - [ ] Environment variables set

3. **Integration**
   - [ ] Add updateWorkContext() calls
   - [ ] Test in production environment
   - [ ] Monitor error logs

4. **Validation**
   - [ ] Real-time updates working
   - [ ] Progress tracking accurate
   - [ ] Priorities correct
   - [ ] Mobile works

---

## Quick Command Reference

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm exec vitest src/__tests__/whats-next-card.test.tsx

# Watch mode
pnpm exec vitest --watch

# Coverage report
pnpm test:coverage

# UI test viewer
pnpm test:ui

# Single test
pnpm exec vitest -t "should return chapter_continuation"

# Debug mode
node --inspect-brk ./node_modules/.bin/vitest --run

# List all tests
pnpm exec vitest --list
```

---

## Next: After Testing

Once all tests pass:

1. ✅ Review `DASHBOARD_INTEGRATION_NEXT_STEPS.md`
2. ✅ Deploy database: `supabase db push --include-all`
3. ✅ Add integration points in editors
4. ✅ Deploy code to production
5. ✅ Monitor for issues
6. ✅ Gather user feedback

---

**Ready to Test?** Start with:
```bash
pnpm test
```

**Questions?** Check:
- `TEST_EXECUTION_GUIDE.md` - Detailed test info
- `DASHBOARD_INTEGRATION_NEXT_STEPS.md` - Implementation steps
- `COMPLETE_DELIVERABLES.md` - Full overview

---

**Test Status:** ✅ Ready to Run
**Last Updated:** December 15, 2025
