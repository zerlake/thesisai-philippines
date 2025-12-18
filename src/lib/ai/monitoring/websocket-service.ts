/**
 * AI Pipeline WebSocket Service
 * Phase 5: Real-time Monitoring & Analytics
 */

import { AIPipelineEvent } from '@/lib/ai/monitoring/event-schema';

class AIPipelineWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000; // 5 seconds
  private listeners: Array<(data: AIPipelineEvent) => void> = [];
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private heartbeatTimeout: NodeJS.Timeout | null = null;

  constructor(url?: string) {
    this.url = url || process.env.NEXT_PUBLIC_AI_WEBSOCKET_URL || 'ws://localhost:3001/ai-monitoring';
  }

  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('[AI WebSocket] Connected to monitoring service');
        this.reconnectAttempts = 0; // Reset on successful connection
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const data: AIPipelineEvent = JSON.parse(event.data);
          this.notifyListeners(data);
        } catch (error) {
          console.error('[AI WebSocket] Error parsing message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('[AI WebSocket] Connection closed');
        this.stopHeartbeat();
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('[AI WebSocket] Error:', error);
      };
    } catch (error) {
      console.error('[AI WebSocket] Failed to connect:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[AI WebSocket] Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connect(), this.reconnectInterval);
    } else {
      console.error('[AI WebSocket] Max reconnection attempts reached');
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
        
        // Set timeout for pong response
        this.heartbeatTimeout = setTimeout(() => {
          console.warn('[AI WebSocket] Heartbeat timeout, closing connection');
          this.ws?.close();
        }, 10000); // 10 seconds timeout
      }
    }, 30000); // 30 seconds heartbeat
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  addEventListener(listener: (data: AIPipelineEvent) => void): void {
    this.listeners.push(listener);
  }

  removeEventListener(listener: (data: AIPipelineEvent) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners(data: AIPipelineEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('[AI WebSocket] Error in listener:', error);
      }
    });
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners = [];
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
let aiPipelineWebSocket: AIPipelineWebSocket | null = null;

export function getAIPipelineWebSocket(): AIPipelineWebSocket {
  if (!aiPipelineWebSocket) {
    aiPipelineWebSocket = new AIPipelineWebSocket();
    aiPipelineWebSocket.connect();
  }
  return aiPipelineWebSocket;
}

export default AIPipelineWebSocket;