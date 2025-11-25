/**
 * Real-time WebSocket Server for Dashboard
 * 
 * This server handles WebSocket connections for real-time dashboard updates.
 * It manages:
 * - Connection lifecycle
 * - Message routing
 * - Broadcasting updates to connected clients
 * - Sync state across multiple tabs/devices
 * 
 * Usage:
 * import { createRealtimeServer } from '@/lib/realtime-server';
 * const server = createRealtimeServer(httpServer);
 * server.initialize();
 */

import WebSocket from 'ws';
import { EventEmitter } from 'events';
import type { IncomingMessage } from 'http';
import type { Server as HTTPServer } from 'http';
import type { Server as HTTPSServer } from 'https';

/**
 * Message types for WebSocket communication
 */
export enum MessageType {
  // Connection lifecycle
  CONNECT = 'CONNECT',
  DISCONNECT = 'DISCONNECT',
  PING = 'PING',
  PONG = 'PONG',

  // Sync operations
  SYNC_REQUEST = 'SYNC_REQUEST',
  SYNC_RESPONSE = 'SYNC_RESPONSE',
  SYNC_UPDATE = 'SYNC_UPDATE',
  SYNC_ERROR = 'SYNC_ERROR',

  // Widget operations
  WIDGET_UPDATE = 'WIDGET_UPDATE',
  WIDGET_DELETE = 'WIDGET_DELETE',
  WIDGET_BATCH = 'WIDGET_BATCH',

  // Layout operations
  LAYOUT_UPDATE = 'LAYOUT_UPDATE',
  LAYOUT_RESTORE = 'LAYOUT_RESTORE',

  // Conflict handling
  CONFLICT_DETECTED = 'CONFLICT_DETECTED',
  CONFLICT_RESOLVED = 'CONFLICT_RESOLVED',

  // Acknowledgments
  ACK = 'ACK',
  NACK = 'NACK',
}

/**
 * Client session information
 */
export interface ClientSession {
  id: string;
  userId: string;
  connectedAt: Date;
  lastHeartbeat: Date;
  messageCount: number;
  isAlive: boolean;
}

/**
 * WebSocket message structure
 */
export interface RealtimeMessage {
  type: MessageType;
  id: string;
  timestamp: Date;
  userId: string;
  payload: any;
  correlationId?: string;
}

/**
 * Real-time Server
 */
export class RealtimeServer extends EventEmitter {
  private wss: WebSocket.Server;
  private clients: Map<string, ClientSession> = new Map();
  private messageHandlers: Map<MessageType, Function> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 seconds
  private readonly CLEANUP_INTERVAL = 60000; // 1 minute
  private readonly HEARTBEAT_TIMEOUT = 60000; // 60 seconds

  constructor(
    server: HTTPServer | HTTPSServer,
    options: Partial<WebSocket.ServerOptions> = {}
  ) {
    super();

    this.wss = new WebSocket.Server({
      server,
      path: '/api/realtime',
      ...options,
    });

    this.setupMessageHandlers();
    this.setupConnectionHandlers();
  }

  /**
   * Initialize the server and start heartbeat monitoring
   */
  public initialize(): void {
    this.wss.on('connection', this.handleConnection.bind(this));
    this.startHeartbeat();
    this.startCleanup();
    this.emit('initialized');
    console.log('[Realtime] Server initialized');
  }

  /**
   * Shut down the server gracefully
   */
  public async shutdown(): Promise<void> {
    // Stop heartbeat and cleanup
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);

    // Close all connections
    for (const [id, client] of this.clients.entries()) {
      const ws = this.getWebSocketById(id);
      if (ws) {
        ws.close(1000, 'Server shutting down');
      }
    }

