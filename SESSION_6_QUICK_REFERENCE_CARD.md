# Session 6: Quick Reference Card

**Print or bookmark this page**

---

## 📍 Start Here

**Just arrived?** → Read `SESSION_6_FINAL_SUMMARY.md` (10 min)  
**Need to install?** → Follow `PHASE_5_SESSION_6_WEBSOCKET_SETUP.md`  
**Integrating now?** → Use `SESSION_6_NEXT_STEPS_DASHBOARD_INTEGRATION.md`

---

## ⚡ 5-Minute Setup

```bash
# 1. Install packages
npm install ws @types/ws

# 2. Create .env.local
echo "NEXT_PUBLIC_WS_URL=ws://localhost:3000/api/realtime" > .env.local

# 3. Start server
npm run dev

# 4. Test in browser console
const ws = new WebSocket('ws://localhost:3000/api/realtime?userId=test');
ws.onopen = () => console.log('✓ Connected!');
```

---

## 🔗 Key URLs

| Resource | URL/Location |
|----------|------------|
| WebSocket | `ws://localhost:3000/api/realtime` |
| Health API | `http://localhost:3000/api/realtime` |
| Sync API | `POST http://localhost:3000/api/realtime` |

---

## 📦 Files Created Today

| File | Purpose | Lines |
|------|---------|-------|
| `src/app/api/realtime/route.ts` | REST API | 250 |
| `src/lib/realtime-server.ts` | WebSocket server | 850 |
| `src/lib/realtime-init.ts` | Initialization | 150 |
| `server.ts` | Custom Next.js server | 80 |

---

## 🧬 Component Props

### DashboardRealtimeProvider
```tsx
<DashboardRealtimeProvider
  wsUrl="ws://localhost:3000/api/realtime"
  autoConnect={true}
  onInitialized={() => console.log('Ready')}
>
```

### DashboardSyncIndicator
```tsx
<DashboardSyncIndicator 
  showDetails={true}
  onStatusChange={(status) => {}}
/>
```

### PendingOperationsBadge
```tsx
<PendingOperationsBadge
  showDetails={true}
  maxDisplay={5}
  onOperationComplete={(opId) => {}}
  onOperationFail={(opId, error) => {}}
/>
```

### ConflictResolutionUI
```tsx
<ConflictResolutionUI
  autoResolve={false}
  onConflictResolved={(opId, choice) => {}}
/>
```

### WidgetRealtime
```tsx
<WidgetRealtime
  widgetId="unique-id"
  enableOptimistic={true}
  onUpdate={(data) => {}}
  onError={(error) => {}}
  onSync={() => {}}
>
```

---

## 📝 Integration Checklist

- [ ] Install `ws` package
- [ ] Create `.env.local`
- [ ] Start server with `npm run dev`
- [ ] Test WebSocket in console
- [ ] Wrap Dashboard with provider
- [ ] Add indicators to header
- [ ] Wrap widgets
- [ ] Test real-time updates
- [ ] Test offline mode
- [ ] Commit changes

---

## 🧪 Testing Commands

### Browser Console
```javascript
// Create connection
const ws = new WebSocket('ws://localhost:3000/api/realtime?userId=test');

// Handle messages
ws.onopen = () => console.log('✓ Connected');
ws.onmessage = (e) => console.log('Message:', JSON.parse(e.data));
ws.onerror = (e) => console.error('✗ Error:', e);
ws.onclose = () => console.log('✗ Closed');

// Send ping
ws.send(JSON.stringify({
  type: 'PING',
  id: 'test-1',
  timestamp: new Date(),
  userId: 'test',
  payload: {}
}));
```

### REST Endpoints
```bash
# Health check
curl http://localhost:3000/api/realtime

# Sync fallback
curl -X POST http://localhost:3000/api/realtime \
  -H "Content-Type: application/json" \
  -d '{"type":"SYNC","operations":[]}'
```

---

## 📄 Documentation Map

| When You Need | Read This |
|---------------|-----------|
| Overview | SESSION_6_FINAL_SUMMARY.md |
| Setup help | PHASE_5_SESSION_6_WEBSOCKET_SETUP.md |
| Integration | SESSION_6_NEXT_STEPS_DASHBOARD_INTEGRATION.md |
| Component API | PHASE_5_SESSION_6_INTEGRATION_QUICK_REFERENCE.md |
| Server details | SESSION_6_WEBSOCKET_SERVER_COMPLETE.md |
| Architecture | SESSION_6_FINAL_SUMMARY.md (Architecture section) |
| Troubleshooting | PHASE_5_SESSION_6_WEBSOCKET_SETUP.md (Troubleshooting) |

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Cannot find module 'ws'" | `npm install ws @types/ws` |
| WebSocket won't connect | Check URL in .env.local, verify server running |
| "Provider not found" | Make sure Dashboard is wrapped with DashboardRealtimeProvider |
| No sync indicators | Verify provider is at layout level, not page level |
| Widgets not updating | Make sure WidgetRealtime wrapper has unique widgetId |
| Memory issues | Check for proper cleanup in useEffect |

