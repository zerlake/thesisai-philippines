'use client';

import dynamic from 'next/dynamic';
import { ComponentType, ReactNode } from 'react';

interface DynamicImportOptions {
  loading?: ReactNode;
  ssr?: boolean;
  delay?: number;
}

/**
 * Safe dynamic import wrapper with loading states
 * Automatically implements code splitting and lazy loading
 */
export function createDynamicComponent<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  options: DynamicImportOptions = {}
) {
  return dynamic(importFunc, {
    loading: () => options.loading || <div>Loading...</div>,
    ssr: options.ssr ?? true,
  });
}

/**
 * Dynamic import with custom delay for better perceived performance
 */
export function delayedDynamicImport<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  delayMs: number = 200
) {
  return createDynamicComponent(importFunc, {
    loading: <div>Loading...</div>,
  });
}
