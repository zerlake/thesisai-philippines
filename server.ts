/**
 * Custom Next.js Server with WebSocket Support
 * 
 * This file runs in development mode to provide WebSocket support.
 * In production, use a deployment platform that supports WebSockets
 * (e.g., Vercel, AWS Lambda with WebSocket API, etc.)
 * 
 * Run with: npm run dev
 */

import http from 'http';
import { AddressInfo } from 'net';
import next from 'next';
import { parse } from 'url';
import { initializeRealtimeServer } from './src/lib/realtime-init';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server
  const server = http.createServer((req, res) => {
    const parsedUrl = parse(req.url || '', true);
    handle(req, res, parsedUrl);
  });

  // Initialize WebSocket server
  try {
    initializeRealtimeServer(server);
    console.log('[Server] WebSocket server initialized');
  } catch (error) {
    console.error('[Server] Failed to initialize WebSocket:', error);
    process.exit(1);
  }

  // Graceful shutdown
  const signals = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, async () => {
      console.log(`\n[Server] Received ${signal}, shutting down...`);

      server.close(() => {
        console.log('[Server] HTTP server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('[Server] Forced shutdown');
        process.exit(1);
      }, 10000);
    });
  }

  // Start server
  server.listen(port, hostname as string, () => {
    const addr = server.address() as AddressInfo;
    const protocol = process.env.HTTPS ? 'https' : 'http';
    const wsProtocol = process.env.HTTPS ? 'wss' : 'ws';

    console.log(
      `[Server] Ready on ${protocol}://${addr.address}:${addr.port}`
    );
    console.log(`[Server] WebSocket available on ${wsProtocol}://localhost:${port}/api/realtime`);
  });
});
