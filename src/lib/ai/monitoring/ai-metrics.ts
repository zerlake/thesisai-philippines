/**
 * AI Metrics & Monitoring System
 * Phase 5 Week 2: Advanced AI Features
 *
 * Tracks and analyzes AI tool performance:
 * - Response times
 * - Error rates
 * - Cache hit rates
 * - Tool usage patterns
 * - User engagement metrics
 */

export interface MetricEvent {
  id: string;
  type: MetricType;
  tool: string;
  timestamp: Date;
  duration?: number;
  success: boolean;
  metadata: Record<string, any>;
}

export type MetricType =
  | 'api-call'
  | 'cache-hit'
  | 'cache-miss'
  | 'error'
  | 'suggestion-shown'
  | 'suggestion-accepted'
  | 'suggestion-rejected'
  | 'tool-invoked'
  | 'feedback-generated';

export interface ToolMetrics {
  toolId: string;
  toolName: string;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  lastUsed: Date;
}

export interface SystemMetrics {
  totalApiCalls: number;
  totalErrors: number;
  overallCacheHitRate: number;
  averageResponseTime: number;
  activeTools: number;
  periodStart: Date;
  periodEnd: Date;
}

export interface UserEngagement {
  userId: string;
  suggestionsShown: number;
  suggestionsAccepted: number;
  suggestionsRejected: number;
  acceptanceRate: number;
  toolUsage: Record<string, number>;
  sessionDuration: number;
  lastActive: Date;
}

export interface PerformanceAlert {
  id: string;
  type: AlertType;
  severity: 'info' | 'warning' | 'error' | 'critical';
  tool: string;
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: Date;
  acknowledged: boolean;
}

export type AlertType =
  | 'high-error-rate'
  | 'slow-response'
  | 'low-cache-hit'
  | 'high-usage'
  | 'low-engagement';

export interface AlertThresholds {
  errorRateWarning: number;
  errorRateCritical: number;
  responseTimeWarning: number;
  responseTimeCritical: number;
  cacheHitRateWarning: number;
  engagementRateWarning: number;
}

export interface MetricsConfig {
  enabled: boolean;
  retentionDays: number;
  sampleRate: number; // 0-1, percentage of events to record
  alertThresholds: AlertThresholds;
  aggregationInterval: number; // minutes
}

export class AIMetricsCollector {
  private events: MetricEvent[] = [];
  private toolMetrics: Map<string, ToolMetrics> = new Map();
  private userEngagement: Map<string, UserEngagement> = new Map();
  private alerts: PerformanceAlert[] = [];
  private config: MetricsConfig;
  private alertCallbacks: Array<(alert: PerformanceAlert) => void> = [];
  private responseTimes: Map<string, number[]> = new Map(); // tool -> response times

  constructor(config?: Partial<MetricsConfig>) {
    this.config = {
      enabled: true,
      retentionDays: 30,
      sampleRate: 1.0,
      alertThresholds: {
        errorRateWarning: 0.05,
        errorRateCritical: 0.15,
        responseTimeWarning: 2000,
        responseTimeCritical: 5000,
        cacheHitRateWarning: 0.3,
        engagementRateWarning: 0.2
      },
      aggregationInterval: 5,
      ...config
    };
  }

  /**
   * Record a metric event
   */
  record(event: Omit<MetricEvent, 'id' | 'timestamp'>): void {
    if (!this.config.enabled) return;

    // Sample rate check
    if (Math.random() > this.config.sampleRate) return;

    const fullEvent: MetricEvent = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date()
    };

    this.events.push(fullEvent);
    this.updateToolMetrics(fullEvent);
    this.checkAlerts(fullEvent);

