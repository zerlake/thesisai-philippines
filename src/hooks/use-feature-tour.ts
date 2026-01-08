"use client";

import { useCallback } from "react";
import { driver } from "driver.js";
import { featureToursConfig } from "@/lib/onboarding-steps";
import { useOnboarding } from "@/contexts/onboarding-context";

export function useFeatureTour() {
  const { addAchievement } = useOnboarding();

  const startFeatureTour = useCallback(
    (featureName: string) => {
      const steps = featureToursConfig[featureName];

      if (!steps || steps.length === 0) {
        console.warn(`No tour found for feature: ${featureName}`);
        return;
      }

      const drvr = driver({
        showProgress: true,
        showButtons: ["next", "previous", "close"],
        nextBtnText: "Next →",
        prevBtnText: "← Back",
        doneBtnText: "Done ✓",
        progressText: "{{current}} of {{total}}",
        allowClose: true,
        overlayOpacity: 0.6,
        animate: true,
        smoothScroll: true,
        steps: steps.map((step) => ({
          element: step.element,
          popover: {
            title: step.popover.title,
            description: step.popover.description,
            side: step.popover.side,
            align: step.popover.align,
          },
        })),
        onDestroyed: () => {
          // Award achievement badge based on feature
          const badgeMap: Record<string, { id: string; label: string; icon: string }> = {
            papers: { id: "paper-researcher", label: "Paper Researcher", icon: "📚" },
            grammarCheck: { id: "grammar-master", label: "Grammar Master", icon: "✍️" },
            outline: { id: "power-user", label: "Power User", icon: "⚡" },
          };

          const badge = badgeMap[featureName];
          if (badge) {
            addAchievement(badge);
          }
        },
      });

      drvr.drive();
    },
    [addAchievement]
  );

  return { startFeatureTour };
}
