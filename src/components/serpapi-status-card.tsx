"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Globe } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    const fetchStatus = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          "https://dnyjgzzfyzrsucucexhy.supabase.co/functions/v1/get-serpapi-status",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            },
          }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error((data as { error?: string }).error || "Failed to fetch SerpApi status.");
        }
        setStatus(data as SerpApiStatus);
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [session]);

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
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
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