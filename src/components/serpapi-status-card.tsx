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
import { apiCall } from "@/lib/api-client";

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
  const [isFetchingStatus, setIsFetchingStatus] = useState(false);
  const [fetchError, setFetchError] = useState<Error | null>(null);
  const hasFetchedRef = useRef(false);

  const serpApiUrl = useMemo(() => getSupabaseFunctionUrl("get-serpapi-status"), []);

  // Effect to fetch status when component mounts and session is available
  useEffect(() => {
    if (!session?.access_token || hasFetchedRef.current) return;

    const fetchStatus = async () => {
      setIsFetchingStatus(true);
      setFetchError(null);
      hasFetchedRef.current = true;

      try {
        const response = await apiCall<SerpApiStatus>(serpApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
        });
        setStatus(response.data);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setFetchError(err);
        toast.error(err.message);
        console.error("Error fetching SerpApi status:", error);
      } finally {
        setIsFetchingStatus(false);
      }
    };

    fetchStatus();
  }, [session?.access_token, serpApiUrl]);

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