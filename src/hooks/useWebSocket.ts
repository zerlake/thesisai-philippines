/**
 * useWebSocket Hook
 * 
 * React hook for managing WebSocket connections.
 * Features:
 * - Automatic connection/disconnection
 * - Message subscription
 * - Connection state tracking
 * - Error handling
 * - Auto-cleanup
 * 
 * @module hooks/useWebSocket
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import {
  WebSocketManager,
  MessageType,
  ConnectionState,
  WebSocketMessage,
  getWebSocketManager,
  resetWebSocketManager
} from '@/lib/dashboard/websocket-manager';

/**
 * WebSocket hook options
 */
interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: any) => void;
  onStateChange?: (state: ConnectionState) => void;
}

/**
 * WebSocket hook return type
 */
interface UseWebSocketReturn {
  state: ConnectionState;
  isConnected: boolean;
  send: (type: MessageType, data?: Record<string, any>) => string;
  request: (type: MessageType, data?: Record<string, any>) => Promise<WebSocketMessage>;
  subscribe: (type: MessageType, handler: (msg: WebSocketMessage) => void) => () => void;
  connect: () => Promise<void>;
  disconnect: () => void;
  manager: WebSocketManager;
}

/**
 * useWebSocket Hook
 * 
 * Manages WebSocket connection for real-time updates.
 * 
 * @example
 * ```typescript
 * const { isConnected, send, subscribe } = useWebSocket({
 *   url: 'ws://localhost:3000/ws',
 *   autoConnect: true,
 *   onConnected: () => console.log('Connected!')
 * });
 * 
 * // Send message
 * send(MessageType.WIDGET_UPDATE, { widgetId: 'widget-1' });
 * 
 * // Subscribe to updates
 * const unsubscribe = subscribe(MessageType.WIDGET_UPDATE, (msg) => {
 *   console.log('Widget updated:', msg.data);
 * });
 * ```
 */
export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/ws',
    autoConnect = true,
    onConnected,
    onDisconnected,
    onError,
    onStateChange
  } = options;

  const managerRef = useRef<WebSocketManager | null>(null);
  const [state, setState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const unsubscribesRef = useRef<Array<() => void>>([]);

  // Initialize manager
  useEffect(() => {
    try {
      if (!managerRef.current) {
        managerRef.current = getWebSocketManager(url);
      }
    } catch (error) {
      // Manager might already be initialized
      managerRef.current = getWebSocketManager();
    }

    return () => {
      // Cleanup subscriptions
      unsubscribesRef.current.forEach((unsub) => unsub());
      unsubscribesRef.current = [];
    };
  }, [url]);

  // Setup event listeners
  useEffect(() => {
    if (!managerRef.current) return;

    const manager = managerRef.current;

    // State change listener
    const unsubscribeStateChange = manager.subscribe('stateChange' as any, (newState) => {
      setState(newState);
      onStateChange?.(newState);

      if (newState === ConnectionState.CONNECTED) {
        onConnected?.();
      } else if (newState === ConnectionState.DISCONNECTED) {
        onDisconnected?.();
      }
    });

    // Error listener
    const unsubscribeError = manager.subscribe('error' as any, (error) => {
      onError?.(error);
    });

    unsubscribesRef.current.push(unsubscribeStateChange, unsubscribeError);

    return () => {
      unsubscribeStateChange();
      unsubscribeError();
    };
  }, [onConnected, onDisconnected, onError, onStateChange]);

  // Auto-connect if enabled
  useEffect(() => {
    if (!autoConnect || !managerRef.current) return;

    const manager = managerRef.current;

    if (manager.getState() === ConnectionState.DISCONNECTED) {
      manager.connect().catch((error) => {
        console.error('[useWebSocket] Auto-connect failed:', error);
        onError?.(error);
      });
    }

    return () => {
      // Optional: disconnect on unmount
      // manager.disconnect();
    };
  }, [autoConnect, onError]);

  /**
   * Send message
   */
  const send = useCallback(
    (type: MessageType, data?: Record<string, any>): string => {
      if (!managerRef.current) {
        throw new Error('WebSocket manager not initialized');
      }

      return managerRef.current.send(type, data);
    },
    []
  );

  /**
   * Send request and wait for response
   */
  const request = useCallback(
    async (
      type: MessageType,
      data?: Record<string, any>
    ): Promise<WebSocketMessage> => {
      if (!managerRef.current) {
        throw new Error('WebSocket manager not initialized');
      }

      return managerRef.current.request(type, data);
    },
    []
  );

  /**
   * Subscribe to message type
   */
  const subscribe = useCallback(
    (type: MessageType, handler: (msg: WebSocketMessage) => void): (() => void) => {
      if (!managerRef.current) {
        throw new Error('WebSocket manager not initialized');
      }

      return managerRef.current.subscribe(type, handler);
    },
    []
  );

  /**
   * Connect manually
   */
  const connect = useCallback(async () => {
    if (!managerRef.current) {
      throw new Error('WebSocket manager not initialized');
    }

    await managerRef.current.connect();
  }, []);

  /**
   * Disconnect manually
   */
  const disconnect = useCallback(() => {
    if (!managerRef.current) {
      throw new Error('WebSocket manager not initialized');
    }

    managerRef.current.disconnect();
  }, []);

  return {
    state,
    isConnected: state === ConnectionState.CONNECTED,
    send,
    request,
    subscribe,
    connect,
    disconnect,
    manager: managerRef.current!
  };
}

/**
 * useWebSocketMessage Hook
 * 
 * Subscribe to a specific message type.
 * 
 * @example
 * ```typescript
 * const messages = useWebSocketMessage(MessageType.WIDGET_UPDATE);
 * 
 * useEffect(() => {
 *   if (messages) {
 *     console.log('Widget updated:', messages.data);
 *   }
 * }, [messages]);
 * ```
 */
export function useWebSocketMessage(
  type: MessageType,
  options: { url?: string } = {}
): WebSocketMessage | null {
  const [message, setMessage] = useState<WebSocketMessage | null>(null);
  const { subscribe } = useWebSocket({ url: options.url, autoConnect: true });

  useEffect(() => {
    const unsubscribe = subscribe(type, (msg) => {
      setMessage(msg);
    });

    return unsubscribe;
  }, [type, subscribe]);

  return message;
}

/**
 * useWebSocketState Hook
 * 
 * Track WebSocket connection state.
 * 
 * @example
 * ```typescript
 * const state = useWebSocketState();
 * 
 * return <div>Status: {state}</div>;
 * ```
 */
export function useWebSocketState(options: { url?: string } = {}): ConnectionState {
  const { state } = useWebSocket({ url: options.url, autoConnect: true });
  return state;
}

/**
 * useWebSocketRequest Hook
 * 
 * Send request and get response.
 * 
 * @example
 * ```typescript
 * const { send, loading, error, response } = useWebSocketRequest(
 *   MessageType.SYNC_REQUEST
 * );
 * 
 * const handleSync = async () => {
 *   await send({ syncId: 'sync-1' });
 * };
 * ```
 */
export function useWebSocketRequest(type: MessageType, options: { url?: string } = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [response, setResponse] = useState<WebSocketMessage | null>(null);
  const { request } = useWebSocket({ url: options.url, autoConnect: true });

  const send = useCallback(
    async (data?: Record<string, any>) => {
      setLoading(true);
      setError(null);

      try {
        const result = await request(type, data);
        setResponse(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [request, type]
  );

  return {
    send,
    loading,
    error,
    response
  };
}
