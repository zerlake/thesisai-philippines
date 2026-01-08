"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";

export type UserRole = "student" | "advisor" | "critic" | "admin";

export type Achievement = {
  id: string;
  label: string;
  icon: string;
  unlockedAt?: Date;
};

export type OnboardingState = {
  isFirstVisit: boolean;
  hasCompletedOnboarding: boolean;
  currentStep: number;
  isOnboardingActive: boolean;
  achievements: Achievement[];
  daysActive: number;
  lastOnboardingDate: Date | null;
};

type OnboardingContextType = {
  state: OnboardingState;
  startOnboarding: () => void;
  completeStep: (stepIndex: number) => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  addAchievement: (achievement: Achievement) => void;
  resetOnboarding: () => void;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { session, profile } = useAuth();
  const [state, setState] = useState<OnboardingState>({
    isFirstVisit: true,
    hasCompletedOnboarding: false,
    currentStep: 0,
    isOnboardingActive: false,
    achievements: [],
    daysActive: 1,
    lastOnboardingDate: null,
  });

  // Load state from localStorage on mount
  useEffect(() => {
    if (!session?.user?.id) return;

    const storageKey = `onboarding_${session.user.id}`;
    const savedState = localStorage.getItem(storageKey);

    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setState((prev) => ({
          ...prev,
          ...parsed,
          lastOnboardingDate: parsed.lastOnboardingDate ? new Date(parsed.lastOnboardingDate) : null,
        }));
      } catch (_error) {
        console.error("Failed to load onboarding state");
      }
    } else {
      // First visit - set initial state
      setState((prev) => ({
        ...prev,
        isFirstVisit: true,
        isOnboardingActive: true,
      }));
    }
  }, [session?.user?.id]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!session?.user?.id) return;

    const storageKey = `onboarding_${session.user.id}`;
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        ...state,
        lastOnboardingDate: state.lastOnboardingDate?.toISOString(),
      })
    );
  }, [state, session?.user?.id]);

  const startOnboarding = () => {
    setState((prev) => ({
      ...prev,
      isOnboardingActive: true,
      currentStep: 0,
    }));
  };

  const completeStep = (stepIndex: number) => {
    setState((prev) => ({
      ...prev,
      currentStep: stepIndex + 1,
    }));
  };

  const completeOnboarding = () => {
    setState((prev) => ({
      ...prev,
      hasCompletedOnboarding: true,
      isOnboardingActive: false,
      isFirstVisit: false,
      lastOnboardingDate: new Date(),
    }));

    // Award "Explorer" badge
    addAchievement({
      id: "explorer",
      label: "Explorer",
      icon: "🔍",
    });
  };

  const skipOnboarding = () => {
    setState((prev) => ({
      ...prev,
      isOnboardingActive: false,
    }));
  };

  const addAchievement = (achievement: Achievement) => {
    setState((prev) => {
      const exists = prev.achievements.some((a) => a.id === achievement.id);
      if (exists) return prev;

      return {
        ...prev,
        achievements: [
          ...prev.achievements,
          {
            ...achievement,
            unlockedAt: new Date(),
          },
        ],
      };
    });
  };

  const resetOnboarding = () => {
    setState({
      isFirstVisit: true,
      hasCompletedOnboarding: false,
      currentStep: 0,
      isOnboardingActive: true,
      achievements: [],
      daysActive: 1,
      lastOnboardingDate: null,
    });
  };

  return (
    <OnboardingContext.Provider
      value={{
        state,
        startOnboarding,
        completeStep,
        completeOnboarding,
        skipOnboarding,
        addAchievement,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}