---

## ⌨️ Common Commands

```bash
# Install dependencies
npm install ws @types/ws

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Check types
npx tsc --noEmit

# Lint
npm run lint
```

---

## 🔄 Integration Pattern

```
Dashboard Layout
  ↓
<DashboardRealtimeProvider>
  ↓
Dashboard Page
  ├─ <DashboardSyncIndicator />
  ├─ <PendingOperationsBadge />
  ├─ <ConflictResolutionUI />
  └─ Widgets
     └─ <WidgetRealtime>
        └─ <YourWidget />
```

---

## 💡 Key Concepts

**WebSocket**: Real-time, bidirectional communication  
**Optimistic Update**: Show change immediately, sync later  
**Pending Operation**: Change awaiting server confirmation  
**Conflict**: Different values on client and server  
**Background Sync**: Sync queued changes when online  
**Offline Queue**: Store changes when no connection  

---

## 📊 Message Types

| Type | Direction | Purpose |
|------|-----------|---------|
| PING | Server→Client | Keep-alive check |
| PONG | Client→Server | Keep-alive response |
| WIDGET_UPDATE | Client→Server | Update widget data |
| SYNC_UPDATE | Client→Server | Sync pending ops |
| ACK | Server→Client | Received message |
| CONFLICT_DETECTED | Server→Client | Values differ |

---

## 🎯 Success Indicators

✓ Server running without errors  
✓ WebSocket connects in browser console  
✓ Indicators show connected status  
✓ Making changes shows pending badge  
✓ Changes sync to server  
✓ Offline mode queues changes  
✓ Reconnect syncs pending changes  
✓ No console errors  

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Installation | 5 min |
| Server startup | 2 min |
| Testing connection | 5 min |
| Dashboard integration | 45 min |
| Widget wrapping | 30 min |
| Testing | 30 min |
| **Total** | **~2 hours** |

---

## 📞 Quick Help

**Server not starting?**  
→ Check port 3000 isn't in use, check error message  

**WebSocket not connecting?**  
→ Check NEXT_PUBLIC_WS_URL in .env.local  

**Components not showing?**  
→ Verify provider wraps Dashboard layout  

**Widgets not syncing?**  
→ Check widgetId is unique, onUpdate handler defined  

**Memory usage growing?**  
→ Check cleanup functions in useEffect  

---

## 🔒 Security Reminders

- [ ] Verify user ID before accepting connections
- [ ] Validate message format
- [ ] Implement rate limiting
- [ ] Use JWT tokens in production
- [ ] Encrypt sensitive data
- [ ] Add permission checks

---

## 🎓 Next Learning Steps

1. Read `SESSION_6_FINAL_SUMMARY.md` (overview)
2. Follow setup guide (installation)
3. Test connection in browser
4. Read integration guide (dashboard work)
5. Implement step by step
6. Test with multiple scenarios

---

## 💾 Commit Template

```
Session 6: Integrate real-time dashboard

- Installed ws package
- Created .env.local configuration
- Started WebSocket server
- Wrapped Dashboard with DashboardRealtimeProvider
- Added DashboardSyncIndicator to header
- Added PendingOperationsBadge
- Added ConflictResolutionUI
- Wrapped widgets with WidgetRealtime
- Tested WebSocket connection
- Verified real-time updates working
- Tested offline scenarios
- Verified multi-tab sync

Phase 5: 65% → 80% complete
```

---

## 📈 Progress

```
Phase 5 Progress:
├─ Sessions 1-3: API         45% ✅
├─ Sessions 4-5: UI          50% ✅
├─ Session 6: Real-time      65% ✅ (complete)
└─ Session 7+: Advanced      80%+

Session 6 Complete:
├─ Foundation                55% ✅
├─ Integration UI            60% ✅
└─ WebSocket Server          65% ✅
```

---

## 🚀 Ready to Begin?

1. **Terminal**: Install packages, start server
2. **Browser**: Test connection
3. **Code**: Integrate components
4. **Testing**: Verify functionality
5. **Commit**: Save your work

---

**Estimated Time to Complete**: 2-3 hours  
**Difficulty**: Moderate  
**Status**: Ready to implement  

---

**Created**: November 24, 2024  
**Last Updated**: Today  
**Version**: 1.0

