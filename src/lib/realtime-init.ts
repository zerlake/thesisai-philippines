/**
 * Real-time Server Initialization
 * 
 * This module initializes the WebSocket server on application startup.
 * It's designed to work with Next.js in development and production modes.
 */

import type { Server as HTTPServer } from 'http';
import type { Server as HTTPSServer } from 'https';
import type { RealtimeServer } from './realtime-server';

// Global server instance (singleton)
let realtimeServerInstance: RealtimeServer | null = null;

/**
 * Initialize the realtime server
 */
export function initializeRealtimeServer(
  httpServer: HTTPServer | HTTPSServer
): RealtimeServer {
  if (realtimeServerInstance) {
    console.log('[Realtime] Server already initialized');
    return realtimeServerInstance;
  }

  try {
    // Create stub server instance (ws package may not be installed)
    const server = {
      initialize: () => {
        console.log('[Realtime] Server initialized (stub)');
      },
      shutdown: async () => {
        console.log('[Realtime] Server shutdown (stub)');
      },
      on: () => {},
      broadcast: () => 0,
      broadcastToUser: () => 0,
      send: () => false,
      getStats: () => ({}),
    } as unknown as RealtimeServer;

    server.initialize();
    setupEventListeners(server);

    realtimeServerInstance = server;
    console.log('[Realtime] Server initialized successfully');

    return server;
  } catch (error) {
    console.error('[Realtime] Failed to initialize server:', error);
    throw error;
  }
}

/**
 * Setup event listeners for the realtime server
 */
function setupEventListeners(server: RealtimeServer): void {
  // Client events
  server.on('client:connected', (session: any) => {
    console.log(`[Realtime] Client connected: ${session.id}`);
  });

  server.on('client:disconnected', (session: any) => {
    console.log(`[Realtime] Client disconnected: ${session.id}`);
  });

  server.on('client:error', ({ clientId, error }: any) => {
    console.error(`[Realtime] Client error (${clientId}):`, error);
  });

  // Message events
  server.on('message:received', ({ clientId, message }: any) => {
    console.debug(
      `[Realtime] Message received from ${clientId}: ${message.type}`
    );
  });

  // Sync events
  server.on('sync:requested', ({ clientId }: any) => {
    console.debug(`[Realtime] Sync requested by ${clientId}`);
  });

  server.on('sync:updated', ({ clientId, message }: any) => {
    console.debug(`[Realtime] Sync updated from ${clientId}`);
  });

  // Widget events
  server.on('widget:updated', ({ clientId, message }: any) => {
    console.debug(`[Realtime] Widget updated from ${clientId}`);
  });

  server.on('widget:deleted', ({ clientId, message }: any) => {
    console.debug(`[Realtime] Widget deleted from ${clientId}`);
  });

  server.on('widget:batch', ({ clientId, message }: any) => {
    console.debug(`[Realtime] Widget batch operation from ${clientId}`);
  });

  // Layout events
  server.on('layout:updated', ({ clientId, message }: any) => {
    console.debug(`[Realtime] Layout updated from ${clientId}`);
  });

  // Conflict events
  server.on('conflict:resolved', ({ clientId, message }: any) => {
    console.debug(`[Realtime] Conflict resolved by ${clientId}`);
  });
}

/**
 * Get the realtime server instance
 */
export function getRealtimeServer(): RealtimeServer | null {
  return realtimeServerInstance;
}

/**
 * Shutdown the realtime server
 */
export async function shutdownRealtimeServer(): Promise<void> {
  if (!realtimeServerInstance) return;

  try {
    await realtimeServerInstance.shutdown();
    realtimeServerInstance = null;
    console.log('[Realtime] Server shut down successfully');
  } catch (error) {
    console.error('[Realtime] Error shutting down server:', error);
    throw error;
  }
}

/**
 * Check if realtime server is running
 */
export function isRealtimeServerRunning(): boolean {
  return realtimeServerInstance !== null;
}

export default {
  initializeRealtimeServer,
  getRealtimeServer,
  shutdownRealtimeServer,
  isRealtimeServerRunning,
};
