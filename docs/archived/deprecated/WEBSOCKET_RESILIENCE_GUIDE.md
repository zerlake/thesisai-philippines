# WebSocket Resilience Guide

This guide explains how the dashboard now handles WebSocket connection failures gracefully with improved error handling, exponential backoff retry logic, and offline mode support.

## Overview

The WebSocket implementation now includes three key improvements:

1. **Better Error Handling** - Extracts meaningful error information from empty WebSocket error events
2. **Exponential Backoff Retries** - Intelligently retries with increasing delays and jitter
3. **Offline Mode** - Dashboard remains functional even when real-time connection fails

## Components

### 1. WebSocketManager Enhancements

**File**: `src/lib/dashboard/websocket-manager.ts`

#### New Features:
- `extractErrorInfo()` - Safely extracts error details from WebSocket events
- Improved `attemptReconnect()` - Exponential backoff with jitter (capped at 30 seconds)
- Better logging - Tracks reconnection attempts and reasons
- `connectionFailed` event - Emitted when max retries exceeded

#### Configuration:
```typescript
const manager = new WebSocketManager(url, {
  reconnectAttempts: 5,           // Max retry attempts
  reconnectDelay: 1000,           // Initial delay in ms
  reconnectBackoffMultiplier: 2,  // Backoff multiplier
  heartbeatInterval: 30000,       // Health check interval
  messageTimeout: 10000           // Message timeout
});
```

#### Delay Calculation:
```
delay = min(
  baseDelay * (2 ^ attemptNumber) + random(0, 1000),
  30000  // 30 second cap
)
```

### 2. useWebSocketWithFallback Hook

**File**: `src/hooks/useWebSocketWithFallback.ts`

A React hook that manages WebSocket connections with graceful degradation.

#### Usage:
```typescript
import { useWebSocketWithFallback } from '@/hooks/useWebSocketWithFallback';

export function MyDashboard() {
  const {
    isConnected,
    isReconnecting,
    isOfflineMode,
    error,
    connectionAttempts,
    manager,
    reconnect,
    disconnect
  } = useWebSocketWithFallback({
    url: 'ws://api.example.com/dashboard',
    reconnectAttempts: 5,
    offlineMode: true, // Allow offline operation
    onError: (error) => {
      console.log(`Error: ${error.message} (attempt ${error.attemptNumber}/${error.maxAttempts})`);
    },
    onConnectionFailed: (reason) => {
      console.log(`Connection failed: ${reason}`);
    }
  });

  return (
    <>
      <WebSocketStatusBanner
        isConnected={isConnected}
        isReconnecting={isReconnecting}
        isOfflineMode={isOfflineMode}
        error={error}
        onReconnect={reconnect}
      />
      
      <ResilientDashboardSection
        title="Analytics"
        isOfflineMode={isOfflineMode}
        fallbackContent={<CachedAnalytics />}
      >
        <LiveAnalytics manager={manager} />
      </ResilientDashboardSection>
    </>
  );
}
```

#### Return Values:
- `isConnected` - WebSocket is connected and ready
- `isReconnecting` - Currently attempting to reconnect
- `isOfflineMode` - Max retries exceeded, using offline mode
- `error` - Current error information
- `connectionAttempts` - Number of reconnection attempts
- `manager` - WebSocketManager instance for sending messages
- `reconnect()` - Manual reconnect function
- `disconnect()` - Disconnect the WebSocket

### 3. WebSocketStatusBanner Component

**File**: `src/components/websocket-status-banner.tsx`

Displays connection status to users with retry options.

#### Features:
- Shows reconnection attempts and progress
- Displays offline mode indicator
- Manual reconnect button when available
- Dismissible alert UI
- Different styling for different states (error, reconnecting, offline)

#### Usage:
```typescript
<WebSocketStatusBanner
  isConnected={isConnected}
  isReconnecting={isReconnecting}
  isOfflineMode={isOfflineMode}
  error={error}
  onReconnect={reconnect}
/>
```

### 4. ResilientDashboardSection Component

**File**: `src/components/resilient-dashboard-section.tsx`

Wraps dashboard content with fallback support.

#### Features:
- Shows cached content when offline
- Displays connection status indicators
- Loading states and skeleton placeholders
- Error messaging

#### Usage:
```typescript
<ResilientDashboardSection
  title="Live Widgets"
  description="Real-time dashboard metrics"
  isOfflineMode={isOfflineMode}
  error={error?.message}
  fallbackContent={<CachedWidgets />}
>
  <LiveWidgets manager={manager} />
</ResilientDashboardSection>
```

## Error Handling Flow

```
WebSocket Error Event
        ↓
    extractErrorInfo() - Safely parse event
        ↓
    Emit 'error' event with details
        ↓
    attemptReconnect() - Schedule retry with backoff
        ↓
    Is attempt < maxAttempts?
        ├─ Yes → Wait and retry with exponential delay
        │
        └─ No → Emit 'connectionFailed' event
                    ↓
                Switch to offline mode (if enabled)
                    ↓
                Show fallback UI
```

