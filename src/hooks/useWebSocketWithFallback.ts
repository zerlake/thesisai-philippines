'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseWebSocketWithFallbackOptions {
  url?: string;
  autoConnect?: boolean;
  enableFallbackSync?: boolean;
  fallbackSyncInterval?: number;
  onError?: (error: Error) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

interface WebSocketWithFallbackReturn {
  isConnected: boolean;
  isFallbackMode: boolean;
  error: Error | null;
  send: (data: any) => Promise<void>;
  isReady: boolean;
}

/**
 * Hook that provides WebSocket connection with graceful fallback to HTTP polling
 * When WebSocket is unavailable, automatically falls back to polling via /api/realtime
 */
export function useWebSocketWithFallback({
  url,
  autoConnect = true,
  enableFallbackSync = true,
  fallbackSyncInterval = 5000,
  onError,
  onConnected,
  onDisconnected
}: UseWebSocketWithFallbackOptions): WebSocketWithFallbackReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Attempt WebSocket connection
  useEffect(() => {
    if (!autoConnect) return;

    let ws: WebSocket | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;
    let isMounted = true;

    const connect = async () => {
      if (!isMounted) return;

      try {
        // Try to get WebSocket URL from API first
        let wsUrl = url;
        if (!wsUrl) {
          try {
            const response = await fetch('/api/realtime');
            if (response.ok) {
              const data = await response.json();
              wsUrl = data.wsUrl;
            }
          } catch (e) {
            // Silently fail - will use default URL
          }
        }

        if (!wsUrl) {
          wsUrl = 'ws://localhost:3000/api/realtime';
        }

        // Attempt WebSocket connection with timeout
        const wsPromise = new Promise<WebSocket>((resolve, reject) => {
          try {
            const socket = new WebSocket(wsUrl);
            let timeoutId: NodeJS.Timeout;
            let hasResolved = false;
            
            timeoutId = setTimeout(() => {
              if (!hasResolved) {
                hasResolved = true;
                socket.close();
                reject(new Error('WebSocket connection timeout'));
              }
            }, 5000);

            socket.onopen = () => {
              if (!hasResolved) {
                hasResolved = true;
                clearTimeout(timeoutId);
                resolve(socket);
              }
            };

            socket.onerror = () => {
              if (!hasResolved) {
                hasResolved = true;
                clearTimeout(timeoutId);
                reject(new Error('WebSocket connection failed'));
              }
            };
          } catch (e) {
            reject(e);
          }
        });

        ws = await wsPromise;
        
        if (!isMounted) {
          ws.close();
          return;
        }

        setWs(ws);
        setIsConnected(true);
        setIsFallbackMode(false);
        setError(null);
        setIsReady(true);
        onConnected?.();

        // Handle WebSocket messages
        ws.onmessage = () => {
          // Handle incoming messages
        };

        ws.onclose = () => {
          if (isMounted) {
            setIsConnected(false);
            setWs(null);
            onDisconnected?.();
            
            // Try to reconnect after 5 seconds
            if (autoConnect && isMounted) {
              reconnectTimer = setTimeout(connect, 5000);
            }
          }
        };

        ws.onerror = (event) => {
          // Suppress error logging during normal operation
          // The connection will close and fallback will activate
        };
      } catch (err) {
        if (!isMounted) return;

        const error = err instanceof Error ? err : new Error(String(err));
        
        setWs(null);
        setIsConnected(false);
        // Don't set error if fallback is about to activate
        if (!enableFallbackSync) {
          setError(error);
        }
        
        // Fall back to HTTP polling if enabled
        if (enableFallbackSync) {
          setIsFallbackMode(true);
          setIsReady(true);
          setError(null);
          
          // Start polling interval
          fallbackInterval = setInterval(async () => {
            if (!isMounted) return;

            try {
              const response = await fetch('/api/realtime', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'SYNC', operations: [] })
              });
              
              if (!response.ok && (response.status === 401 || response.status === 403)) {
                // Auth issue, stop polling
                if (fallbackInterval) {
                  clearInterval(fallbackInterval);
                  fallbackInterval = null;
                }
              }
            } catch (syncError) {
              // Silently fail - will retry on next interval
            }
          }, fallbackSyncInterval);
        } else {
          setIsReady(true);
          onError?.(error);
        }
        
        // Retry WebSocket connection periodically
        if (autoConnect && isMounted) {
          reconnectTimer = setTimeout(connect, 30000); // Retry every 30 seconds
        }
      }
    };

    connect();

    // Cleanup
    return () => {
      isMounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (fallbackInterval) clearInterval(fallbackInterval);
      if (ws) {
        ws.close();
      }
    };
  }, [autoConnect, enableFallbackSync, fallbackSyncInterval, onConnected, onDisconnected, onError, url]);

  // Send message via WebSocket or fallback
  const send = useCallback(async (data: any) => {
    if (ws && isConnected) {
      ws.send(JSON.stringify(data));
    } else if (isFallbackMode) {
      try {
        await fetch('/api/realtime', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'SYNC', operations: [data] })
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
      }
    }
  }, [ws, isConnected, isFallbackMode, onError]);

  return {
    isConnected: isConnected || isFallbackMode,
    isFallbackMode,
    error,
    send,
    isReady
  };
}
