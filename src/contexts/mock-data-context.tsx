'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface MockDataContextType {
  useMockData: boolean;
  setUseMockData: (value: boolean) => void;
  toggleMockData: () => void;
}

const MockDataContext = createContext<MockDataContextType | undefined>(undefined);

export function MockDataProvider({ children }: { children: ReactNode }) {
  const [useMockData, setUseMockDataState] = useState<boolean>(() => {
    // Check localStorage for saved preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('useMockData');
      if (saved !== null) {
        return saved === 'true';
      }
      // Default to true in development, false in production
      return process.env.NODE_ENV === 'development';
    }
    return process.env.NODE_ENV === 'development';
  });

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('useMockData', String(useMockData));
  }, [useMockData]);

  const setUseMockData = (value: boolean) => {
    setUseMockDataState(value);
  };

  const toggleMockData = () => {
    setUseMockDataState(prev => !prev);
  };

  return (
    <MockDataContext.Provider value={{ useMockData, setUseMockData, toggleMockData }}>
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockData() {
  const context = useContext(MockDataContext);
  if (context === undefined) {
    throw new Error('useMockData must be used within a MockDataProvider');
  }
  return context;
}
