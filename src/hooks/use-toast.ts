"use client"

import * as React from "react"
import { toast as sonnerToast } from "sonner"

type ToastProps = Parameters<typeof sonnerToast>[0]

// Export the toast functions for direct use
export const toast = sonnerToast

export function useToast() {
  return React.useCallback((props: ToastProps) => {
    return sonnerToast(props)
  }, [])
}

// Export all sonner toast functions
export const {
  success,
  error,
  info,
  warning,
  promise,
  dismiss,
  loading,
} = sonnerToast
