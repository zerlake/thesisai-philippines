/**
 * Real-time Server Initialization
 * 
 * This module initializes the WebSocket server on application startup.
 * It's designed to work with Next.js in development and production modes.
 */

import type { Server as HTTPServer } from 'http';
import type { Server as HTTPSServer } from 'https';
import { RealtimeServer } from './realtime-server';

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
    const server = new RealtimeServer(httpServer);
    server.initialize();

    // Setup event listeners
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
  server.on('client:connected', (session) => {
    console.log(`[Realtime] Client connected: ${session.id}`);
  });

  server.on('client:disconnected', (session) => {
    console.log(`[Realtime] Client disconnected: ${session.id}`);
  });

  server.on('client:error', ({ clientId, error }) => {
    console.error(`[Realtime] Client error (${clientId}):`, error);
  });

  // Message events
  server.on('message:received', ({ clientId, message }) => {
    console.debug(
      `[Realtime] Message received from ${clientId}: ${message.type}`
    );
  });

  // Sync events
  server.on('sync:requested', ({ clientId }) => {
    console.debug(`[Realtime] Sync requested by ${clientId}`);
  });

  server.on('sync:updated', ({ clientId, message }) => {
    console.debug(`[Realtime] Sync updated from ${clientId}`);
  });

  // Widget events
  server.on('widget:updated', ({ clientId, message }) => {
    console.debug(`[Realtime] Widget updated from ${clientId}`);
  });

  server.on('widget:deleted', ({ clientId, message }) => {
    console.debug(`[Realtime] Widget deleted from ${clientId}`);
  });

  server.on('widget:batch', ({ clientId, message }) => {
    console.debug(`[Realtime] Widget batch operation from ${clientId}`);
  });

  // Layout events
  server.on('layout:updated', ({ clientId, message }) => {
    console.debug(`[Realtime] Layout updated from ${clientId}`);
  });

  // Conflict events
  server.on('conflict:resolved', ({ clientId, message }) => {
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