    // Close server
    return new Promise((resolve, reject) => {
      this.wss.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * Handle new WebSocket connection
   */
  private handleConnection(ws: WebSocket, req: IncomingMessage): void {
    const clientId = this.generateClientId();
    const userId = this.extractUserIdFromRequest(req);

    if (!userId) {
      ws.close(1008, 'Unauthorized');
      return;
    }

    const session: ClientSession = {
      id: clientId,
      userId,
      connectedAt: new Date(),
      lastHeartbeat: new Date(),
      messageCount: 0,
      isAlive: true,
    };

    this.clients.set(clientId, session);
    this.emit('client:connected', session);

    console.log(`[Realtime] Client ${clientId} connected (user: ${userId})`);

    // Send initial connection message
    this.send(clientId, {
      type: MessageType.CONNECT,
      id: this.generateMessageId(),
      timestamp: new Date(),
      userId,
      payload: {
        clientId,
        timestamp: new Date().toISOString(),
      },
    });

    // Handle incoming messages
    ws.on('message', (data) => this.handleMessage(clientId, data));
    ws.on('pong', () => this.handlePong(clientId));
    ws.on('close', () => this.handleClose(clientId));
    ws.on('error', (error) => this.handleError(clientId, error));
  }

  /**
   * Handle incoming message from client
   */
  private handleMessage(clientId: string, data: WebSocket.Data): void {
    try {
      const session = this.clients.get(clientId);
      if (!session) return;

      session.messageCount++;
      session.lastHeartbeat = new Date();

      const message = JSON.parse(data.toString()) as RealtimeMessage;

      // Validate message
      if (!message.type || !message.userId) {
        this.sendError(clientId, 'Invalid message format');
        return;
      }

      // Route to handler
      const handler = this.messageHandlers.get(message.type);
      if (handler) {
        handler.call(this, clientId, message);
      } else {
        this.sendError(clientId, `Unknown message type: ${message.type}`);
      }

      // Emit event for monitoring
      this.emit('message:received', { clientId, message });
    } catch (error) {
      console.error(`[Realtime] Error handling message from ${clientId}:`, error);
      this.sendError(clientId, 'Failed to process message');
    }
  }

  /**
   * Handle client disconnection
   */
  private handleClose(clientId: string): void {
    const session = this.clients.get(clientId);
    if (!session) return;

    this.clients.delete(clientId);
    this.emit('client:disconnected', session);

    console.log(
      `[Realtime] Client ${clientId} disconnected (user: ${session.userId})`
    );
  }

  /**
   * Handle client error
   */
  private handleError(clientId: string, error: Error): void {
    console.error(`[Realtime] Client ${clientId} error:`, error);
    this.emit('client:error', { clientId, error });
  }

  /**
   * Handle pong response from client
   */
  private handlePong(clientId: string): void {
    const session = this.clients.get(clientId);
    if (session) {
      session.isAlive = true;
      session.lastHeartbeat = new Date();
    }
  }

  /**
   * Setup message type handlers
   */
  private setupMessageHandlers(): void {
    // Ping/Pong
    this.messageHandlers.set(MessageType.PING, this.handlePingMessage);
    this.messageHandlers.set(MessageType.PONG, this.handlePongMessage);

    // Sync operations
    this.messageHandlers.set(MessageType.SYNC_REQUEST, this.handleSyncRequest);
    this.messageHandlers.set(MessageType.SYNC_UPDATE, this.handleSyncUpdate);

    // Widget operations
    this.messageHandlers.set(MessageType.WIDGET_UPDATE, this.handleWidgetUpdate);
    this.messageHandlers.set(MessageType.WIDGET_DELETE, this.handleWidgetDelete);
    this.messageHandlers.set(MessageType.WIDGET_BATCH, this.handleWidgetBatch);

    // Layout operations
    this.messageHandlers.set(MessageType.LAYOUT_UPDATE, this.handleLayoutUpdate);

    // Conflict resolution
    this.messageHandlers.set(
      MessageType.CONFLICT_RESOLVED,
      this.handleConflictResolved
    );
  }

  /**
   * Setup connection event handlers
   */
  private setupConnectionHandlers(): void {
    // Handled in handleConnection
  }

  /**
   * Handler: Ping message
   */
  private handlePingMessage(clientId: string, message: RealtimeMessage): void {
    this.send(clientId, {
      type: MessageType.PONG,
      id: this.generateMessageId(),
      timestamp: new Date(),
      userId: message.userId,
      correlationId: message.id,
      payload: {},
    });
  }

  /**
   * Handler: Pong message
   */
  private handlePongMessage(clientId: string, message: RealtimeMessage): void {
    // Already handled in handlePong, this is just for message routing
  }

  /**
   * Handler: Sync request
   */
  private handleSyncRequest(clientId: string, message: RealtimeMessage): void {
    const session = this.clients.get(clientId);
    if (!session) return;

    // Send sync response
    this.send(clientId, {
      type: MessageType.SYNC_RESPONSE,
      id: this.generateMessageId(),
      timestamp: new Date(),
      userId: message.userId,
      correlationId: message.id,
      payload: {
        syncState: 'ready',
        clientCount: this.clients.size,
        timestamp: new Date().toISOString(),
      },
    });

    this.emit('sync:requested', { clientId, message });
  }

  /**
   * Handler: Sync update
   */
  private handleSyncUpdate(clientId: string, message: RealtimeMessage): void {
    const session = this.clients.get(clientId);
    if (!session) return;

    // Acknowledge receipt
    this.send(clientId, {
      type: MessageType.ACK,
      id: this.generateMessageId(),
      timestamp: new Date(),
      userId: message.userId,
      correlationId: message.id,
      payload: { received: true },
    });

    // Broadcast to other clients
    this.broadcast(
      {
        type: MessageType.SYNC_UPDATE,
        id: this.generateMessageId(),
        timestamp: new Date(),
        userId: message.userId,
        payload: message.payload,
      },
      clientId // Exclude sender
    );

    this.emit('sync:updated', { clientId, message });
  }

  /**
   * Handler: Widget update
   */
  private handleWidgetUpdate(clientId: string, message: RealtimeMessage): void {
    const session = this.clients.get(clientId);
    if (!session) return;

    // Acknowledge receipt
    this.send(clientId, {
      type: MessageType.ACK,
      id: this.generateMessageId(),
      timestamp: new Date(),
      userId: message.userId,
      correlationId: message.id,
      payload: { received: true },
    });

    // Broadcast to other clients
    this.broadcast(
      {
        type: MessageType.WIDGET_UPDATE,
        id: this.generateMessageId(),
        timestamp: new Date(),
        userId: message.userId,
        payload: message.payload,
      },
      clientId // Exclude sender
    );

    this.emit('widget:updated', { clientId, message });
  }

  /**
   * Handler: Widget delete
   */
  private handleWidgetDelete(clientId: string, message: RealtimeMessage): void {
    const session = this.clients.get(clientId);
    if (!session) return;

    // Acknowledge receipt
    this.send(clientId, {
      type: MessageType.ACK,
      id: this.generateMessageId(),
      timestamp: new Date(),
      userId: message.userId,
      correlationId: message.id,
      payload: { received: true },
    });

    // Broadcast to other clients
    this.broadcast(
      {
        type: MessageType.WIDGET_DELETE,
        id: this.generateMessageId(),
        timestamp: new Date(),
        userId: message.userId,
        payload: message.payload,
      },
      clientId // Exclude sender
    );

    this.emit('widget:deleted', { clientId, message });
  }

  /**
   * Handler: Widget batch operations
   */
  private handleWidgetBatch(clientId: string, message: RealtimeMessage): void {
    const session = this.clients.get(clientId);
    if (!session) return;

    // Acknowledge receipt
    this.send(clientId, {
      type: MessageType.ACK,
      id: this.generateMessageId(),
      timestamp: new Date(),
      userId: message.userId,
      correlationId: message.id,
      payload: { received: true },
    });

    // Broadcast to other clients
    this.broadcast(
      {
        type: MessageType.WIDGET_BATCH,
        id: this.generateMessageId(),
        timestamp: new Date(),
        userId: message.userId,
        payload: message.payload,
      },
      clientId // Exclude sender
    );

    this.emit('widget:batch', { clientId, message });
  }

  /**
   * Handler: Layout update
   */
  private handleLayoutUpdate(clientId: string, message: RealtimeMessage): void {
    const session = this.clients.get(clientId);
    if (!session) return;

    // Acknowledge receipt
    this.send(clientId, {
      type: MessageType.ACK,
      id: this.generateMessageId(),
      timestamp: new Date(),
      userId: message.userId,
      correlationId: message.id,
      payload: { received: true },
    });

    // Broadcast to other clients
    this.broadcast(
      {
        type: MessageType.LAYOUT_UPDATE,
        id: this.generateMessageId(),
        timestamp: new Date(),
        userId: message.userId,
        payload: message.payload,
      },
      clientId // Exclude sender
    );

    this.emit('layout:updated', { clientId, message });
  }

  /**
   * Handler: Conflict resolved
   */
  private handleConflictResolved(
    clientId: string,
    message: RealtimeMessage
  ): void {
    const session = this.clients.get(clientId);
    if (!session) return;

    // Acknowledge receipt
    this.send(clientId, {
      type: MessageType.ACK,
      id: this.generateMessageId(),
      timestamp: new Date(),
      userId: message.userId,
      correlationId: message.id,
      payload: { resolved: true },
    });

    // Broadcast to other clients
    this.broadcast(
      {
        type: MessageType.CONFLICT_RESOLVED,
        id: this.generateMessageId(),
        timestamp: new Date(),
        userId: message.userId,
        payload: message.payload,
      },
      clientId // Exclude sender
    );

    this.emit('conflict:resolved', { clientId, message });
  }

  /**
   * Send message to specific client
   */
  public send(clientId: string, message: RealtimeMessage): boolean {
    const ws = this.getWebSocketById(clientId);
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;

    try {
      ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error(`[Realtime] Error sending to ${clientId}:`, error);
      return false;
    }
  }

  /**
   * Broadcast message to all clients except sender
   */
  public broadcast(
    message: RealtimeMessage,
    excludeClientId?: string
  ): number {
    let count = 0;

    for (const [clientId, session] of this.clients.entries()) {
      if (excludeClientId && clientId === excludeClientId) continue;

      const ws = this.getWebSocketById(clientId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify(message));
          count++;
        } catch (error) {
          console.error(
            `[Realtime] Error broadcasting to ${clientId}:`,
            error
          );
        }
      }
    }

    return count;
  }

