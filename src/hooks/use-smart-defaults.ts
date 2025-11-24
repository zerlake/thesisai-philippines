import { useEffect, useState } from "react";
import { UserPattern } from "./use-user-behavior";

export interface SmartDefault<T> {
  value: T;
  confidence: number; // 0-1 confidence score
  source: "behavior" | "demographics" | "context" | "system";
  rationale: string;
}

/**
 * Hook to generate smart defaults based on user behavior and patterns
 * ML-driven feature that improves with more user data
 */
export function useSmartDefaults(patterns: UserPattern) {
  const [defaults, setDefaults] = useState<Record<string, SmartDefault<unknown>>>({});

  useEffect(() => {
    const smartDefaults: Record<string, SmartDefault<unknown>> = {};

    // 1. Suggest next feature based on preferred workflow
    if (patterns.preferredWorkflow.length > 0) {
      smartDefaults["suggestedNextFeature"] = {
        value: patterns.preferredWorkflow[0],
        confidence: Math.min(0.95, patterns.preferredWorkflow.length * 0.15),
        source: "behavior",
        rationale: "Based on your typical workflow pattern",
      };
    }

    // 2. Recommend workspace setup based on usage time
    const busiestHour = Object.entries(patterns.timeOfDayPatterns)
      .sort(([, a], [, b]) => b - a)[0];
    
    if (busiestHour) {
      const hour = parseInt(busiestHour[0]);
      const timeOfDay =
        hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
      
      smartDefaults["optimizedTimeOfDay"] = {
        value: timeOfDay,
        confidence: 0.7,
        source: "behavior",
        rationale: `You're most active during ${timeOfDay} hours`,
      };
    }

    // 3. Auto-enable features based on usage patterns
    if (patterns.mostUsedFeatures.length > 0) {
      smartDefaults["pinnedFeatures"] = {
        value: patterns.mostUsedFeatures.slice(0, 3),
        confidence: 0.85,
        source: "behavior",
        rationale: "Your most frequently used features",
      };
    }

    // 4. Suggest UI density based on session duration
    const isHeavyUser = patterns.averageSessionDuration > 30 * 60 * 1000; // 30min
    smartDefaults["uiDensity"] = {
      value: isHeavyUser ? "compact" : "comfortable",
      confidence: 0.75,
      source: "behavior",
      rationale: isHeavyUser
        ? "Compact UI for power users"
        : "Spacious UI for casual users",
    };

    // 5. Abandonment alerts - suggest support for problematic features
    if (patterns.abandonmentPoints.length > 0) {
      smartDefaults["needsSupport"] = {
        value: patterns.abandonmentPoints[0],
        confidence: 0.6,
        source: "behavior",
        rationale: `Users often leave at "${patterns.abandonmentPoints[0]}" - consider getting help`,
      };
    }

    setDefaults(smartDefaults);
  }, [patterns]);

  return defaults;
}
