# Session 11: E2E Testing Guide

## Quick Start E2E Validation

### 1. Dashboard Page Load Test
```bash
# Should respond with 200 OK
curl http://localhost:3001/dashboard

# Verify JSON structure returned by API
curl http://localhost:3001/api/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected**:
- Dashboard page returns 200 OK
- API returns dashboard layout and state
- No console errors

---

### 2. Widget Batch API Test

```bash
# Fetch multiple widgets
curl -X POST http://localhost:3001/api/dashboard/widgets/batch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "widgetIds": [
      "research-progress",
      "stats",
      "recent-papers"
    ],
    "forceRefresh": false
  }'
```

**Expected**:
- Response status: 200 or 207 (Multi-Status)
- Results for each widget with data/error
- Valid timestamp

---

### 3. Individual Widget Fetch Test

```bash
# Get single widget data
curl http://localhost:3001/api/dashboard/widgets/research-progress \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected**:
- Widget data in correct schema
- Timestamps and metadata
- Cache info included

---

### 4. Real-time WebSocket Test

```javascript
// Open browser console on dashboard and run:
const ws = new WebSocket(
  'ws://localhost:3001/api/realtime?userId=test-user'
);

ws.onopen = () => {
  console.log('✓ Connected to WebSocket');
  ws.send(JSON.stringify({
    type: 'PING',
    id: 'msg-test-1',
    timestamp: new Date().toISOString(),
    userId: 'test-user',
    payload: {}
  }));
};

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  console.log('✓ Message received:', msg.type);
};

ws.onerror = (error) => {
  console.error('✗ WebSocket error:', error);
};
```

**Expected**:
- WebSocket connects
- PONG response received
- No connection errors

---

### 5. Component Rendering Test

```javascript
// In browser DevTools, check:
1. DashboardPageContent renders without errors
2. Each of 6 widgets loads (or shows loading state)
3. Error boundaries don't trigger
4. Status indicators show connection status
5. No console errors

Widgets to verify:
- ResearchProgressWidget (research-progress)
- StatsWidget (stats)
- RecentPapersWidget (recent-papers)
- WritingGoalsWidget (writing-goals)
- CollaborationWidget (collaboration)
- CalendarWidget (calendar)
```

---

### 6. Error Handling Test

```bash
# Test with invalid widget ID
curl -X POST http://localhost:3001/api/dashboard/widgets/batch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "widgetIds": ["invalid-widget"]
  }'
```

**Expected**:
- Response status: 207 Multi-Status
- Error message in response
- No crash, graceful error handling

---

### 7. Cache Validation Test

```bash
# First request (should be slow)
time curl -X POST http://localhost:3001/api/dashboard/widgets/batch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"widgetIds": ["stats"]}'

# Second request (should be fast - cached)
time curl -X POST http://localhost:3001/api/dashboard/widgets/batch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"widgetIds": ["stats"]}'

# With force refresh (should be slow again)
time curl -X POST http://localhost:3001/api/dashboard/widgets/batch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"widgetIds": ["stats"], "forceRefresh": true}'
```

**Expected**:
- Second request is faster (cached)
- Force refresh bypasses cache
- Cache timing info in response

---

### 8. Performance Check

```javascript
// In browser console:
const start = performance.now();

// Trigger dashboard load
await fetch('/api/dashboard/widgets/batch', {
  method: 'POST',
  body: JSON.stringify({
    widgetIds: ['research-progress', 'stats', 'recent-papers', 'writing-goals', 'collaboration', 'calendar']
  })
});

const end = performance.now();
console.log(`Batch load time: ${end - start}ms`);
```

**Expected**:
- First load: 100-300ms
- Cached load: <50ms
- Widget rendering: <500ms total

---

### 9. Mobile Responsiveness Test

```javascript
// Test responsive layout
1. Open DevTools → Device Emulation
2. Test on iPhone 12, iPad, Desktop sizes
3. Verify widgets stack properly
4. Check touch interactions work
5. Verify no horizontal scroll
```

**Expected**:
- All widgets visible on mobile
- Grid responsively reflows (1 col mobile, 2 tablet, 3 desktop)
- All buttons/interactions work on touch
- No layout shifts

---

### 10. Accessibility Test