## Reconnection Strategy

1. **Initial Delay**: 1000ms (configurable)
2. **Exponential Backoff**: Delay × 2^(attempt-1)
3. **Jitter**: Add random 0-1000ms to prevent thundering herd
4. **Maximum Delay**: Capped at 30 seconds
5. **Maximum Attempts**: 5 by default (configurable)

### Example Retry Schedule (5 attempts):
- Attempt 1: ~1000-2000ms
- Attempt 2: ~2000-3000ms
- Attempt 3: ~4000-5000ms
- Attempt 4: ~8000-9000ms
- Attempt 5: ~16000-17000ms
- After 5: Switch to offline mode (~27-38 seconds total)

## Offline Mode Best Practices

### When to Enable Offline Mode:
- Dashboard displays mostly static/cached content
- Real-time updates are "nice to have" but not critical
- You want the app to remain usable during connection issues

### When to Disable Offline Mode:
- Real-time updates are critical for functionality
- Content must always be up-to-date
- Offline fallbacks don't make sense for your use case

### Implementation:
```typescript
// Enable offline mode
const { isOfflineMode } = useWebSocketWithFallback({
  url: 'ws://...',
  offlineMode: true  // ← Set this
});

// Use cached data when offline
{isOfflineMode ? <CachedData /> : <LiveData />}
```

## Event System

The WebSocketManager emits several events:

### Connected Event
```typescript
manager.on('connected', () => {
  console.log('WebSocket connected');
  // Resume real-time updates
});
```

### Error Event
```typescript
manager.on('error', (errorInfo) => {
  // errorInfo = {
  //   message: string
  //   code?: string
  //   isRetryable: boolean
  //   attemptNumber: number
  //   maxAttempts: number
  // }
});
```

### ConnectionFailed Event
```typescript
manager.on('connectionFailed', (failureInfo) => {
  // failureInfo = {
  //   reason: 'max_attempts_reached' | 'reconnect_failed'
  //   attempts?: number
  //   error?: string
  // }
});
```

### State Change Event
```typescript
manager.on('stateChange', (state: ConnectionState) => {
  // state = DISCONNECTED | CONNECTING | CONNECTED | RECONNECTING | ERROR
});
```

## Troubleshooting

### WebSocket Connection Errors in Development

**Common Causes:**
1. WebSocket server is not running
2. Wrong WebSocket URL
3. CORS/Same-origin policy blocking connection
4. Firewall or network proxy blocking WebSocket protocol

**Solution:**
- Check WebSocket server is accessible
- Enable offline mode during development: `offlineMode: true`
- Monitor browser console for detailed error messages

### Empty WebSocket Error Events

The improved `extractErrorInfo()` method handles empty error events by:
1. Checking if event object exists
2. Extracting any available properties (message, reason, code)
3. Including WebSocket context (readyState, URL)
4. Providing fallback messages

### High Reconnection Attempt Counts

**Cause:** Network intermittency or WebSocket server issues

**Solutions:**
1. Increase `reconnectAttempts` if you have time
2. Increase `reconnectDelay` for more stable networks
3. Check server logs for connection issues
4. Enable offline mode fallback UI

## Performance Considerations

1. **Memory**: WebSocketManager queues messages - clear queue on disconnect
2. **CPU**: Exponential backoff prevents connection storms
3. **Network**: Jitter prevents thundering herd problem
4. **Battery**: Use reasonable heartbeat intervals (30s default)

## Migration Guide

### From Old WebSocketManager to New Version

Old code:
```typescript
const manager = new WebSocketManager(url);
manager.on('error', (event) => {
  // event was raw browser event - often empty
});
```

New code:
```typescript
const manager = new WebSocketManager(url);
manager.on('error', (errorInfo) => {
  // errorInfo has message, code, isRetryable, etc.
  console.log(`Error: ${errorInfo.message}`);
});
manager.on('connectionFailed', (reason) => {
  // Triggered when max retries exceeded
  console.log(`Failed to connect: ${reason}`);
});
```

Use the hook for easier management:
```typescript
const { isConnected, isOfflineMode, error, reconnect } = useWebSocketWithFallback({
  url,
  offlineMode: true
});
```

## Monitoring & Logging

Enable detailed logging in development:
```typescript
const isDev = process.env.NODE_ENV !== 'production';
// WebSocketManager logs detailed info in development
// Set to info level to reduce noise in production
```

## Related Files

- `src/lib/dashboard/websocket-manager.ts` - Core WebSocket manager
- `src/hooks/useWebSocketWithFallback.ts` - React hook wrapper
- `src/components/websocket-status-banner.tsx` - Status UI
- `src/components/resilient-dashboard-section.tsx` - Resilient sections
