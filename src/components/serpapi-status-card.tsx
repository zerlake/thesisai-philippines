"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useAuth } from "./auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Globe } from "lucide-react";
import { getSupabaseFunctionUrl } from "@/integrations/supabase/client";
import { useApiCall } from "@/hooks/use-api-call";

type SerpApiStatus = {
  account_email: string;
  plan_title: string;
  plan_searches_left: number;
  searches_per_month: number;
  this_month_usage: number;
};

export function SerpApiStatusCard() {
  const { session } = useAuth();
  const [status, setStatus] = useState<SerpApiStatus | null>(null);

  const serpApiUrl = useMemo(() => getSupabaseFunctionUrl("get-serpapi-status"), []);

  const { execute: fetchSerpApiStatus, loading: isFetchingStatus, error: fetchError } = useApiCall<SerpApiStatus>({
    onSuccess: (data) => {
      setStatus(data);
    },
    onError: (error) => {
      toast.error(error.message);
      console.error(error);
    },
    autoErrorToast: false, // We handle toast explicitly
  });

  // Effect to fetch status when component mounts and session is available
  useEffect(() => {
    if (!session) return; // Only proceed if session exists

    const fetchStatus = async () => {
      try {
        await fetchSerpApiStatus(serpApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
        });
      } catch (error) {
        // Errors are handled by useApiCall's onError
        console.error("Local error before API call in fetchStatus:", error);
      }
    };

    // Call immediately when session becomes available
    fetchStatus();
  }, [session?.access_token, fetchSerpApiStatus, serpApiUrl]); // Include serpApiUrl in dependencies

  const usagePercentage = status ? (status.this_month_usage / status.searches_per_month) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>SerpApi Status</CardTitle>
                <CardDescription>Usage for the Google Scholar integration.</CardDescription>
            </div>
            <Globe className="w-6 h-6 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {isFetchingStatus ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : fetchError ? (
          <p className="text-sm text-destructive">{fetchError.message}</p>
        ) : status ? (
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
                <p className="text-sm font-medium">{status.account_email}</p>
                <Badge variant="outline">{status.plan_title}</Badge>
            </div>
            <div>
                <Progress value={usagePercentage} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2 text-center">
                    {status.this_month_usage.toLocaleString()} / {status.searches_per_month.toLocaleString()} searches used this month
                </p>
                <p className="text-sm font-bold text-center mt-1">
                    {status.plan_searches_left.toLocaleString()} searches remaining
                </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No status data available.</p>
        )}
      </CardContent>
    </Card>
  );
}