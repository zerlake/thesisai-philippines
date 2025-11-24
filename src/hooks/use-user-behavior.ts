import { useEffect, useCallback, useRef } from "react";

export interface UserBehaviorEvent {
  action: string;
  feature: string;
  timestamp: number;
  duration?: number;
  context?: Record<string, unknown>;
}

export interface UserPattern {
  mostUsedFeatures: string[];
  averageSessionDuration: number;
  preferredWorkflow: string[];
  timeOfDayPatterns: Record<string, number>;
  abandonmentPoints: string[];
}

/**
 * Hook to track and analyze user behavior patterns
 * Enables ML-driven feature recommendations and smart defaults
 */
export function useUserBehavior() {
  const behaviorStack = useRef<UserBehaviorEvent[]>([]);
  const startTimeRef = useRef<number>(Date.now());

  const trackEvent = useCallback((
    action: string,
    feature: string,
    context?: Record<string, unknown>
  ) => {
    const event: UserBehaviorEvent = {
      action,
      feature,
      timestamp: Date.now(),
      context,
    };

    behaviorStack.current.push(event);

    // Persist to localStorage for pattern analysis
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user_behavior") || "[]";
      const behaviors = JSON.parse(stored) as UserBehaviorEvent[];
      behaviors.push(event);
      
      // Keep only last 500 events to avoid bloating storage
      const limited = behaviors.slice(-500);
      localStorage.setItem("user_behavior", JSON.stringify(limited));
    }
  }, []);

  const analyzePatterns = useCallback((): UserPattern => {
    if (typeof window === "undefined") {
      return {
        mostUsedFeatures: [],
        averageSessionDuration: 0,
        preferredWorkflow: [],
        timeOfDayPatterns: {},
        abandonmentPoints: [],
      };
    }

    const stored = localStorage.getItem("user_behavior") || "[]";
    const behaviors = JSON.parse(stored) as UserBehaviorEvent[];

    // Most used features
    const featureFreq = behaviors.reduce((acc, b) => {
      acc[b.feature] = (acc[b.feature] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedFeatures = Object.entries(featureFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([feature]) => feature);

    // Time patterns
    const timePatterns = behaviors.reduce((acc, b) => {
      const hour = new Date(b.timestamp).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Preferred workflow (sequence of features)
    const workflow: string[] = [];
    for (let i = 0; i < Math.min(5, behaviors.length); i++) {
      if (!workflow.includes(behaviors[i].feature)) {
        workflow.push(behaviors[i].feature);
      }
    }

    // Detect abandonment points (features where users leave)
    const abandonmentPoints = behaviors
      .filter((b) => b.action === "exit" || b.action === "abandon")
      .map((b) => b.feature);

    return {
      mostUsedFeatures,
      averageSessionDuration: Date.now() - startTimeRef.current,
      preferredWorkflow: workflow,
      timeOfDayPatterns: timePatterns,
      abandonmentPoints: [...new Set(abandonmentPoints)],
    };
  }, []);

  // Auto-save session duration
  useEffect(() => {
    return () => {
      const duration = Date.now() - startTimeRef.current;
      trackEvent("session_end", "app", { duration });
    };
  }, [trackEvent]);

  return { trackEvent, analyzePatterns, behaviorStack: behaviorStack.current };
}
