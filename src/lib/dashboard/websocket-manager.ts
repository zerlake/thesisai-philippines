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
      try {
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
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

        this.ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
          this.setState(ConnectionState.ERROR);
          this.emit('error', error);
          reject(error);
        };

        this.ws.onclose = () => {
          this.setState(ConnectionState.DISCONNECTED);
          this.stopHeartbeat();
          this.emit('disconnected');
          this.attemptReconnect();
        };
      } catch (error) {
         this.setState(ConnectionState.ERROR);
         const err = error instanceof Error ? error : new Error(String(error));
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
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.config.reconnectAttempts) {
      this.setState(ConnectionState.ERROR);
      return;
    }

    this.setState(ConnectionState.RECONNECTING);
    this.reconnectAttempts++;

    const delay = this.config.reconnectDelay *
      Math.pow(this.config.reconnectBackoffMultiplier, this.reconnectAttempts - 1);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        console.error('[WebSocket] Reconnect failed:', error);
        this.attemptReconnect();
      });
    }, delay);
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
