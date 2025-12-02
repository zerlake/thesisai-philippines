# Dashboard Puter & WebSocket Integration - Verification Checklist

## Pre-Testing Setup

- [ ] Changes committed to git (if applicable)
- [ ] Node modules installed (`pnpm install`)
- [ ] No build errors from previous sessions
- [ ] Browser DevTools ready (press F12)
- [ ] Internet connection stable

---

## Step 1: Verify Files Exist

Run this command:
```bash
node test-dashboard-integration.js
```

Expected output:
```
✓ All dashboard integration files exist
✓ DashboardPuterStatus properly uses PuterContext
✓ DashboardHeader includes DashboardPuterStatus
✓ DashboardSyncIndicator uses WebSocket fallback hook
✓ WebSocket fallback hook properly implements HTTP polling fallback
```

**Checklist**:
- [ ] Test script runs without errors
- [ ] All 5 integration checks pass
- [ ] No missing file errors

---

## Step 2: Start Development Server

```bash
pnpm dev
```

**Checklist**:
- [ ] Server starts without errors
- [ ] No red error messages in terminal
- [ ] "ready - started server" message appears
- [ ] Can access http://localhost:3000 in browser

---

## Step 3: Open Dashboard

Navigate to the dashboard page (e.g., `/dashboard` or student dashboard)

**Visual Checklist**:

### Header Area
```
Expected Layout:
┌─────────────────────────────────────────────────────────┐
│ Welcome back, [Name]                                    │
│                                      [AI Button] [Status]│
└─────────────────────────────────────────────────────────┘
```

- [ ] "Connect AI" button visible (if not signed in)
- [ ] OR "AI Connected" badge visible (if signed in)
- [ ] Sync status indicator visible (dot + text)
- [ ] No overlapping elements
- [ ] Buttons are clickable

### Console Check
Open DevTools (F12) and check Console tab:
- [ ] No red error messages
- [ ] No warnings about missing modules
- [ ] May see info messages about WebSocket (OK)

---

## Step 4: Test Puter Connection

### 4.1 Check Initial State
- [ ] Dashboard loads without "Disconnected" error
- [ ] "Connect AI" button shows (assuming not pre-signed-in)
- [ ] Button is not disabled
- [ ] No error toast notifications

### 4.2 Click "Connect AI"
1. Click the "Connect AI" button
2. Puter sign-in dialog should appear

**Checklist**:
- [ ] Button is responsive (not stuck)
- [ ] Sign-in dialog appears within 2 seconds
- [ ] Dialog is from Puter (official looking)
- [ ] Dialog is not frozen or blank

### 4.3 Sign In with Puter
1. Follow Puter's sign-in flow
2. Complete authentication

**Checklist**:
- [ ] Sign-in process completes
- [ ] Dialog closes after authentication
- [ ] Page is still responsive

### 4.4 After Sign In
Dashboard should update to show:
- [ ] Button changed to "AI Connected" badge (green)
- [ ] Badge shows checkmark icon (✓)
- [ ] Success toast appeared: "Successfully signed in to Puter"
- [ ] Dashboard content still visible and functional

---

## Step 5: Test Sign Out

### 5.1 Click Sign Out
1. Click "Sign Out" on the "AI Connected" badge
2. Wait for confirmation

**Checklist**:
- [ ] Click is responsive
- [ ] Sign out completes within 2 seconds
- [ ] Success toast: "Successfully signed out from Puter"
- [ ] Button reverts to "Connect AI"

---

## Step 6: Test Sync Status Indicator

### 6.1 Visual Check
The sync indicator should show one of these states:

**Green Status** 🟢
```
[●] Synced
```
- Means: WebSocket is connected, real-time sync active
- Expected if WebSocket server available
- Click details to see more info

**Orange Status** 🟠
```
[●] Polling (Fallback)
```
- Means: Using HTTP polling fallback
- Expected in dev environment (no WebSocket server)
- Dashboard still works normally
- This is OK!

**Yellow Status** 🟡
```
[●] Disconnected
```
- Means: Trying to connect
- Should only appear briefly during startup
- Should change to green or orange

**Red Status** 🔴
```
[●] Connection Error
```
- Means: Network or server issue
- Check /api/realtime endpoint
- Check internet connection
- Check server logs

**Gray Status** ⚪
```
[●] Initializing...
```
- Means: Still starting up
- Should resolve within 2-3 seconds
- If stuck, refresh page

**Checklist**:
- [ ] Status indicator has a colored dot
- [ ] Status indicator has text description
- [ ] Color matches current state
- [ ] No missing/broken indicator

### 6.2 Details Click
Click "Details" if visible next to status:
- [ ] Details expand to show more info
- [ ] Shows connected status
- [ ] Shows pending operations count
- [ ] Shows queue size

---

## Step 7: Interactive Testing

### 7.1 Dashboard Functionality
With current sync status (green or orange):
1. Try interacting with dashboard widgets
2. Scroll through widgets
3. Try any edit/update features

**Checklist**:
- [ ] Dashboard responsive
- [ ] Widgets load properly
- [ ] No "Disconnected" errors
- [ ] No frozen/loading states
- [ ] Interactions work (click, scroll, etc.)

