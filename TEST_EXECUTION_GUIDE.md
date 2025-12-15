# Dashboard Dynamic Workspace - Test Execution Guide

## Overview

Comprehensive test suite to verify the Dashboard Dynamic Workspace implementation is working as intended.

**Test Files Created:**
1. `src/__tests__/dashboard-dynamic-workspace.integration.test.ts` - Backend RPC & database tests
2. `src/__tests__/whats-next-card.test.tsx` - Component UI tests
3. `src/__tests__/useWorkContextListener.test.ts` - Hook behavior tests

---

## Running Tests

### All Tests
```bash
pnpm test
```

### Specific Test File
```bash
# Integration tests (requires Supabase connection)
pnpm exec vitest src/__tests__/dashboard-dynamic-workspace.integration.test.ts

# Component tests (runs in jsdom)
pnpm exec vitest src/__tests__/whats-next-card.test.tsx

# Hook tests (unit tests with mocks)
pnpm exec vitest src/__tests__/useWorkContextListener.test.ts
```

### With UI
```bash
pnpm test:ui
```

### With Coverage
```bash
pnpm test:coverage
```

### Watch Mode
```bash
pnpm test -- --watch
```

---

## Test Suites Explained

### 1. Integration Tests: `dashboard-dynamic-workspace.integration.test.ts`

**What it tests:** Backend functionality and database operations

**Requirements:**
- Supabase connection (uses env variables)
- Test user and document IDs
- Database migrations applied

**Environment Variables Needed:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
TEST_USER_ID=your-test-user-uuid
TEST_DOCUMENT_ID=your-test-document-uuid
```

**Test Groups:**

#### RPC Function Tests
```
✓ Returns chapter_continuation for active chapters
✓ Prioritizes advisor feedback (HIGH) over active work
✓ Returns milestone_overdue with CRITICAL urgency
✓ Returns milestone_upcoming with HIGH urgency
✓ Returns completion message when everything done
```

#### Work Context Tests
```
✓ Creates/updates student_work_context record
✓ Tracks last_activity_at on documents
✓ Auto-updates timestamp on changes
```

#### Priority Logic Tests
```
✓ Follows correct priority order
✓ Calculates days overdue correctly
✓ Calculates days until deadline correctly
```

#### Progress Tracking Tests
```
✓ Tracks completion percentage
✓ Rejects invalid percentages (< 0 or > 100)
```

#### Work Context Updates Tests
```
✓ Updates all fields correctly
✓ Handles NULL values properly
```

#### Performance Tests
```
✓ RPC executes within 200ms
✓ Handles 5+ concurrent calls
```

#### Data Consistency Tests
```
✓ Maintains consistency between documents and work_context tables
```

**Running Integration Tests:**
```bash
# Make sure Supabase migrations are applied first
supabase db push --include-all

# Run with test environment
SUPABASE_SERVICE_ROLE_KEY=your-key TEST_USER_ID=uuid TEST_DOCUMENT_ID=uuid \
  pnpm exec vitest src/__tests__/dashboard-dynamic-workspace.integration.test.ts
```

---

### 2. Component Tests: `whats-next-card.test.tsx`

**What it tests:** WhatsNextCard component UI and behavior

**No external dependencies required** (uses mocked data)

**Test Groups:**

#### Rendering Tests
```
✓ Renders null when nextAction is null
✓ Renders skeleton when loading
✓ Renders action card with title and detail
```

#### Urgency Styling Tests
```
✓ Applies blue styling for normal urgency
✓ Applies amber styling for high urgency
✓ Applies red styling for critical urgency
```

#### URGENT Badge Tests
```
✓ Shows URGENT badge for critical urgency
✓ Hides URGENT badge for non-critical
```

#### Progress Bar Tests
```
✓ Renders progress bar for chapter work
✓ Hides progress bar without completion_percentage
✓ Renders progress bar with 0%
✓ Renders progress bar with 100%
```

#### Progress Bar Styling Tests
```
✓ Uses blue bar for normal urgency
✓ Uses amber bar for high urgency
✓ Uses red bar for critical urgency
```

#### Button Tests
```
✓ Renders Start Now button
✓ Has correct href in link
```

#### Icon Tests
```
✓ Renders icon from action
✓ Shows alert icon with URGENT badge
```

#### Data Type Tests
```
✓ Handles chapter_continuation type
✓ Handles feedback type
✓ Handles milestone type
✓ Handles task type
```

#### Edge Case Tests
```
✓ Handles very long titles
✓ Handles very long detail text
✓ Handles completion percentage boundaries (0, 1, 50, 99, 100)
```

**Running Component Tests:**
```bash
pnpm exec vitest src/__tests__/whats-next-card.test.tsx

