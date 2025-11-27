/**
 * Adaptive Interface System
 * Adjusts interface complexity and features based on usage patterns
 */

import { AdaptiveInterface, SuggestedAction, UserBehaviorData, UserPattern } from './types';
import { supabase } from '@/integrations/supabase/client';

const BEHAVIOR_TABLE = 'user_behavior_logs';
const PATTERNS_TABLE = 'user_patterns';

class AdaptiveInterfaceManager {
  private behaviorCache: Map<string, UserBehaviorData[]> = new Map();
  private patternCache: Map<string, UserPattern[]> = new Map();

  /**
   * Log user behavior
   */
  async logBehavior(behavior: Omit<UserBehaviorData, 'timestamp'>): Promise<void> {
    const data: UserBehaviorData = {
      ...behavior,
      timestamp: new Date(),
    };

    try {
      await supabase.from(BEHAVIOR_TABLE).insert(data);

      // Clear pattern cache to recalculate
      this.patternCache.delete(behavior.userId);
    } catch (error) {
      console.error('Error logging behavior:', error);
      // Fail silently - don't disrupt user experience
    }
  }

  /**
   * Get adaptive interface configuration for user
   */
  async getAdaptiveInterface(userId: string): Promise<AdaptiveInterface> {
    try {
      const patterns = await this.detectPatterns(userId);
      const customizationLevel = this._calculateCustomizationLevel(patterns);
      const suggestedActions = await this._generateSuggestedActions(userId, patterns);

      return {
        showAdvancedOptions: customizationLevel !== 'beginner',
        suggestedActions,
        customizationLevel,
        featureDiscoveryShown: [],
      };
    } catch (error) {
      console.error('Error getting adaptive interface:', error);
      return {
        showAdvancedOptions: false,
        suggestedActions: [],
        customizationLevel: 'beginner',
        featureDiscoveryShown: [],
      };
    }
  }

  /**
   * Detect user behavioral patterns
   */
  async detectPatterns(userId: string): Promise<UserPattern[]> {
    // Check cache
    const cached = this.patternCache.get(userId);
    if (cached) return cached;

    try {
      // Get recent behavior data
      const { data: behaviors, error: behaviorError } = await supabase
        .from(BEHAVIOR_TABLE)
        .select('*')
        .eq('userId', userId)
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
        .order('timestamp', { ascending: false })
        .limit(1000);

      if (behaviorError) throw behaviorError;

      const patterns = this._analyzePatterns((behaviors || []) as UserBehaviorData[]);
      this.patternCache.set(userId, patterns);
      return patterns;
    } catch (error) {
      console.error('Error detecting patterns:', error);
      return [];
    }
  }

  /**
   * Analyze behavioral patterns from activity logs
   */
  private _analyzePatterns(behaviors: UserBehaviorData[]): UserPattern[] {
    const patterns: Map<string, { count: number; confidence: number }> = new Map();

    // Count event frequency
    for (const behavior of behaviors) {
      const key = behavior.eventType;
      const current = patterns.get(key) || { count: 0, confidence: 0 };
      current.count++;
      patterns.set(key, current);
    }

    // Convert to pattern objects
    const result: UserPattern[] = Array.from(patterns.entries()).map(([pattern, stats]) => ({
      id: `pattern_${pattern}_${Date.now()}`,
      userId: behaviors[0]?.userId || '',
      pattern,
      frequency: stats.count,
      confidence: Math.min(stats.count / behaviors.length, 1),
      suggestedDefaults: this._generateDefaults(pattern),
      lastDetectedAt: new Date(),
    }));

    return result.sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Generate suggested defaults based on pattern
   */
  private _generateDefaults(pattern: string): Record<string, unknown> {
    const defaults: Record<string, Record<string, unknown>> = {
      research_heavy: {
        cardView: 'list',
        itemsPerPage: 50,
        compactMode: false,
      },
      quick_edits: {
        autoSave: true,
        autoSaveInterval: 15000,
        compactMode: true,
      },
      collaboration: {
        enableDragAndDrop: true,
        gridLayout: 'flexible',
      },
      accessibility_focus: {
        keyboardNavigationOnly: true,
        highContrast: true,
      },
    };

    return defaults[pattern] || {};
  }

  /**
   * Calculate customization level based on patterns
   */
  private _calculateCustomizationLevel(patterns: UserPattern[]): 'beginner' | 'intermediate' | 'advanced' {
    if (patterns.length === 0) return 'beginner';

    const avgFrequency = patterns.reduce((sum, p) => sum + p.frequency, 0) / patterns.length;
    const avgConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;

    if (avgFrequency < 5 || avgConfidence < 0.3) {
      return 'beginner';
    } else if (avgFrequency < 20 || avgConfidence < 0.6) {
      return 'intermediate';
    } else {
      return 'advanced';
    }
  }

  /**
   * Generate suggested actions based on behavior
   */
  private async _generateSuggestedActions(userId: string, patterns: UserPattern[]): Promise<SuggestedAction[]> {
    const actions: SuggestedAction[] = [];

    // Suggestion 1: Based on frequent patterns
    if (patterns.length > 0) {
      const topPattern = patterns[0];
      actions.push({
        id: `action_pattern_${topPattern.pattern}`,
        title: `Optimize for ${topPattern.pattern}`,
        description: `We noticed you frequently ${topPattern.pattern}. Would you like to optimize your interface?`,
        action: `apply_defaults_${topPattern.pattern}`,
        confidence: topPattern.confidence,
        contextual: true,
      });
    }

    // Suggestion 2: Feature discovery
    actions.push({
      id: 'action_feature_discovery',
      title: 'Explore advanced features',
      description: 'Based on your usage, you might benefit from these advanced features.',
      action: 'show_feature_tour',
      confidence: 0.6,
      contextual: false,
    });

    // Suggestion 3: Performance optimization
    if (patterns.some(p => p.pattern === 'heavy_user')) {
      actions.push({
        id: 'action_performance',
        title: 'Enable offline mode',
        description: 'Cache frequently accessed items for faster access.',
        action: 'enable_offline_mode',
        confidence: 0.7,
        contextual: true,
      });
    }

    return actions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Update interface based on user feedback
   */
  async updateInterfacePreferences(userId: string, feedback: { actionId: string; accepted: boolean }): Promise<void> {
    // Log the feedback for future ML training
    await this.logBehavior({
      userId,
      sessionId: `feedback_${Date.now()}`,
      eventType: `interface_feedback_${feedback.actionId}`,
      eventData: {
        accepted: feedback.accepted,
        actionId: feedback.actionId,
      },
      deviceId: 'unknown',
    });

    // Clear cache to recalculate
    this.patternCache.delete(userId);
  }

  /**
   * Track feature discovery
   */
  async trackFeatureDiscovery(userId: string, featureId: string): Promise<void> {
    await this.logBehavior({
      userId,
      sessionId: `discovery_${Date.now()}`,
      eventType: 'feature_discovered',
      eventData: { featureId },
      deviceId: 'unknown',
    });
  }
}

export const adaptiveInterfaceManager = new AdaptiveInterfaceManager();