### 7.2 Network Resilience
1. Open DevTools Network tab
2. Notice if WebSocket connection exists
   - If yes: Green status expected
   - If no: Orange status (fallback) expected
3. Dashboard should work either way

**Checklist**:
- [ ] Works with WebSocket (if available)
- [ ] Works with HTTP fallback (if no WS)
- [ ] Both modes are functional

---

## Step 8: Error Scenarios

### 8.1 Test Missing Endpoint
If seeing red "Connection Error":
1. Verify `/api/realtime` endpoint exists
2. Check if server is running
3. Check auth requirements

**Checklist**:
- [ ] Endpoint accessible at /api/realtime
- [ ] Returns JSON response
- [ ] Auth not blocking access

### 8.2 Test Refresh
1. Refresh page (F5 or Cmd+R)
2. Wait for dashboard to load

**Checklist**:
- [ ] Page refreshes without errors
- [ ] Puter status preserved (if was signed in)
- [ ] Sync indicator resets properly
- [ ] No duplicate buttons/indicators

---

## Step 9: Cross-Browser Testing (Optional)

Test in different browsers:

### Chrome
- [ ] All features work
- [ ] No console errors
- [ ] Status indicator displays correctly

### Firefox
- [ ] All features work
- [ ] No console errors
- [ ] Status indicator displays correctly

### Safari
- [ ] All features work
- [ ] No console errors
- [ ] Status indicator displays correctly

---

## Step 10: Mobile Testing (Optional)

Test on mobile device or responsive mode:

1. Open DevTools → Toggle device toolbar
2. Test at:
   - [ ] iPhone size (375px)
   - [ ] iPad size (768px)
   - [ ] Android size (412px)

**Checklist**:
- [ ] Buttons are touch-friendly (44px+ height)
- [ ] No horizontal scrolling
- [ ] Status indicator visible
- [ ] All features work on mobile

---

## Console Message Reference

### Expected Messages (Safe to Ignore)

```
[useWebSocket] Auto-connect failed: WebSocket connection timeout
```
✅ Normal - fallback will activate

```
Error fetching WebSocket URL from API, using fallback
```
✅ Normal - will use HTTP polling

### Concerning Messages (Investigate)

```
Uncaught TypeError: Cannot read property 'puter' of undefined
```
❌ Puter SDK not loading - check CDN access

```
POST /api/realtime 401 Unauthorized
```
❌ Auth issue - check if user is authenticated

```
Cannot find module '@/contexts/puter-context'
```
❌ Import error - check file paths

---

## Final Verification

After all steps complete:

### Functionality Checklist
- [ ] Dashboard loads without errors
- [ ] Puter button/badge visible and working
- [ ] Can sign in with Puter
- [ ] Can sign out from Puter
- [ ] Sync indicator shows correct status
- [ ] Dashboard works in both WebSocket and fallback modes
- [ ] No "Disconnected" errors
- [ ] Responsive on desktop and mobile

### Code Quality Checklist
- [ ] No red errors in console
- [ ] No TypeScript compilation errors
- [ ] No missing modules or imports
- [ ] Components properly integrate

### User Experience Checklist
- [ ] Status is clear and visible
- [ ] Button placement is logical
- [ ] Actions have feedback (toasts)
- [ ] No confusing error messages
- [ ] Dashboard remains functional always

---

## If Issues Found

### Issue: Files Not Found
```bash
# Verify files exist
node test-dashboard-integration.js

# If failing, files may not have been created
# Re-run: DASHBOARD_PUTER_WEBSOCKET_INTEGRATION.md creation steps
```

### Issue: Import Errors
```
# Check file path in import
# Pattern: import { X } from '@/components/dashboard-puter-status'

# Verify:
# - File exists in correct location
# - Path alias '@/' maps correctly
# - No typos in filename
```

### Issue: Puter Not Initializing
```
# Check if https://js.puter.com/v2/ is accessible
# Look in console for specific error
# Verify internet connection
# Try hard refresh (Ctrl+Shift+R)
```

### Issue: Fallback Not Activating
```
# Check if /api/realtime endpoint exists
# Verify POST endpoint works
# Check server logs for errors
# Try:
#   curl http://localhost:3000/api/realtime
```

---

## Sign Off

When all items are checked:

**Date**: ___________
**Tester**: ___________
**Browser/Device**: ___________
**Status**: 

- [ ] ✅ All tests passed - Ready for production
- [ ] ⚠️ Minor issues found - List below:
  ```
  
  
  ```
- [ ] ❌ Major issues found - List below:
  ```
  
  
  ```

---

## Quick Reference

| Status | Color | Meaning | Action |
|--------|-------|---------|--------|
| Synced | 🟢 | WebSocket connected | None |
| Syncing | 🔵 | Operations pending | Wait |
| Polling | 🟠 | HTTP fallback active | None (normal) |
| Disconnected | 🟡 | Retrying connection | Wait |
| Error | 🔴 | Connection failed | Troubleshoot |
| Initializing | ⚪ | Starting up | Wait |

---

**Last Updated**: 2025-11-29  
**Status**: Ready for testing  
**Estimated Time**: 15-20 minutes
