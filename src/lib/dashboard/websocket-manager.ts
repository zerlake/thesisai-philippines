/**
 * WebSocket Manager
 * 
 * Handles real-time dashboard updates via WebSocket connection.
 * Features:
 * - Automatic connection management
 * - Message handling and routing
 * - Event broadcasting
 * - Automatic reconnection with exponential backoff
 * - Health check/heartbeat
 * 
 * @module lib/dashboard/websocket-manager
 */

/**
 * Message types for WebSocket communication
 */
export enum MessageType {
  // Connection
  CONNECT = 'CONNECT',
  DISCONNECT = 'DISCONNECT',
  PING = 'PING',
  PONG = 'PONG',
  
  // Widget operations
  WIDGET_UPDATE = 'WIDGET_UPDATE',
  WIDGET_LOAD = 'WIDGET_LOAD',
  WIDGET_ERROR = 'WIDGET_ERROR',
  
  // Dashboard operations
  DASHBOARD_UPDATE = 'DASHBOARD_UPDATE',
  LAYOUT_CHANGE = 'LAYOUT_CHANGE',
  
  // Sync operations
  SYNC_REQUEST = 'SYNC_REQUEST',
  SYNC_RESPONSE = 'SYNC_RESPONSE',
  
  // Server events
  SERVER_BROADCAST = 'SERVER_BROADCAST',
  SERVER_ERROR = 'SERVER_ERROR'
}

/**
 * Connection state
 */
export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  ERROR = 'ERROR'
}

/**
 * WebSocket message structure
 */
export interface WebSocketMessage {
  type: MessageType;
  id?: string;
  timestamp: number;
  data?: Record<string, any>;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Message handler type
 */
export type MessageHandler = (message: WebSocketMessage) => void;

/**
 * Event listeners map
 */
interface EventListeners {
  [event: string]: Set<(...args: any[]) => void>;
}

/**
 * Connection configuration
 */
interface WebSocketConfig {
  url: string;
  reconnectAttempts: number;
  reconnectDelay: number;
  reconnectBackoffMultiplier: number;
  heartbeatInterval: number;
  messageTimeout: number;
}

/**
 * WebSocket Manager class
 * 
 * Manages WebSocket connections for real-time dashboard updates.
 */
export class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private state: ConnectionState = ConnectionState.DISCONNECTED;
  private reconnectAttempts: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageTimeout: NodeJS.Timeout | null = null;
  private eventListeners: EventListeners = {};
  private messageQueue: WebSocketMessage[] = [];
  private messageHandlers: Map<string, MessageHandler> = new Map();
  private messageId: number = 0;

  /**
   * Create WebSocket manager
   * @param url - WebSocket server URL
   * @param config - Connection configuration
   */
  constructor(
    url: string,
    config: Partial<WebSocketConfig> = {}
  ) {
    this.config = {
      url,
      reconnectAttempts: 5,
      reconnectDelay: 1000,
      reconnectBackoffMultiplier: 2,
      heartbeatInterval: 30000,
      messageTimeout: 10000,
      ...config
    };
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.state === ConnectionState.CONNECTED) {
      return;
    }

    this.setState(ConnectionState.CONNECTING);

