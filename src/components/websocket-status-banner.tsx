"use client";

import { AlertCircle, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface WebSocketStatusBannerProps {
  isConnected: boolean;
  isReconnecting: boolean;
  isOfflineMode: boolean;
  error: {
    message: string;
    code?: string;
    isRetryable?: boolean;
    attemptNumber?: number;
    maxAttempts?: number;
  } | null;
  onReconnect?: () => void;
}

export function WebSocketStatusBanner({
  isConnected,
  isReconnecting,
  isOfflineMode,
  error,
  onReconnect
}: WebSocketStatusBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show banner when there's an issue
    setIsVisible(!isConnected && !isReconnecting);
  }, [isConnected, isReconnecting]);

  if (isVisible && (error || isOfflineMode)) {
    return (
      <Alert className="border-yellow-500 bg-yellow-50 text-yellow-900 rounded-lg mb-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {isOfflineMode ? (
              <WifiOff className="h-5 w-5 text-yellow-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            )}
          </div>
          <div className="flex-1">
            <AlertDescription className="text-sm">
              <div className="font-semibold mb-1">
                {isOfflineMode
                  ? "Operating in Offline Mode"
                  : "Connection Issue Detected"}
              </div>
              <div className="text-xs text-yellow-800 mb-3">
                {isOfflineMode
                  ? "The real-time connection is unavailable. You can still use the app, but updates may be delayed."
                  : error?.message || "Unable to establish real-time connection. Attempting to reconnect..."}
              </div>
              {error?.attemptNumber && (
                <div className="text-xs text-yellow-700 mb-2">
                  Reconnection attempt {error.attemptNumber} of {error.maxAttempts}
                </div>
              )}
            </AlertDescription>
          </div>
          <div className="flex-shrink-0">
            {onReconnect && (error?.isRetryable !== false) && (
              <Button
                size="sm"
                variant="outline"
                onClick={onReconnect}
                className="gap-2 text-yellow-700 border-yellow-300 hover:bg-yellow-100"
              >
                <RefreshCw className="h-4 w-4" />
                Reconnect
              </Button>
            )}
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 text-yellow-600 hover:text-yellow-700"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </Alert>
    );
  }

  // Show reconnecting status
  if (isReconnecting) {
    return (
      <Alert className="border-blue-300 bg-blue-50 text-blue-900 rounded-lg mb-4">
        <div className="flex items-center gap-3">
          <Wifi className="h-5 w-5 text-blue-600 animate-pulse" />
          <AlertDescription className="text-sm">
            <span className="font-semibold">Reconnecting...</span>
            <span className="text-blue-700 ml-2">Please wait while we restore your connection.</span>
          </AlertDescription>
        </div>
      </Alert>
    );
  }

  return null;
}
