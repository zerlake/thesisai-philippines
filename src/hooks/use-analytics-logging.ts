import { useCallback, useRef, useEffect } from "react";

export interface LogEntry {
  timestamp: number;
  level: "debug" | "info" | "warn" | "error";
  category: string;
  message: string;
  data?: Record<string, unknown>;
  duration?: number; // For performance metrics
  userAgent?: string;
  url?: string;
}

export interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
  sessionId?: string;
}

export interface UXMetrics {
  pageLoadTime: number;
  timeToInteractive: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  interactionToNextPaint?: number;
  errorRate: number;
  crashRate: number;
}

/**
 * Hook for comprehensive logging and UX analytics
 * Collects data for improving user experience
 */
export function useAnalyticsLogging(config?: {
  enableConsole?: boolean;
  enableRemote?: boolean;
  batchSize?: number;
  batchInterval?: number;
  endpoint?: string;
}) {
  const logsRef = useRef<LogEntry[]>([]);
  const metricsRef = useRef<UXMetrics>({
    pageLoadTime: 0,
    timeToInteractive: 0,
    errorRate: 0,
    crashRate: 0,
  });
  const sessionIdRef = useRef<string>(generateSessionId());
  const eventQueueRef = useRef<AnalyticsEvent[]>([]);

  const defaultConfig = {
    enableConsole: true,
    enableRemote: true,
    batchSize: 50,
    batchInterval: 30000, // 30 seconds
    endpoint: "/api/analytics",
    ...config,
  };

  /**
   * Log entry
   */
  const log = useCallback(
    (
      message: string,
      category: string,
      level: "debug" | "info" | "warn" | "error" = "info",
      data?: Record<string, unknown>
    ) => {
      const entry: LogEntry = {
        timestamp: Date.now(),
        level,
        category,
        message,
        data,
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      logsRef.current.push(entry);

      if (defaultConfig.enableConsole) {
        const consoleMethod = level === "error" ? "error" : level === "warn" ? "warn" : "log";
        console[consoleMethod](
          `[${category}] ${message}`,
          data || ""
        );
      }

      // Auto-send when batch size reached
      if (logsRef.current.length >= defaultConfig.batchSize) {
        sendLogs();
      }
    },
    [defaultConfig]
  );

  /**
   * Track event
   */
  const trackEvent = useCallback(
    (eventName: string, properties?: Record<string, unknown>) => {
      const event: AnalyticsEvent = {
        eventName,
        properties,
        timestamp: Date.now(),
        sessionId: sessionIdRef.current,
      };

      eventQueueRef.current.push(event);

      // Log the event too
      log(`Event: ${eventName}`, "analytics", "info", properties);

      // Auto-send when queue grows
      if (eventQueueRef.current.length >= 10) {
        sendEvents();
      }
    },
    [log]
  );

  /**
   * Measure performance
   */
  const measurePerformance = useCallback(
    (label: string, fn: () => Promise<void> | void) => {
      return async () => {
        const startTime = performance.now();
        try {
          await fn();
          const duration = performance.now() - startTime;
          log(`Performance: ${label}`, "performance", "info", {
            duration: Math.round(duration),
          });
        } catch (err) {
          const duration = performance.now() - startTime;
          log(
            `Performance error: ${label}`,
            "performance",
            "error",
            {
              error: String(err),
              duration: Math.round(duration),
            }
          );
          throw err;
        }
      };
    },
    [log]
  );

  /**
   * Log error with context
   */
  const logError = useCallback(
    (error: Error, context?: Record<string, unknown>) => {
      log(error.message, "error", "error", {
        stack: error.stack,
        ...context,
      });

      trackEvent("error_occurred", {
        error: error.message,
        ...context,
      });
    },
    [log, trackEvent]
  );

  /**
   * Collect Web Vitals
   */
  const collectWebVitals = useCallback(() => {
    if (!("PerformanceObserver" in window)) {
      return;
    }

    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        metricsRef.current.largestContentfulPaint = Math.round(lastEntry.renderTime);
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch (e) {
      // Silently ignore if not supported
    }

    // Cumulative Layout Shift
    try {
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          metricsRef.current.cumulativeLayoutShift =
            (metricsRef.current.cumulativeLayoutShift || 0) + entry.value;
        });
      });
      clsObserver.observe({ entryTypes: ["layout-shift"] });
    } catch (e) {
      // Silently ignore
    }
  }, []);

  /**
   * Get current metrics
   */
  const getMetrics = useCallback((): UXMetrics => {
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      metricsRef.current.pageLoadTime = timing.loadEventEnd - timing.navigationStart;
      metricsRef.current.timeToInteractive =
        (timing.domInteractive || timing.domComplete) - timing.navigationStart;
    }

    return metricsRef.current;
  }, []);

  /**
   * Send logs to server
   */
  const sendLogs = useCallback(async () => {
    if (!defaultConfig.enableRemote || logsRef.current.length === 0) return;

    const logsToSend = [...logsRef.current];
    logsRef.current = [];

    try {
      await fetch(defaultConfig.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logs: logsToSend,
          sessionId: sessionIdRef.current,
          metrics: metricsRef.current,
        }),
      });
    } catch (err) {
      console.error("Failed to send logs", err);
      // Re-queue logs if send failed
      logsRef.current.push(...logsToSend);
    }
  }, [defaultConfig]);

  /**
   * Send events to server
   */
  const sendEvents = useCallback(async () => {
    if (eventQueueRef.current.length === 0) return;

    const eventsToSend = [...eventQueueRef.current];
    eventQueueRef.current = [];

    try {
      await fetch(defaultConfig.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          events: eventsToSend,
          sessionId: sessionIdRef.current,
        }),
      });
    } catch (err) {
      console.error("Failed to send events", err);
      eventQueueRef.current.push(...eventsToSend);
    }
  }, [defaultConfig]);

  // Periodic batch send
  useEffect(() => {
    const interval = setInterval(() => {
      sendLogs();
      sendEvents();
    }, defaultConfig.batchInterval);

    return () => clearInterval(interval);
  }, [sendLogs, sendEvents, defaultConfig.batchInterval]);

  // Collect web vitals on mount
  useEffect(() => {
    collectWebVitals();

    // Send remaining data on page unload
    const handleBeforeUnload = () => {
      sendLogs();
      sendEvents();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [collectWebVitals, sendLogs, sendEvents]);

  return {
    log,
    logError,
    trackEvent,
    measurePerformance,
    getMetrics,
    sendLogs,
    sendEvents,
    sessionId: sessionIdRef.current,
  };
}

/**
 * Generate unique session ID
 */
function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Performance monitoring utilities
 */
export const performanceUtils = {
  /**
   * Measure function execution time
   */
  async measureFn<T>(
    fn: () => Promise<T>,
    label: string
  ): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    console.log(`${label} took ${duration.toFixed(2)}ms`);
    return { result, duration };
  },

  /**
   * Create performance mark and measure
   */
  mark(name: string) {
    if ("performance" in window) {
      performance.mark(name);
    }
  },

  measure(name: string, startMark: string, endMark?: string) {
    if ("performance" in window && endMark) {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      console.log(`${name}: ${measure?.duration.toFixed(2)}ms`);
    }
  },

  /**
   * Get Performance API metrics
   */
  getMetrics(): Record<string, number> {
    if (!("performance" in window)) return {};

    const metrics: Record<string, number> = {};
    const timing = (window as any).performance?.timing;

    if (timing) {
      metrics.navigationStart = timing.navigationStart;
      metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
      metrics.pageLoad = timing.loadEventEnd - timing.navigationStart;
      metrics.timeToFirstByte = timing.responseStart - timing.navigationStart;
      metrics.timeToDOM = timing.domInteractive - timing.navigationStart;
    }

    return metrics;
  },
};
