"use client";

import React, { useEffect, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { motion } from "framer-motion";
import { CelebrationAnimation } from "./celebration-animation";
import { useOnboarding } from "@/contexts/onboarding-context";
import { useAuth } from "@/components/auth-provider";
import { getOnboardingSteps } from "@/lib/onboarding-steps";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function OnboardingModal() {
  const { state, completeOnboarding, skipOnboarding, completeStep } = useOnboarding();
  const { profile } = useAuth();
  const [driverInstance, setDriverInstance] = useState<any>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = getOnboardingSteps(profile?.role);

  useEffect(() => {
    if (!state.isOnboardingActive || steps.length === 0) return;

    // Add custom styling for the driver overlay
    const style = document.createElement("style");
    style.innerHTML = `
      .driver-overlay {
        background: rgba(0, 0, 0, 0.6);
      }
      
      .driver-popover {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 2px solid #0f3460;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
      }
      
      .driver-popover-title {
        color: #fff;
        font-size: 18px;
        font-weight: 700;
      }
      
      .driver-popover-description {
        color: #a0a0a0;
        font-size: 14px;
        line-height: 1.5;
      }
      
      .driver-close-btn {
        color: #a0a0a0;
        opacity: 0.8;
      }
      
      .driver-close-btn:hover {
        color: #fff;
        opacity: 1;
      }
      
      .driver-highlighted-element {
        border-radius: 8px;
        box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.5);
      }
    `;
    document.head.appendChild(style);

    // Initialize driver.js
    const drvr = driver({
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      nextBtnText: "Next →",
      prevBtnText: "← Back",
      doneBtnText: "Complete ✓",
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
      onHighlighted: () => {
        // Celebration on last step handled in onDestroyed
      },
      onDestroyed: () => {
        completeOnboarding();
        setShowCelebration(true);
      },
    });

    setDriverInstance(drvr);
    drvr.drive();

    // Clean up style
    return () => {
      document.head.removeChild(style);
    };
  }, [state.isOnboardingActive, steps, completeOnboarding]);

  if (!state.isOnboardingActive) return null;

  return (
    <>
      {/* Skip button overlay */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-4 right-4 z-[10000] pointer-events-auto"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            skipOnboarding();
            driverInstance?.destroy();
          }}
          className="gap-2"
        >
          <X className="w-4 h-4" />
          Skip Tutorial
        </Button>
      </motion.div>

      {/* Progress indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none"
      >
        <div className="bg-background/80 backdrop-blur border border-border px-6 py-3 rounded-full text-sm font-medium">
          <span className="text-muted-foreground">Step </span>
          <span className="text-accent-electric-purple font-bold">
            {currentStep + 1}/{steps.length}
          </span>
          <span className="text-muted-foreground"> • Explore ThesisAI</span>
        </div>
      </motion.div>

      {/* Celebration when onboarding completes */}
      <CelebrationAnimation
        isVisible={showCelebration}
        onComplete={() => {
          setShowCelebration(false);
        }}
      />
    </>
  );
}
