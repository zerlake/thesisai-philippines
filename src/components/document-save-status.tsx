"use client";

import { useEffect, useState } from "react";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type SaveStatus = "typing" | "saving" | "saved" | "error";

interface DocumentSaveStatusProps {
  status: SaveStatus;
  lastSavedAt?: Date;
  showOnlyWhenActive?: boolean;
}

export function DocumentSaveStatus({
  status,
  lastSavedAt,
  showOnlyWhenActive = true,
}: DocumentSaveStatusProps) {
  const [displayStatus, setDisplayStatus] = useState<SaveStatus>(status);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    setDisplayStatus(status);
    setFadeOut(false);

    // Auto-fade out "saved" status after 3 seconds
    if (status === "saved") {
      const timer = setTimeout(() => {
        if (showOnlyWhenActive) {
          setFadeOut(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, showOnlyWhenActive]);

  const getStatusIcon = () => {
    switch (displayStatus) {
      case "typing":
        return null;
      case "saving":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "saved":
        return <Check className="w-4 h-4" />;
      case "error":
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch (displayStatus) {
      case "typing":
        return "Typing...";
      case "saving":
        return "Saving...";
      case "saved":
        return lastSavedAt
          ? `Saved ${formatDistanceToNow(lastSavedAt, { addSuffix: true })}`
          : "Saved";
      case "error":
        return "Save failed - retrying...";
    }
  };

  const getStatusColor = () => {
    switch (displayStatus) {
      case "typing":
        return "text-gray-500";
      case "saving":
        return "text-blue-600";
      case "saved":
        return "text-green-600";
      case "error":
        return "text-red-600";
    }
  };

  // Hide when appropriate
  if (showOnlyWhenActive && fadeOut && displayStatus === "saved") {
    return null;
  }

  return (
    <div
      className={`flex items-center gap-2 text-sm transition-opacity duration-300 ${getStatusColor()} ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {getStatusIcon()}
      <span className="font-medium">{getStatusText()}</span>
    </div>
  );
}

/**
 * Hook to manage document save status
 * Usage:
 * const { status, setStatus, markAsSaving, markAsSaved, markAsError } = useDocumentSaveStatus();
 */
export function useDocumentSaveStatus() {
  const [status, setStatus] = useState<SaveStatus>("typing");
  const [lastSavedAt, setLastSavedAt] = useState<Date>();

  const markAsSaving = () => setStatus("saving");
  const markAsSaved = () => {
    setStatus("saved");
    setLastSavedAt(new Date());
  };
  const markAsError = () => setStatus("error");
  const markAsTyping = () => setStatus("typing");

  return {
    status,
    setStatus,
    lastSavedAt,
    markAsSaving,
    markAsSaved,
    markAsError,
    markAsTyping,
  };
}