  /**
   * Broadcast to specific user (all their connections)
   */
  public broadcastToUser(
    userId: string,
    message: RealtimeMessage
  ): number {
    let count = 0;

    for (const [clientId, session] of this.clients.entries()) {
      if (session.userId !== userId) continue;

      const ws = this.getWebSocketById(clientId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify(message));
          count++;
        } catch (error) {
          console.error(
            `[Realtime] Error broadcasting to user ${userId}:`,
            error
          );
        }
      }
    }

    return count;
  }

  /**
   * Send error message to client
   */
  private sendError(clientId: string, errorMessage: string): void {
    this.send(clientId, {
      type: MessageType.NACK,
      id: this.generateMessageId(),
      timestamp: new Date(),
      userId: '',
      payload: {
        error: errorMessage,
      },
    });
  }

  /**
   * Start heartbeat monitoring
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      for (const [clientId, session] of this.clients.entries()) {
        const ws = this.getWebSocketById(clientId);
        if (!ws) continue;

        if (!session.isAlive) {
          // Client didn't respond to previous ping
          console.log(`[Realtime] Terminating unresponsive client ${clientId}`);
          ws.terminate();
        } else {
          // Send ping
          session.isAlive = false;
          ws.ping();
        }
      }
    }, this.HEARTBEAT_INTERVAL);
  }

  /**
   * Start cleanup of dead connections
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = new Date();

      for (const [clientId, session] of this.clients.entries()) {
        const timeSinceHeartbeat =
          now.getTime() - session.lastHeartbeat.getTime();

        if (timeSinceHeartbeat > this.HEARTBEAT_TIMEOUT) {
          console.log(
            `[Realtime] Cleaning up stale client ${clientId} (${timeSinceHeartbeat}ms since last heartbeat)`
          );

          const ws = this.getWebSocketById(clientId);
          if (ws) ws.close(1000, 'Timeout');
        }
      }
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Get WebSocket by client ID
   */
  private getWebSocketById(clientId: string): WebSocket | undefined {
    for (const ws of this.wss.clients) {
      const session = (ws as any).__session;
      if (session?.id === clientId) return ws;
    }
    return undefined;
  }

  /**
   * Extract user ID from request
   */
  private extractUserIdFromRequest(req: IncomingMessage): string | null {
    // Try to get from query params or headers
    const url = new URL(req.url || '', 'ws://localhost');
    const userId = url.searchParams.get('userId');

    if (userId) return userId;

    // Try to get from auth header
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) {
      return auth.slice(7); // Remove 'Bearer '
    }

    // Try to get from cookie
    const cookies = req.headers.cookie;
    if (cookies) {
      const match = cookies.match(/userId=([^;]+)/);
      if (match) return decodeURIComponent(match[1]);
    }

    return null;
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `client-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  /**
   * Get server stats
   */
  public getStats() {
    return {
      clientCount: this.clients.size,
      clients: Array.from(this.clients.values()).map((session) => ({
        id: session.id,
        userId: session.userId,
        connectedAt: session.connectedAt,
        messageCount: session.messageCount,
        isAlive: session.isAlive,
      })),
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Factory function to create a realtime server
 */
export function createRealtimeServer(
  server: HTTPServer | HTTPSServer,
  options?: Partial<WebSocket.ServerOptions>
): RealtimeServer {
  return new RealtimeServer(server, options);
}

export default RealtimeServer;