# Run with UI viewer
pnpm test:ui
```

---

### 3. Hook Tests: `useWorkContextListener.test.ts`

**What it tests:** Real-time listener hook functionality

**Uses mocked Supabase client** (no database required)

**Test Groups:**

#### Subscription Management Tests
```
✓ Subscribes to documents channel on mount
✓ Cleans up subscriptions on unmount
✓ Doesn't subscribe when session is missing
✓ Doesn't subscribe when enabled is false
```

#### Event Handling Tests
```
✓ Calls callback on document change
✓ Calls callback on work context change
✓ Debounces callback invocations (default 500ms)
✓ Respects custom debounce time
```

#### Channel Management Tests
```
✓ Creates documents channel with correct filter
✓ Creates work context channel with correct filter
✓ Listens to all event types (INSERT, UPDATE, DELETE)
✓ Filters by user_id on documents
✓ Filters by student_id on work context
```

#### Logging Tests
```
✓ Logs subscription status
✓ Logs document changes
✓ Logs context changes
```

#### Error Handling Tests
```
✓ Handles missing session gracefully
✓ Handles missing supabase client gracefully
✓ Cleans up on error
```

#### Options Tests
```
✓ Accepts custom debounceMs option
✓ Accepts enabled option
✓ Uses default debounceMs of 500ms
✓ Uses default enabled of true
```

#### Dependency Management Tests
```
✓ Resubscribes when userId changes
✓ Resubscribes when callback changes
✓ Handles debounceMs changes
```

#### Performance Tests
```
✓ Doesn't cause excessive re-renders
✓ Cleans up debounce timeout on unmount
✓ Uses efficient channel subscriptions
```

**Running Hook Tests:**
```bash
pnpm exec vitest src/__tests__/useWorkContextListener.test.ts

