import { useState, useCallback } from "react";

export interface ErrorContext {
  code?: string;
  context?: string;
  action?: string;
  timestamp?: number;
}

export interface RecoverySuggestion {
  id: string;
  title: string;
  description: string;
  action: () => Promise<void>;
  icon: string;
  isAutomatic?: boolean; // Can be applied automatically
}

/**
 * Hook for intelligent error recovery with contextual suggestions
 * Analyzes errors and provides recovery paths
 */
export function useErrorRecovery() {
  const [error, setError] = useState<Error | null>(null);
  const [context, setContext] = useState<ErrorContext | null>(null);
  const [suggestions, setSuggestions] = useState<RecoverySuggestion[]>([]);
  const [isRecovering, setIsRecovering] = useState(false);

  /**
   * Analyze error and generate recovery suggestions
   */
  const handleError = useCallback(
    async (err: Error, errorContext?: ErrorContext) => {
      setError(err);
      setContext(errorContext || null);
      setIsRecovering(false);

      const recoveryPaths = generateRecoverySuggestions(
        err,
        errorContext
      );
      setSuggestions(recoveryPaths);

      // Auto-apply automatic recovery if available
      const automatic = recoveryPaths.find((s) => s.isAutomatic);
      if (automatic) {
        await applyRecovery(automatic);
      }
    },
    []
  );

  /**
   * Apply recovery suggestion
   */
  const applyRecovery = useCallback(async (suggestion: RecoverySuggestion) => {
    setIsRecovering(true);
    try {
      await suggestion.action();
      setError(null);
      setSuggestions([]);
    } catch (err) {
      // If recovery fails, keep error state but remove this suggestion
      setSuggestions((prev) =>
        prev.filter((s) => s.id !== suggestion.id)
      );
    } finally {
      setIsRecovering(false);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
    setContext(null);
    setSuggestions([]);
  }, []);

  return {
    error,
    context,
    suggestions,
    isRecovering,
    handleError,
    applyRecovery,
    clearError,
  };
}

/**
 * Generate recovery suggestions based on error type
 */
function generateRecoverySuggestions(
  error: Error,
  context?: ErrorContext
): RecoverySuggestion[] {
  const suggestions: RecoverySuggestion[] = [];
  const message = error.message.toLowerCase();

  // Network errors
  if (
    message.includes("network") ||
    message.includes("offline") ||
    message.includes("econnrefused")
  ) {
    suggestions.push({
      id: "check-connection",
      title: "Check Your Connection",
      description:
        "Make sure you're connected to the internet and try again",
      action: async () => {
        // Wait for connection
        await new Promise((resolve) => {
          if (navigator.onLine) {
            resolve(undefined);
          } else {
            const handler = () => {
              window.removeEventListener("online", handler);
              resolve(undefined);
            };
            window.addEventListener("online", handler);
          }
        });
      },
      icon: "🌐",
    });

    suggestions.push({
      id: "retry-action",
      title: "Retry Operation",
      description: "Try the operation again",
      action: async () => {
        // This will be replaced by the calling component
        return Promise.resolve();
      },
      icon: "🔄",
      isAutomatic: true,
    });
  }

  // Timeout errors
  if (message.includes("timeout") || message.includes("took too long")) {
    suggestions.push({
      id: "increase-timeout",
      title: "Give It More Time",
      description: "The server might be busy. Try again in a moment",
      action: async () => {
        return new Promise((resolve) => {
          setTimeout(resolve, 3000);
        });
      },
      icon: "⏱️",
    });

    suggestions.push({
      id: "simplify-request",
      title: "Try Simpler Operation",
      description: "Try uploading a smaller file or splitting the work",
      action: async () => {
        return Promise.resolve();
      },
      icon: "📦",
    });
  }

  // Authentication errors
  if (message.includes("auth") || message.includes("401") || message.includes("403")) {
    suggestions.push({
      id: "sign-in",
      title: "Sign In Again",
      description: "Your session expired. Please sign in",
      action: async () => {
        // Trigger sign-in flow
        return Promise.resolve();
      },
      icon: "🔐",
    });

    suggestions.push({
      id: "reset-password",
      title: "Reset Password",
      description: "If you forgot your password, reset it",
      action: async () => {
        return Promise.resolve();
      },
      icon: "🔑",
    });
  }

  // Validation errors
  if (message.includes("validation") || message.includes("invalid")) {
    suggestions.push({
      id: "review-input",
      title: "Review Your Input",
      description: "Check that all required fields are filled correctly",
      action: async () => {
        return Promise.resolve();
      },
      icon: "✍️",
    });
  }

  // Storage/quota errors
  if (message.includes("quota") || message.includes("storage")) {
    suggestions.push({
      id: "clear-cache",
      title: "Clear Cache",
      description: "Clear browser storage to free up space",
      action: async () => {
        // Clear localStorage/sessionStorage
        localStorage.clear();
        return Promise.resolve();
      },
      icon: "🗑️",
    });

    suggestions.push({
      id: "delete-old",
      title: "Delete Old Files",
      description: "Remove old documents you no longer need",
      action: async () => {
        return Promise.resolve();
      },
      icon: "📁",
    });
  }

  // File upload errors
  if (message.includes("file") || message.includes("upload")) {
    suggestions.push({
      id: "check-file",
      title: "Check File",
      description: "Make sure the file exists and is in the right format",
      action: async () => {
        return Promise.resolve();
      },
      icon: "📄",
    });

    suggestions.push({
      id: "compress-file",
      title: "Compress File",
      description: "Try compressing the file if it's too large",
      action: async () => {
        return Promise.resolve();
      },
      icon: "📦",
    });
  }

  // Default suggestions
  if (suggestions.length === 0) {
    suggestions.push(
      {
        id: "retry",
        title: "Try Again",
        description: "Retry the operation",
        action: async () => Promise.resolve(),
        icon: "🔄",
        isAutomatic: false,
      },
      {
        id: "contact-support",
        title: "Contact Support",
        description: "If the problem persists, reach out to our support team",
        action: async () => Promise.resolve(),
        icon: "💬",
      }
    );
  }

  return suggestions;
}

/**
 * Error types for categorization
 */
export enum ErrorType {
  NETWORK = "network",
  TIMEOUT = "timeout",
  VALIDATION = "validation",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  STORAGE = "storage",
  FILE = "file",
  UNKNOWN = "unknown",
}

/**
 * Categorize error by type
 */
export function categorizeError(error: Error): ErrorType {
  const message = error.message.toLowerCase();

  if (
    message.includes("network") ||
    message.includes("offline") ||
    message.includes("econnrefused")
  ) {
    return ErrorType.NETWORK;
  }
  if (message.includes("timeout")) {
    return ErrorType.TIMEOUT;
  }
  if (message.includes("validation") || message.includes("invalid")) {
    return ErrorType.VALIDATION;
  }
  if (message.includes("auth") || message.includes("401")) {
    return ErrorType.AUTHENTICATION;
  }
  if (message.includes("403")) {
    return ErrorType.AUTHORIZATION;
  }
  if (message.includes("quota") || message.includes("storage")) {
    return ErrorType.STORAGE;
  }
  if (message.includes("file")) {
    return ErrorType.FILE;
  }

  return ErrorType.UNKNOWN;
}
