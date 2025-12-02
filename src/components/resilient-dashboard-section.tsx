"use client";

import { AlertCircle, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ReactNode } from "react";

interface ResilientDashboardSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  fallbackContent?: ReactNode;
  isOfflineMode?: boolean;
  error?: string | null;
  isLoading?: boolean;
}

/**
 * Dashboard section that gracefully handles WebSocket unavailability
 * Shows cached/static content when connection is lost
 */
export function ResilientDashboardSection({
  title,
  description,
  children,
  fallbackContent,
  isOfflineMode = false,
  error = null,
  isLoading = false
}: ResilientDashboardSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {title}
              {isOfflineMode && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                  <Zap className="h-3 w-3" />
                  Offline
                </span>
              )}
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4 border-red-300 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 text-sm">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {isOfflineMode && fallbackContent && (
          <Alert className="mb-4 border-blue-300 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              Showing cached data. Real-time updates will resume when connection is restored.
            </AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 rounded-full border-4 border-gray-300 border-t-blue-600 animate-spin" />
              <p className="text-sm text-gray-600">Loading{isOfflineMode ? " cached data" : ""}...</p>
            </div>
          </div>
        )}

        {!isLoading && (
          <>
            {isOfflineMode && fallbackContent ? (
              <div className="opacity-75">
                {fallbackContent}
              </div>
            ) : (
              children
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton fallback content for dashboard sections
 */
export function DashboardSectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded w-full animate-pulse" />
        ))}
      </div>
    </div>
  );
}
