import { useState, useCallback, useRef, useEffect } from "react";

export interface TimeoutState {
  isTimedOut: boolean;
  timeElapsed: number;
  timeRemaining: number;
  isExpired: boolean;
}

/**
 * Hook for proper timeout handling with user-friendly explanations
 */
export function useTimeoutHandler(
  timeoutMs: number = 10000,
  options?: {
    onTimeout?: () => void;
    warningTime?: number; // Time before actual timeout to show warning (ms)
    retryable?: boolean;
  }
) {
  const [state, setState] = useState<TimeoutState>({
    isTimedOut: false,
    timeElapsed: 0,
    timeRemaining: timeoutMs,
    isExpired: false,
  });

  const [showWarning, setShowWarning] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const timerRef = useRef<NodeJS.Timeout>();
  const warningTimerRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>(0);

  const defaultOptions = {
    warningTime: timeoutMs * 0.8, // Show warning at 80% of timeout
    retryable: true,
    ...options,
  };

  /**
   * Start the timeout
   */
  const start = useCallback(() => {
    startTimeRef.current = Date.now();
    setState({
      isTimedOut: false,
      timeElapsed: 0,
      timeRemaining: timeoutMs,
      isExpired: false,
    });
    setShowWarning(false);

    // Show warning before timeout
    if (defaultOptions.warningTime > 0) {
      warningTimerRef.current = setTimeout(() => {
        setShowWarning(true);
      }, defaultOptions.warningTime);
    }

    // Handle actual timeout
    timerRef.current = setTimeout(() => {
      setState((prev) => ({
        ...prev,
        isTimedOut: true,
        isExpired: true,
        timeElapsed: timeoutMs,
        timeRemaining: 0,
      }));

      options?.onTimeout?.();
    }, timeoutMs);
  }, [timeoutMs, defaultOptions, options]);

  /**
   * Cancel the timeout
   */
  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    setState({
      isTimedOut: false,
      timeElapsed: 0,
      timeRemaining: timeoutMs,
      isExpired: false,
    });
    setShowWarning(false);
  }, [timeoutMs]);

  /**
   * Reset and retry
   */
  const retry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    cancel();
    start();
  }, [cancel, start]);

  /**
   * Extend timeout
   */
  const extend = useCallback((additionalMs: number = 5000) => {
    const currentTime = Date.now() - (startTimeRef.current || Date.now());
    const newTimeout = timeoutMs + additionalMs;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    setShowWarning(false);

    // Recalculate timers
    const remainingMs = Math.max(0, newTimeout - currentTime);

    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
    }, Math.max(0, remainingMs - (defaultOptions.warningTime || 0)));

    timerRef.current = setTimeout(() => {
      setState((prev) => ({
        ...prev,
        isTimedOut: true,
        isExpired: true,
      }));
      options?.onTimeout?.();
    }, remainingMs);

    setState((prev) => ({
      ...prev,
      timeRemaining: remainingMs,
    }));
  }, [timeoutMs, defaultOptions, options]);

  // Update elapsed time
  useEffect(() => {
    if (state.isExpired) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - (startTimeRef.current || Date.now());
      const remaining = Math.max(0, timeoutMs - elapsed);

      setState((prev) => ({
        ...prev,
        timeElapsed: elapsed,
        timeRemaining: remaining,
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [state.isExpired, timeoutMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, []);

  return {
    state,
    showWarning,
    retryCount,
    start,
    cancel,
    retry: defaultOptions.retryable ? retry : undefined,
    extend,
    timeoutMs,
    getTimeDisplay: () => {
      const seconds = Math.ceil(state.timeRemaining / 1000);
      return `${seconds}s`;
    },
  };
}

/**
 * Hook for operation timeout with promise support
 */
export function useOperationTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number = 10000
): Promise<T> {
  return Promise.race([
    operation(),
    new Promise<T>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `Operation timed out after ${timeoutMs}ms. Please check your internet connection and try again.`
            )
          ),
        timeoutMs
      )
    ),
  ]);
}

/**
 * User-friendly timeout messages
 */
export const TIMEOUT_MESSAGES = {
  LOADING: "Still loading... This might take a moment.",
  WARNING:
    "This is taking longer than expected. You can wait or try again.",
  EXPIRED: "The request took too long. Please check your connection and try again.",
  SLOW_NETWORK:
    "Your connection seems slow. Try checking your internet connection.",
  RETRY_HINT:
    "Retrying might help. Give it another shot or contact support if the problem persists.",
  EXTEND_HINT:
    "Would you like to give it more time? Some operations take longer on slower connections.",

  NETWORK_ERROR:
    "Network issue detected. Make sure you're connected to the internet.",
  OFFLINE: "You're offline. The action will be saved and synced when you reconnect.",
  SERVER_ERROR:
    "Server is taking too long to respond. This might be temporary. Try again in a moment.",
  LARGE_FILE:
    "Your file is large. This might take a while. You can close the browser and it will continue in the background.",
};

/**
 * Estimate timeout based on file size or operation complexity
 */
export function estimateTimeout(
  fileSize?: number,
  complexity: "low" | "medium" | "high" = "medium"
): number {
  let baseTimeout = 10000; // 10 seconds

  // Adjust based on complexity
  if (complexity === "high") baseTimeout = 30000; // 30 seconds
  else if (complexity === "medium") baseTimeout = 15000; // 15 seconds

  // Adjust based on file size
  if (fileSize) {
    const sizeInMB = fileSize / (1024 * 1024);
    const additionalTime = sizeInMB * 5000; // 5 seconds per MB
    baseTimeout += additionalTime;
  }

  return Math.max(baseTimeout, 5000); // Minimum 5 seconds
}
