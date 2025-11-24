"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface UseUnsavedChangesWarningProps {
  hasUnsavedChanges: boolean;
  onConfirm?: () => void;
}

/**
 * Hook to warn users before leaving page with unsaved changes
 * Shows both beforeunload dialog and Next.js router warning
 */
export function useUnsavedChangesWarning({
  hasUnsavedChanges,
  onConfirm,
}: UseUnsavedChangesWarningProps) {
  const router = useRouter();

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    // Browser beforeunload event (for page refresh, tab close, etc.)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // For Next.js router navigation
  const handleRouteChange = useCallback(() => {
    if (!hasUnsavedChanges) return;

    const confirmed = window.confirm(
      "You have unsaved changes. Do you really want to leave?\n\nClick OK to discard changes or Cancel to keep editing."
    );

    if (!confirmed) {
      throw new Error("Navigation cancelled");
    }

    onConfirm?.();
  }, [hasUnsavedChanges, onConfirm]);

  return {
    handleRouteChange,
  };
}