```javascript
// In DevTools:
1. Run Lighthouse Accessibility audit
2. Check keyboard navigation (Tab through widgets)
3. Verify color contrast (WCAG AA)
4. Check ARIA labels
5. Test with screen reader (NVDA/JAWS)
```

**Expected**:
- Accessibility score: 90+
- Keyboard fully navigable
- WCAG AA compliant colors
- Screen reader friendly

---

## Verification Checklist

### Build
- [ ] `pnpm build` succeeds
- [ ] No TypeScript errors
- [ ] No ESLint violations
- [ ] 99 routes generated

### Dashboard Page
- [ ] Page loads at `/dashboard`
- [ ] Role-based routing works
- [ ] No console errors
- [ ] Responsive on mobile/tablet/desktop

### API Endpoints
- [ ] GET /api/dashboard returns 200
- [ ] POST /api/dashboard/widgets/batch returns 200/207
- [ ] Single widget endpoints work
- [ ] Error responses are proper JSON

### Widgets
- [ ] All 6 widgets render
- [ ] Loading states display
- [ ] Error states trigger on failures
- [ ] Data displays correctly

### Real-time
- [ ] WebSocket connects
- [ ] Sync indicators update
- [ ] Pending badge appears
- [ ] Offline queue shows

### Performance
- [ ] Batch load: <300ms first, <50ms cached
- [ ] Build time: <60s
- [ ] Initial page load: <2s
- [ ] No memory leaks

### Quality
- [ ] TypeScript: 100% coverage
- [ ] ESLint: 0 violations
- [ ] Tests: 94.8% coverage
- [ ] Accessibility: 90+ score

---

## Debugging Tips

### If dashboard doesn't load:
1. Check browser console for errors
2. Verify auth token is valid
3. Check network tab for API failures
4. Verify WebSocket URL in .env.local

### If widgets show errors:
1. Check API response in Network tab
2. Verify widget ID matches schema
3. Check widget data validation
4. Look for type mismatches in console

### If real-time not working:
1. Verify WebSocket server is running
2. Check NEXT_PUBLIC_WS_URL env var
3. Look at WebSocket tab in DevTools
4. Verify auth headers are sent

### If performance is slow:
1. Clear browser cache
2. Disable extensions
3. Check DevTools Performance tab
4. Look for slow API calls

---

## Manual Test Scenarios

### Scenario 1: Fresh Dashboard Load
1. Open incognito window
2. Navigate to `/dashboard`
3. Should see loading skeletons
4. Widgets should populate
5. Real-time status indicator should show green
6. No console errors

**Success**: All 6 widgets load, sync status shows connected

### Scenario 2: Widget Error Recovery
1. Open dashboard
2. Close API server
3. Try to load widget
4. Should show error state
5. Click retry
6. Restart API server
7. Widget should reload
8. Should recover gracefully

**Success**: Error shown → Retry works → Widget recovers

### Scenario 3: Offline Mode
1. Open DevTools Network tab
2. Set to "Offline"
3. Trigger widget update
4. Should show in pending operations
5. Go back online
5. Changes should sync
6. Pending badge should clear

**Success**: Offline → Pending → Online → Synced

### Scenario 4: Multi-Tab Sync
1. Open dashboard in 2 tabs
2. Change widget setting in tab 1
3. Should reflect in tab 2 via WebSocket
4. Both tabs stay in sync
5. Close tab 1
6. Tab 2 keeps working

**Success**: Cross-tab sync works

---

## Cleanup After Testing

```bash
# Remove test data
git checkout build_session11*.txt
git add -A && git commit -m "Session 11: Complete - cleanup test files"

# Check status
git status  # Should be clean
```

---

## Success Criteria

✅ Dashboard page loads  
✅ All 6 widgets render  
✅ API endpoints return data  
✅ Real-time updates work  
✅ Error handling works  
✅ Performance is acceptable  
✅ Build passes tests  
✅ No console errors  

---

## Next Steps

If all tests pass:
1. Deploy to staging
2. Get stakeholder approval
3. Deploy to production
4. Monitor logs for errors
5. Gather user feedback

If tests fail:
1. Check error messages
2. Debug using tips above
3. Fix root cause
4. Re-run tests
5. Iterate until passing

