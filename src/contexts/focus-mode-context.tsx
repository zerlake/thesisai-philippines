"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

interface FocusModeContextType {
  isFocusMode: boolean;
  isTimerActive: boolean;
  timerDuration: number;
  toggleFocusMode: () => void;
  startTimer: (duration: number) => void;
  stopTimer: () => void;
}

const FocusModeContext = createContext<FocusModeContextType | undefined>(undefined);

export function FocusModeProvider({ children }: { children: React.ReactNode }) {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerDuration, setTimerDuration] = useState(0);

  const toggleFocusMode = useCallback(() => {
    setIsFocusMode(prev => !prev);
  }, []);

  const startTimer = useCallback((duration: number) => {
    setTimerDuration(duration);
    setIsTimerActive(true);
    setIsFocusMode(true);
  }, []);

  const stopTimer = useCallback(() => {
    setIsTimerActive(false);
    setTimerDuration(0);
  }, []);

  return (
    <FocusModeContext.Provider value={{ isFocusMode, isTimerActive, timerDuration, toggleFocusMode, startTimer, stopTimer }}>
      {children}
    </FocusModeContext.Provider>
  );
}

export function useFocusMode() {
  const context = useContext(FocusModeContext);
  if (context === undefined) {
    throw new Error('useFocusMode must be used within a FocusModeProvider');
  }
  return context;
}