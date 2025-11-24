/**
 * MCP Provider Component
 * Provides MCP context to child components
 */

'use client';

import React, { createContext, useContext, ReactNode, useRef } from 'react';
import { getOrchestrator, type MCPOrchestrator } from '@/lib/mcp/orchestrator';

interface MCPContextType {
  orchestrator: MCPOrchestrator;
}

const MCPContext = createContext<MCPContextType | undefined>(undefined);

interface MCPProviderProps {
  children: ReactNode;
  serenaUrl?: string;
}

export function MCPProvider({ children, serenaUrl }: MCPProviderProps) {
  const orchestratorRef = useRef(getOrchestrator(serenaUrl));

  return (
    <MCPContext.Provider
      value={{
        orchestrator: orchestratorRef.current,
      }}
    >
      {children}
    </MCPContext.Provider>
  );
}

export function useMCPContext(): MCPContextType {
  const context = useContext(MCPContext);
  if (!context) {
    throw new Error('useMCPContext must be used within MCPProvider');
  }
  return context;
}