    return new Promise((resolve, reject) => {
      // Add a timeout to handle connection failures more quickly
      let connectionTimeout: NodeJS.Timeout | undefined;
      
      try {
        connectionTimeout = setTimeout(() => {
          if (this.state === ConnectionState.CONNECTING) {
            console.warn('[WebSocket] Connection timeout');
            this.setState(ConnectionState.ERROR);
            this.emit('error', new Error('Connection timeout'));
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000); // 10 second timeout

        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          if (connectionTimeout !== undefined) clearTimeout(connectionTimeout);
          this.setState(ConnectionState.CONNECTED);
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.flushMessageQueue();
          this.emit('connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data));
        };

        this.ws.onerror = (event) => {
           if (connectionTimeout !== undefined) clearTimeout(connectionTimeout);
          
          // Extract error details from the typically empty WebSocket error event
          const errorInfo = this.extractErrorInfo(event);

          // Minimal logging to avoid noise
          console.warn('[WebSocket] Error', {
            code: errorInfo.code,
            message: errorInfo.message,
            attempt: `${this.reconnectAttempts + 1}/${this.config.reconnectAttempts}`
          });

          this.setState(ConnectionState.ERROR);
          this.emit('error', {
            message: errorInfo.message,
            code: errorInfo.code,
            isRetryable: this.reconnectAttempts < this.config.reconnectAttempts,
            attemptNumber: this.reconnectAttempts + 1,
            maxAttempts: this.config.reconnectAttempts
          });

          this.ws = null; // Clear the broken connection
          // Trigger reconnection with exponential backoff
          this.attemptReconnect();
        };

        this.ws.onclose = (closeEvent) => {
           if (connectionTimeout !== undefined) clearTimeout(connectionTimeout);
           this.setState(ConnectionState.DISCONNECTED);
          this.stopHeartbeat();
          this.emit('disconnected');

          // Log close event details for debugging
          if (closeEvent && (closeEvent as any).code) {
            console.log(`[WebSocket] Closed with code: ${(closeEvent as any).code}, reason: ${(closeEvent as any).reason}`);
          }

          this.attemptReconnect();
        };
      } catch (error) {
         if (connectionTimeout !== undefined) clearTimeout(connectionTimeout);
         this.setState(ConnectionState.ERROR);
         const err = error instanceof Error ? error : new Error(String(error));
         console.error('[WebSocket] Connection failed:', err);
         reject(err);
       }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.setState(ConnectionState.DISCONNECTED);
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Send message to server
   * @param type - Message type
   * @param data - Message data
   */
  send(type: MessageType, data?: Record<string, any>): string {
    const id = `msg_${++this.messageId}`;
    const message: WebSocketMessage = {
      type,
      id,
      timestamp: Date.now(),
      data
    };

    if (this.state === ConnectionState.CONNECTED && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }

    return id;
  }

  /**
   * Send message and wait for response
   * @param type - Message type
   * @param data - Message data
   * @returns Response message
   */
  async request(
    type: MessageType,
    data?: Record<string, any>
  ): Promise<WebSocketMessage> {
    return new Promise((resolve, reject) => {
      const id = this.send(type, data);

      const handler = (message: WebSocketMessage) => {
        if (message.id === id) {
          this.messageHandlers.delete(id);
          clearTimeout(timeout);
          resolve(message);
        }
      };

      const timeout = setTimeout(() => {
        this.messageHandlers.delete(id);
        reject(new Error(`Message timeout: ${type}`));
      }, this.config.messageTimeout);

      this.messageHandlers.set(id, handler);
    });
  }

  /**
   * Subscribe to message type
   * @param type - Message type
   * @param handler - Message handler
   */
  subscribe(type: MessageType, handler: MessageHandler): () => void {
    if (!this.eventListeners[type]) {
      this.eventListeners[type] = new Set();
    }

    this.eventListeners[type].add((msg) => handler(msg));

    // Return unsubscribe function
    return () => {
      this.eventListeners[type]?.delete(handler);
    };
  }

  /**
   * Subscribe to events
   * @param event - Event name ('connected', 'disconnected', 'error', 'stateChange')
   * @param handler - Event handler
   */
  on(event: string, handler: (...args: any[]) => void): () => void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = new Set();
    }

    this.eventListeners[event].add(handler);

    // Return unsubscribe function
    return () => {
      this.eventListeners[event]?.delete(handler);
    };
  }

  /**
   * Emit event
   * @param event - Event name
   * @param args - Event arguments
   */
  private emit(event: string, ...args: any[]): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach((listener) => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`[WebSocket] Event listener error (${event}):`, error);
        }
      });
    }
  }

  /**
   * Handle incoming message
   * @param message - WebSocket message
   */
  private handleMessage(message: WebSocketMessage): void {
    // Handle request-response pattern
    if (message.id && this.messageHandlers.has(message.id)) {
      const handler = this.messageHandlers.get(message.id)!;
      handler(message);
    }

    // Route to type-based handlers
    if (this.eventListeners[message.type]) {
      this.eventListeners[message.type].forEach((listener) => {
        try {
          listener(message);
        } catch (error) {
          console.error(`[WebSocket] Handler error (${message.type}):`, error);
        }
      });
    }

    // Handle heartbeat
    if (message.type === MessageType.PING) {
      this.send(MessageType.PONG);
    }
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift();
      if (message) {
        this.ws.send(JSON.stringify(message));
      }
    }
  }

  /**
   * Start heartbeat timer
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.state === ConnectionState.CONNECTED) {
        this.send(MessageType.PING);
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Stop heartbeat timer
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.config.reconnectAttempts) {
      this.setState(ConnectionState.ERROR);
      console.warn(`[WebSocket] Max reconnection attempts (${this.config.reconnectAttempts}) reached. Giving up.`);
      this.emit('connectionFailed', {
        reason: 'max_attempts_reached',
        attempts: this.reconnectAttempts
      });
      return;
    }

    this.setState(ConnectionState.RECONNECTING);
    this.reconnectAttempts++;

    // Calculate delay with exponential backoff + jitter
    const baseDelay = this.config.reconnectDelay *
      Math.pow(this.config.reconnectBackoffMultiplier, this.reconnectAttempts - 1);
    const jitter = Math.random() * 1000; // Add up to 1 second of jitter
    const delay = Math.min(baseDelay + jitter, 30000); // Cap at 30 seconds

    console.log(`[WebSocket] Reconnecting (attempt ${this.reconnectAttempts}/${this.config.reconnectAttempts}) in ${Math.round(delay)}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        console.warn('[WebSocket] Reconnect attempt failed:', error);
        // Continue with reconnection if not at max attempts
        if (this.reconnectAttempts < this.config.reconnectAttempts) {
          this.attemptReconnect();
        } else {
          this.setState(ConnectionState.ERROR);
          this.emit('connectionFailed', {
            reason: 'reconnect_failed',
            error: error instanceof Error ? error.message : String(error)
          });
        }
      });
    }, delay);
  }

  /**
   * Extract meaningful error info from WebSocket error event
   * @param event - WebSocket error event (often empty)
   */
  private extractErrorInfo(event: Event | any): {
    message: string;
    code?: string;
    type?: string;
    details?: string;
  } {
    // WebSocket error events are notoriously empty, build context from surrounding state
    const errorObj = event as any;
    
    // Determine error message with fallback chain
    let message = 'WebSocket connection error';
    if (errorObj?.message && typeof errorObj.message === 'string') {
      message = errorObj.message;
    } else if (errorObj?.reason && typeof errorObj.reason === 'string') {
      message = errorObj.reason;
    } else if (this.ws?.readyState === WebSocket.CLOSED) {
      message = 'WebSocket connection closed';
    } else if (this.ws?.readyState === WebSocket.CONNECTING) {
      message = 'WebSocket connection failed';
    }

    // Extract or infer error code
    let code = errorObj?.code;
    if (typeof code !== 'string') {
      code = this.reconnectAttempts > 0 ? 'RECONNECT_FAILED' : 'CONNECTION_ERROR';
    }

    // Get error type (rarely populated)
    const type = errorObj?.type || 'connection_error';

    // Build context without verbose details
    const details = `state=${this.state},readyState=${this.ws?.readyState || -1}`;

    return {
      message,
      code,
      type,
      details
    };
  }

  /**
   * Set connection state
   * @param state - New state
   */
  private setState(state: ConnectionState): void {
    if (this.state !== state) {
      this.state = state;
      this.emit('stateChange', state);
    }
  }

  /**
   * Get current connection state
   */
  getState(): ConnectionState {
    return this.state;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.state === ConnectionState.CONNECTED;
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.messageQueue.length;
  }

  /**
   * Get pending messages
   */
  getPendingMessages(): WebSocketMessage[] {
    return [...this.messageQueue];
  }
}

/**
 * Singleton instance
 */
let wsManager: WebSocketManager | null = null;

/**
 * Get WebSocket manager instance
 * @param url - WebSocket server URL (optional)
 * @param config - Connection configuration
 */
export function getWebSocketManager(
  url?: string,
  config?: Partial<WebSocketConfig>
): WebSocketManager {
  if (!wsManager && url) {
    wsManager = new WebSocketManager(url, config);
  }

  if (!wsManager) {
    throw new Error('WebSocket manager not initialized. Call getWebSocketManager(url) first.');
  }

  return wsManager;
}

/**
 * Reset WebSocket manager (for testing)
 */
export function resetWebSocketManager(): void {
  if (wsManager) {
    wsManager.disconnect();
    wsManager = null;
  }
}