    // Cleanup old events
    this.cleanupOldEvents();
  }

  /**
   * Record an API call
   */
  recordApiCall(
    tool: string,
    duration: number,
    success: boolean,
    metadata?: Record<string, any>
  ): void {
    this.record({
      type: 'api-call',
      tool,
      duration,
      success,
      metadata: metadata || {}
    });

    // Track response time for percentile calculations
    const times = this.responseTimes.get(tool) || [];
    times.push(duration);
    if (times.length > 1000) times.shift();
    this.responseTimes.set(tool, times);
  }

  /**
   * Record a cache event
   */
  recordCacheEvent(tool: string, hit: boolean): void {
    this.record({
      type: hit ? 'cache-hit' : 'cache-miss',
      tool,
      success: true,
      metadata: {}
    });
  }

  /**
   * Record an error
   */
  recordError(tool: string, error: Error | string, metadata?: Record<string, any>): void {
    this.record({
      type: 'error',
      tool,
      success: false,
      metadata: {
        error: typeof error === 'string' ? error : error.message,
        stack: typeof error === 'string' ? undefined : error.stack,
        ...metadata
      }
    });
  }

  /**
   * Record suggestion event
   */
  recordSuggestion(
    tool: string,
    action: 'shown' | 'accepted' | 'rejected',
    suggestionId: string
  ): void {
    const type: MetricType = action === 'shown'
      ? 'suggestion-shown'
      : action === 'accepted'
        ? 'suggestion-accepted'
        : 'suggestion-rejected';

    this.record({
      type,
      tool,
      success: true,
      metadata: { suggestionId }
    });
  }

  /**
   * Record tool invocation
   */
  recordToolInvocation(
    tool: string,
    userId: string,
    metadata?: Record<string, any>
  ): void {
    this.record({
      type: 'tool-invoked',
      tool,
      success: true,
      metadata: { userId, ...metadata }
    });

    // Update user engagement
    this.updateUserEngagement(userId, tool);
  }

  /**
   * Update tool metrics
   */
  private updateToolMetrics(event: MetricEvent): void {
    const metrics = this.toolMetrics.get(event.tool) || {
      toolId: event.tool,
      toolName: event.tool,
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      averageResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      cacheHitRate: 0,
      errorRate: 0,
      lastUsed: new Date()
    };

    if (event.type === 'api-call' || event.type === 'tool-invoked') {
      metrics.totalCalls++;
      if (event.success) {
        metrics.successfulCalls++;
      } else {
        metrics.failedCalls++;
      }

      if (event.duration) {
        // Update average response time
        metrics.averageResponseTime =
          (metrics.averageResponseTime * (metrics.totalCalls - 1) + event.duration) /
          metrics.totalCalls;
      }

      metrics.errorRate = metrics.failedCalls / metrics.totalCalls;
    }

    // Update cache hit rate
    if (event.type === 'cache-hit' || event.type === 'cache-miss') {
      const cacheEvents = this.events.filter(
        e => e.tool === event.tool && (e.type === 'cache-hit' || e.type === 'cache-miss')
      );
      const hits = cacheEvents.filter(e => e.type === 'cache-hit').length;
      metrics.cacheHitRate = cacheEvents.length > 0 ? hits / cacheEvents.length : 0;
    }

    // Calculate percentiles
    const times = this.responseTimes.get(event.tool);
    if (times && times.length > 0) {
      const sorted = [...times].sort((a, b) => a - b);
      metrics.p95ResponseTime = sorted[Math.floor(sorted.length * 0.95)] || 0;
      metrics.p99ResponseTime = sorted[Math.floor(sorted.length * 0.99)] || 0;
    }

    metrics.lastUsed = event.timestamp;
    this.toolMetrics.set(event.tool, metrics);
  }

  /**
   * Update user engagement metrics
   */
  private updateUserEngagement(userId: string, tool: string): void {
    const engagement = this.userEngagement.get(userId) || {
      userId,
      suggestionsShown: 0,
      suggestionsAccepted: 0,
      suggestionsRejected: 0,
      acceptanceRate: 0,
      toolUsage: {},
      sessionDuration: 0,
      lastActive: new Date()
    };

    engagement.toolUsage[tool] = (engagement.toolUsage[tool] || 0) + 1;
    engagement.lastActive = new Date();

    this.userEngagement.set(userId, engagement);
  }

  /**
   * Check if alerts should be triggered
   */
  private checkAlerts(event: MetricEvent): void {
    const metrics = this.toolMetrics.get(event.tool);
    if (!metrics) return;

    const thresholds = this.config.alertThresholds;

    // Check error rate
    if (metrics.errorRate >= thresholds.errorRateCritical) {
      this.createAlert({
        type: 'high-error-rate',
        severity: 'critical',
        tool: event.tool,
        message: `Critical error rate for ${event.tool}: ${(metrics.errorRate * 100).toFixed(1)}%`,
        threshold: thresholds.errorRateCritical,
        currentValue: metrics.errorRate
      });
    } else if (metrics.errorRate >= thresholds.errorRateWarning) {
      this.createAlert({
        type: 'high-error-rate',
        severity: 'warning',
        tool: event.tool,
        message: `High error rate for ${event.tool}: ${(metrics.errorRate * 100).toFixed(1)}%`,
        threshold: thresholds.errorRateWarning,
        currentValue: metrics.errorRate
      });
    }

    // Check response time
    if (event.duration && event.duration >= thresholds.responseTimeCritical) {
      this.createAlert({
        type: 'slow-response',
        severity: 'critical',
        tool: event.tool,
        message: `Critical response time for ${event.tool}: ${event.duration}ms`,
        threshold: thresholds.responseTimeCritical,
        currentValue: event.duration
      });
    } else if (event.duration && event.duration >= thresholds.responseTimeWarning) {
      this.createAlert({
        type: 'slow-response',
        severity: 'warning',
        tool: event.tool,
        message: `Slow response time for ${event.tool}: ${event.duration}ms`,
        threshold: thresholds.responseTimeWarning,
        currentValue: event.duration
      });
    }

    // Check cache hit rate
    if (metrics.cacheHitRate < thresholds.cacheHitRateWarning && metrics.totalCalls > 10) {
      this.createAlert({
        type: 'low-cache-hit',
        severity: 'warning',
        tool: event.tool,
        message: `Low cache hit rate for ${event.tool}: ${(metrics.cacheHitRate * 100).toFixed(1)}%`,
        threshold: thresholds.cacheHitRateWarning,
        currentValue: metrics.cacheHitRate
      });
    }
  }

  /**
   * Create a new alert
   */
  private createAlert(alertData: Omit<PerformanceAlert, 'id' | 'timestamp' | 'acknowledged'>): void {
    // Check if similar alert exists recently (within 5 minutes)
    const recentSimilar = this.alerts.find(
      a => a.type === alertData.type &&
           a.tool === alertData.tool &&
           !a.acknowledged &&
           Date.now() - a.timestamp.getTime() < 5 * 60 * 1000
    );

    if (recentSimilar) return; // Don't create duplicate alerts

    const alert: PerformanceAlert = {
      ...alertData,
      id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
      acknowledged: false
    };

    this.alerts.push(alert);

    // Notify callbacks
    this.alertCallbacks.forEach(cb => cb(alert));

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }
  }

  /**
   * Subscribe to alerts
   */
  onAlert(callback: (alert: PerformanceAlert) => void): () => void {
    this.alertCallbacks.push(callback);
    return () => {
      const index = this.alertCallbacks.indexOf(callback);
      if (index > -1) this.alertCallbacks.splice(index, 1);
    };
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  /**
   * Get metrics for a specific tool
   */
  getToolMetrics(toolId: string): ToolMetrics | undefined {
    return this.toolMetrics.get(toolId);
  }

  /**
   * Get metrics for all tools
   */
  getAllToolMetrics(): ToolMetrics[] {
    return Array.from(this.toolMetrics.values());
  }

  /**
   * Get system-wide metrics
   */
  getSystemMetrics(periodHours: number = 24): SystemMetrics {
    const periodStart = new Date(Date.now() - periodHours * 60 * 60 * 1000);
    const periodEnd = new Date();

    const periodEvents = this.events.filter(e => e.timestamp >= periodStart);
    const apiCalls = periodEvents.filter(
      e => e.type === 'api-call' || e.type === 'tool-invoked'
    );
    const errors = periodEvents.filter(e => !e.success || e.type === 'error');
    const cacheHits = periodEvents.filter(e => e.type === 'cache-hit').length;
    const cacheMisses = periodEvents.filter(e => e.type === 'cache-miss').length;

    const totalResponseTime = apiCalls
      .filter(e => e.duration)
      .reduce((sum, e) => sum + (e.duration || 0), 0);

    return {
      totalApiCalls: apiCalls.length,
      totalErrors: errors.length,
      overallCacheHitRate: cacheHits + cacheMisses > 0
        ? cacheHits / (cacheHits + cacheMisses)
        : 0,
      averageResponseTime: apiCalls.length > 0
        ? totalResponseTime / apiCalls.filter(e => e.duration).length
        : 0,
      activeTools: this.toolMetrics.size,
      periodStart,
      periodEnd
    };
  }

  /**
   * Get user engagement metrics
   */
  getUserEngagement(userId: string): UserEngagement | undefined {
    return this.userEngagement.get(userId);
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(a => !a.acknowledged);
  }

  /**
   * Get all alerts
   */
  getAllAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  /**
   * Get events for a time period
   */
  getEvents(options?: {
    startDate?: Date;
    endDate?: Date;
    tool?: string;
    type?: MetricType;
    limit?: number;
  }): MetricEvent[] {
    let filtered = [...this.events];

    if (options?.startDate) {
      filtered = filtered.filter(e => e.timestamp >= options.startDate!);
    }
    if (options?.endDate) {
      filtered = filtered.filter(e => e.timestamp <= options.endDate!);
    }
    if (options?.tool) {
      filtered = filtered.filter(e => e.tool === options.tool);
    }
    if (options?.type) {
      filtered = filtered.filter(e => e.type === options.type);
    }
    if (options?.limit) {
      filtered = filtered.slice(-options.limit);
    }

    return filtered;
  }

  /**
   * Get aggregated metrics for charts
   */
  getAggregatedMetrics(
    toolId: string,
    periodHours: number = 24,
    intervalMinutes: number = 60
  ): Array<{ timestamp: Date; calls: number; errors: number; avgResponseTime: number }> {
    const periodStart = new Date(Date.now() - periodHours * 60 * 60 * 1000);
    const events = this.events.filter(
      e => e.tool === toolId && e.timestamp >= periodStart
    );

    const buckets: Map<number, { calls: number; errors: number; totalTime: number; count: number }> = new Map();
    const intervalMs = intervalMinutes * 60 * 1000;

    events.forEach(event => {
      const bucketTime = Math.floor(event.timestamp.getTime() / intervalMs) * intervalMs;
      const bucket = buckets.get(bucketTime) || { calls: 0, errors: 0, totalTime: 0, count: 0 };

      if (event.type === 'api-call' || event.type === 'tool-invoked') {
        bucket.calls++;
        if (!event.success) bucket.errors++;
        if (event.duration) {
          bucket.totalTime += event.duration;
          bucket.count++;
        }
      }

      buckets.set(bucketTime, bucket);
    });

    return Array.from(buckets.entries())
      .map(([timestamp, data]) => ({
        timestamp: new Date(timestamp),
        calls: data.calls,
        errors: data.errors,
        avgResponseTime: data.count > 0 ? data.totalTime / data.count : 0
      }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Export metrics for reporting
   */
  exportMetrics(): {
    tools: ToolMetrics[];
    system: SystemMetrics;
    alerts: PerformanceAlert[];
    exportedAt: Date;
  } {
    return {
      tools: this.getAllToolMetrics(),
      system: this.getSystemMetrics(),
      alerts: this.getAllAlerts(),
      exportedAt: new Date()
    };
  }

  /**
   * Clean up old events
   */
  private cleanupOldEvents(): void {
    const cutoff = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000);
    this.events = this.events.filter(e => e.timestamp >= cutoff);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<MetricsConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): MetricsConfig {
    return { ...this.config };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.events = [];
    this.toolMetrics.clear();
    this.userEngagement.clear();
    this.alerts = [];
    this.responseTimes.clear();
  }
}

// Singleton instance
export const aiMetrics = new AIMetricsCollector();
