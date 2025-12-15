# Phase 5 Session 6: Integration Quick Reference

**Status**: Foundation + Integration Complete ✅  
**Phase Progress**: 45% → 60% (↑15%)  
**Files Created**: 13 total (8 foundation + 5 integration)

---

## 🚀 5-Minute Setup

### 1. Wrap Dashboard with Provider
```tsx
// src/app/dashboard/layout.tsx
import { DashboardRealtimeProvider } from '@/components/dashboard/DashboardRealtimeProvider';

export default function DashboardLayout({ children }) {
  return (
    <DashboardRealtimeProvider
      wsUrl={process.env.NEXT_PUBLIC_WS_URL || 'wss://localhost:3000/api/realtime'}
      autoConnect={true}
      onError={(err) => console.error('Realtime error:', err)}
    >
      {children}
    </DashboardRealtimeProvider>
  );
}
```

### 2. Add Status Indicators to Header
```tsx
// src/app/dashboard/page.tsx
import { DashboardSyncIndicator } from '@/components/dashboard/DashboardSyncIndicator';
import { PendingOperationsBadge } from '@/components/dashboard/PendingOperationsBadge';
import { ConflictResolutionUI } from '@/components/dashboard/ConflictResolutionUI';

export default function Dashboard() {
  return (
    <>
      {/* Header bar */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <h1>Dashboard</h1>
        <div className="flex items-center gap-4">
          <DashboardSyncIndicator showDetails={true} />
          <PendingOperationsBadge />
        </div>
      </div>

      {/* Conflict UI (renders only when conflicts exist) */}
      <ConflictResolutionUI />

      {/* Rest of dashboard */}
    </>
  );
}
```

### 3. Wrap Widgets with Real-time
```tsx
// For any existing widget component
import { WidgetRealtime } from '@/components/dashboard/WidgetRealtime';

<WidgetRealtime 
  widgetId="your-widget-id"
  enableOptimistic={true}
  onUpdate={(data) => updateWidget(data)}
  onError={(error) => console.error(error)}
>
  <YourWidgetComponent />
</WidgetRealtime>
```

Done! Your dashboard now has:
- ✅ Real-time synchronization
- ✅ Optimistic updates
- ✅ Conflict detection
- ✅ Status indicators
- ✅ Error recovery

---

## 📁 Files Created

### Foundation (Session 6 - Already Built)
```
src/lib/dashboard/
├── websocket-manager.ts       (260 lines)
├── realtime-state.ts          (310 lines)
├── background-sync.ts         (280 lines)
├── update-processor.ts        (240 lines)
└── realtime-config.ts         (320 lines)

src/hooks/
├── useWebSocket.ts            (300 lines)
├── useRealtimeUpdates.ts      (350 lines)
└── useBackgroundSync.ts       (320 lines)
```

### Integration (This Implementation)
```
src/components/dashboard/
├── DashboardSyncIndicator.tsx     (150 lines)
├── PendingOperationsBadge.tsx     (200 lines)
├── ConflictResolutionUI.tsx       (220 lines)
├── DashboardRealtimeProvider.tsx  (180 lines)
└── WidgetRealtime.tsx             (210 lines)
```

---

## 🔌 Component API Reference

### DashboardSyncIndicator
```tsx
<DashboardSyncIndicator
  className?: string
  showDetails?: boolean              // Show expandable status
  onStatusChange?: (status) => void  // Called when status changes
/>
```

### PendingOperationsBadge
```tsx
<PendingOperationsBadge
  className?: string
  showDetails?: boolean                    // Show operation list
  maxDisplay?: number                      // Max ops to show (default: 5)
  onOperationComplete?: (opId) => void
  onOperationFail?: (opId, error) => void
/>
```

### ConflictResolutionUI
```tsx
<ConflictResolutionUI
  className?: string
  autoResolve?: boolean                       // Auto-resolve conflicts
  onConflictResolved?: (opId, choice) => void
  onConflictDismissed?: (opId) => void
/>
```

### DashboardRealtimeProvider
```tsx
<DashboardRealtimeProvider
  wsUrl?: string                        // WebSocket URL
  autoConnect?: boolean                 // Auto-connect on mount
  onError?: (error) => void
  onInitialized?: () => void
>
  {children}
</DashboardRealtimeProvider>
```

### WidgetRealtime
```tsx
<WidgetRealtime
  widgetId: string                      // Unique widget ID
  className?: string
  enableOptimistic?: boolean            // Enable optimistic updates
  onUpdate?: (data) => void            // Called with updated data
  onError?: (error) => void            // Called on error
  onSync?: () => void                  // Called when sync completes
>
  {children}
</WidgetRealtime>
```

---

## 🎯 Common Use Cases

### 1. Update a Widget Value Optimistically
```tsx
const { update, confirm, rollback } = useRealtimeUpdates(stateManager);

async function updateWidget(newValue) {
  const opId = update('WIDGET_UPDATE', { newValue });
  
  try {
    const response = await fetch(`/api/widgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ value: newValue })
    });
    
    confirm(opId, await response.json());
  } catch (error) {
    rollback(opId);
  }
}
```

### 2. Manually Sync When Needed
```tsx
const { syncManager } = useRealtimeManagers();

// Trigger manual sync
await syncManager.syncPending();
```

### 3. Watch Connection Status
```tsx
const { isConnected, error } = useWebSocket({ autoConnect: true });

useEffect(() => {
  if (isConnected) {
    console.log('Connected to realtime server');
  } else if (error) {
    console.error('Connection error:', error.message);
  }
}, [isConnected, error]);
```

### 4. Handle Conflicts Manually
```tsx
const { conflicts, resolveConflict } = useRealtimeUpdates(stateManager);