# With watch mode
pnpm exec vitest src/__tests__/useWorkContextListener.test.ts --watch
```

---

## Test Execution Checklist

### Pre-Test Setup
- [ ] Node.js and pnpm installed
- [ ] All dependencies installed (`pnpm install`)
- [ ] Environment variables set (for integration tests)
- [ ] Supabase database migrations applied
- [ ] Development server not running (to avoid port conflicts)

### Test Execution

#### Phase 1: Unit Tests (No External Dependencies)
```bash
[ ] pnpm exec vitest src/__tests__/whats-next-card.test.tsx
[ ] pnpm exec vitest src/__tests__/useWorkContextListener.test.ts
```

**Expected:** All tests pass (~40-50 tests)
**Time:** ~10 seconds

#### Phase 2: Integration Tests (With Supabase)
```bash
[ ] Set TEST_USER_ID and TEST_DOCUMENT_ID environment variables
[ ] Verify Supabase connection
[ ] pnpm exec vitest src/__tests__/dashboard-dynamic-workspace.integration.test.ts
```

**Expected:** All tests pass (~25-30 tests)
**Time:** ~30 seconds (depends on network)

#### Phase 3: All Tests Together
```bash
[ ] pnpm test
```

**Expected:** All tests pass (~65-80 tests total)
**Time:** ~1 minute

### Coverage Report
```bash
[ ] pnpm test:coverage
[ ] Check coverage report in `coverage/` directory
[ ] Target: > 80% coverage on dashboard files
```

---

## Expected Test Results

### Success Indicators

✅ All unit tests pass (0 failures)
✅ All component tests pass (0 failures)
✅ All hook tests pass (0 failures)
✅ Integration tests work with real Supabase
✅ No console errors or warnings
✅ Coverage > 80% for tested files
✅ Tests complete in < 2 minutes

### Common Issues & Solutions

#### Issue: "Cannot find module '@/components/auth-provider'"
**Solution:** Check tsconfig.json path aliases
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### Issue: Integration tests timeout
**Solution:** Check Supabase connection
```bash
# Verify connection
curl https://your-project.supabase.co/rest/v1/
```

#### Issue: Tests pass locally but fail in CI
**Solution:** Ensure environment variables are set in CI/CD pipeline
```yaml
# Example for GitHub Actions
env:
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_KEY }}
```

---

## Manual Testing

While automated tests are comprehensive, also perform these manual tests:

### Manual Test 1: Basic Functionality
```
1. Login as test student
2. Open dashboard
3. Verify "What's Next?" card displays
4. Save document in Chapter 1
5. Verify card shows "Continue: Chapter 1"
6. Switch to Chapter 2
7. Verify card updates to "Continue: Chapter 2" within 2 seconds
```

### Manual Test 2: Advisor Feedback
```
1. Submit Chapter 1 for advisor review
2. Wait for status to change to 'pending_review'
3. Dashboard should show "Revise Chapter 1"
4. Card should have amber background (HIGH priority)
```

### Manual Test 3: Overdue Milestone
```
1. Set a milestone deadline to yesterday
2. Dashboard should immediately show overdue
3. Card should have red background (CRITICAL)
4. Detail should show "X days overdue"
```

### Manual Test 4: Mobile
```
1. Open dashboard on mobile device
2. Verify card renders properly
3. Verify progress bar displays
4. Tap "Start Now" button
5. Verify navigation works
```

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: Test Dashboard Dynamic Workspace

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install
      
      - name: Run unit tests
        run: pnpm exec vitest src/__tests__/whats-next-card.test.tsx
      
      - name: Run hook tests
        run: pnpm exec vitest src/__tests__/useWorkContextListener.test.ts
      
      - name: Run integration tests
        run: pnpm exec vitest src/__tests__/dashboard-dynamic-workspace.integration.test.ts
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_KEY }}
          TEST_USER_ID: ${{ secrets.TEST_USER_ID }}
          TEST_DOCUMENT_ID: ${{ secrets.TEST_DOCUMENT_ID }}
      
      - name: Generate coverage
        run: pnpm test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Test Metrics

### Expected Metrics After Running All Tests

| Metric | Target | Expected |
|--------|--------|----------|
| Total Tests | > 60 | ~75 |
| Pass Rate | 100% | 100% |
| Coverage (Dashboard) | > 80% | ~85% |
| Execution Time | < 2 min | ~90 sec |
| Failures | 0 | 0 |
| Skipped | 0 | 0 |

---

## Debugging Tests

### Enable Verbose Output
```bash
pnpm exec vitest --reporter=verbose
```

### Run Single Test
```bash
pnpm exec vitest -t "should return chapter_continuation"
```

### Debug Mode
```bash
node --inspect-brk ./node_modules/.bin/vitest --run
```

### Check Supabase RPC Directly
```bash
# In Supabase Studio SQL editor
SELECT * FROM get_student_next_action('test-user-uuid');
```

---

## Next Steps After Testing

✅ All tests passing?
→ Ready for production deployment

❌ Some tests failing?
→ Review failures and IMPLEMENTATION_STATUS.md for troubleshooting

📊 Want better coverage?
→ Add more tests for edge cases in your specific use cases

---

## Test Documentation Files

- `TEST_EXECUTION_GUIDE.md` - This file
- `DASHBOARD_DYNAMIC_WORKSPACE_IMPLEMENTATION.md` - Architecture
- `DASHBOARD_DYNAMIC_IMPLEMENTATION_STATUS.md` - Current status

---

**Created:** December 15, 2025
**Test Suite Complete:** Yes
**Ready to Run:** Yes
