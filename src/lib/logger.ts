/**
 * Centralized Logging System
 *
 * Provides multi-level logging with automatic batching, Puter filesystem backup,
 * and Supabase database persistence.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  stackTrace?: string;
  url?: string;
  userAgent?: string;
}

class Logger {
  private buffer: LogEntry[] = [];
  private flushInterval: number = 5000;
  private maxBufferSize: number = 50;
  private flushTimer?: NodeJS.Timeout;
  private userId?: string;
  private puterEnabled: boolean = false;
  private puterInitialized: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.startFlushTimer();
      this.initPuter();
    }
  }

  private async initPuter() {
    if (typeof window === 'undefined') return;

    try {
      const puter = (window as any).puter;
      if (puter && puter.fs) {
        this.puterEnabled = true;
        this.puterInitialized = true;
        console.log('[Logger] Puter filesystem integration enabled');
      }
    } catch (error) {
      console.warn('[Logger] Puter integration failed:', error);
    }
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  private createEntry(
    level: LogLevel,
    message: string,
    contextOrError?: Record<string, any> | Error,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      level,
      message,
      userId: this.userId,
    };

    if (typeof window !== 'undefined') {
      entry.url = window.location.href;
      entry.userAgent = navigator.userAgent;
    }

    if (contextOrError instanceof Error) {
      entry.stackTrace = contextOrError.stack;
      entry.context = { errorMessage: contextOrError.message };
    } else if (error instanceof Error) {
      entry.stackTrace = error.stack;
      entry.context = contextOrError;
    } else {
      entry.context = contextOrError;
    }

    return entry;
  }

  private addToBuffer(entry: LogEntry) {
    this.buffer.push(entry);

    console.log(`[${entry.level.toUpperCase()}]`, entry.message, entry.context || '');

    if (this.buffer.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  private startFlushTimer() {
    this.flushTimer = setInterval(() => {
      if (this.buffer.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  private async backupCriticalLogsToPuter(logs: LogEntry[]) {
    if (!this.puterEnabled || typeof window === 'undefined') return;

    try {
      const puter = (window as any).puter;
      const criticalLogs = logs.filter(log => log.level === 'error' || log.level === 'critical');

      if (criticalLogs.length === 0) return;

      const filename = `critical-logs-${new Date().toISOString().split('T')[0]}.json`;
      const logData = JSON.stringify(criticalLogs, null, 2);

      await puter.fs.write(`/logs/${filename}`, logData);
      console.log(`[Logger] Backed up ${criticalLogs.length} critical logs to Puter:`, filename);
    } catch (error) {
      console.warn('[Logger] Failed to backup logs to Puter:', error);
    }
  }

  async flush() {
    if (this.buffer.length === 0) return;

    const logsToFlush = [...this.buffer];
    this.buffer = [];

    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: logsToFlush }),
      });

      await this.backupCriticalLogsToPuter(logsToFlush);
    } catch (error) {
      console.error('[Logger] Failed to flush logs:', error);
      this.buffer.unshift(...logsToFlush);
    }
  }

  debug(message: string, context?: Record<string, any>) {
    const entry = this.createEntry('debug', message, context);
    this.addToBuffer(entry);
  }

  info(message: string, context?: Record<string, any>) {
    const entry = this.createEntry('info', message, context);
    this.addToBuffer(entry);
  }

  warn(message: string, context?: Record<string, any>) {
    const entry = this.createEntry('warn', message, context);
    this.addToBuffer(entry);
  }

  error(message: string, contextOrError?: Record<string, any> | Error, error?: Error) {
    const entry = this.createEntry('error', message, contextOrError, error);
    this.addToBuffer(entry);
  }

  critical(message: string, contextOrError?: Record<string, any> | Error, error?: Error) {
    const entry = this.createEntry('critical', message, contextOrError, error);
    this.addToBuffer(entry);
    this.flush();
    this.backupCriticalLogsToPuter([entry]);
  }

  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

export const logger = new Logger();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    logger.flush();
  });
}
