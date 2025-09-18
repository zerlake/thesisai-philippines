"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";
import { Timer } from "lucide-react";

export function FeedbackTurnaroundCard() {
  const { session, supabase } = useAuth();
  const [avgDays, setAvgDays] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    const fetchAnalytics = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('get_advisor_dashboard_analytics', {
        p_advisor_id: session.user.id
      });

      if (error) {
        toast.error("Failed to load analytics data.");
        console.error(error);
      } else {
        setAvgDays(data.avg_feedback_days);
      }
      setIsLoading(false);
    };

    fetchAnalytics();
  }, [session, supabase]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback Analytics</CardTitle>
        <CardDescription>Metrics on your advising activities.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="text-center p-4 bg-tertiary rounded-lg">
            <p className="text-4xl font-bold">{avgDays !== null ? avgDays.toFixed(1) : 'N/A'}</p>
            <p className="text-sm text-muted-foreground">
              Average days to provide feedback
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}