useEffect(() => {
  conflicts?.forEach(conflict => {
    // Prefer remote value in this case
    resolveConflict(conflict.operationId, 'remote');
  });
}, [conflicts, resolveConflict]);
```

---

## 🔧 Configuration

### Default Configuration
Located in `src/lib/dashboard/realtime-config.ts`:

```typescript
// WebSocket
WEBSOCKET_CONFIG = {
  url: 'wss://localhost:3000/api/realtime',
  reconnectAttempts: 5,
  reconnectDelay: 1000,
  maxMessageQueueSize: 1000
}

// Real-time State
REALTIME_STATE_CONFIG = {
  maxPendingOperations: 100,
  operationTimeout: 30000,
  enableConflictDetection: true
}

// Background Sync
BACKGROUND_SYNC_CONFIG = {
  syncInterval: 30000,
  maxQueueSize: 500,
  retryAttempts: 3,
  retryDelay: 5000
}
```

### Custom Configuration
```tsx
// Override in your layout
<DashboardRealtimeProvider
  wsUrl="wss://custom-server.com/realtime"
>
  {/* your content */}
</DashboardRealtimeProvider>
```

---

## ❌ Common Issues & Fixes

### Issue: "useRealtimeManagers must be used within DashboardRealtimeProvider"
**Fix**: Wrap your component tree with DashboardRealtimeProvider at the layout level

### Issue: WebSocket not connecting
**Fix**: Check WebSocket URL is correct and server is running

### Issue: Operations not syncing
**Fix**: Verify you're calling `confirm()` after server response

### Issue: Conflicts not resolving
**Fix**: Check that `resolveConflict()` is being called with correct operation ID

### Issue: Memory usage growing
**Fix**: Ensure component cleanup - check useEffect return functions

---

## 📊 Type Definitions

### SyncStatus
```typescript
interface SyncStatus {
  isConnected: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncTime?: Date;
  error?: string;
  queueSize: number;
}
```

### ConflictData
```typescript
interface ConflictData {
  operationId: string;
  type: string;
  localValue: any;
  remoteValue: any;
  timestamp: Date;
  retryCount: number;
}
```

### RealtimeContextType
```typescript
interface RealtimeContextType {
  wsManager: WebSocketManager | null;
  stateManager: RealtimeStateManager | null;
  syncManager: BackgroundSyncManager | null;
  updateProcessor: UpdateProcessor | null;
  isInitialized: boolean;
  error?: Error;
}
```

---

## 🧪 Testing

### Unit Test Template
```typescript
import { render, screen } from '@testing-library/react';
import { DashboardSyncIndicator } from '@/components/dashboard/DashboardSyncIndicator';

describe('DashboardSyncIndicator', () => {
  it('renders connected status', () => {
    render(<DashboardSyncIndicator />);
    // Test implementation
  });

  it('shows pending operations count', () => {
    render(<DashboardSyncIndicator />);
    // Test implementation
  });
});
```

### Integration Test Template
```typescript
import { render } from '@testing-library/react';
import { DashboardRealtimeProvider } from '@/components/dashboard/DashboardRealtimeProvider';
import { Dashboard } from '@/app/dashboard';

describe('Dashboard Realtime Integration', () => {
  it('initializes realtime systems', async () => {
    render(
      <DashboardRealtimeProvider>
        <Dashboard />
      </DashboardRealtimeProvider>
    );
    // Test implementation
  });
});
```

---

## 📈 Next Steps

1. **Copy Files**: Copy all 5 integration components to your project
2. **Setup Provider**: Wrap dashboard with DashboardRealtimeProvider
3. **Add Indicators**: Add DashboardSyncIndicator and badges to UI
4. **Wrap Widgets**: Wrap widgets with WidgetRealtime
5. **Create WebSocket Server**: Implement `/api/realtime` endpoint
6. **Test Integration**: Run integration tests
7. **Monitor Performance**: Check performance metrics

---

## 🎓 Documentation Files

- **PHASE_5_SESSION_6_PLAN.md** - Detailed implementation plan
- **PHASE_5_SESSION_6_QUICKSTART.md** - Foundation quick start
- **PHASE_5_SESSION_6_STATUS.md** - Foundation status & progress
- **PHASE_5_SESSION_6_INTEGRATION_COMPLETE.md** - Complete integration guide
- **PHASE_5_SESSION_6_INTEGRATION_QUICK_REFERENCE.md** - This file

---

## 💾 Ready to Commit

```bash
git add src/components/dashboard/DashboardSyncIndicator.tsx
git add src/components/dashboard/PendingOperationsBadge.tsx
git add src/components/dashboard/ConflictResolutionUI.tsx
git add src/components/dashboard/DashboardRealtimeProvider.tsx
git add src/components/dashboard/WidgetRealtime.tsx
git add PHASE_5_SESSION_6_INTEGRATION_COMPLETE.md
git add PHASE_5_SESSION_6_INTEGRATION_QUICK_REFERENCE.md

git commit -m "Session 6: Add real-time integration UI components

Components:
- DashboardSyncIndicator: Connection status with live updates
- PendingOperationsBadge: Operation tracking and retry interface
- ConflictResolutionUI: Conflict detection and resolution UI
- DashboardRealtimeProvider: Context provider for realtime systems
- WidgetRealtime: Per-widget realtime wrapper with optimistic updates

Ready for dashboard integration. Phase 5: 60% complete"
```

---

## ✨ Session 6: Complete ✅

- Foundation: 8 files (~2,380 lines) ✅
- Integration: 5 files (~960 lines) ✅
- Total: 13 files (~3,340 lines) ✅
- Documentation: 5 files ✅

**Next**: Dashboard integration + WebSocket server implementation

---

Last Updated: November 24, 2024  
Status: Ready for Implementation  
Phase Progress: 45% → 60%
