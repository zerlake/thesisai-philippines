"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";
import { Timer } from "lucide-react";
import { CriticStudentList } from "./critic-student-list";

export function CriticDashboard() {
  const { session, supabase } = useAuth();
  const [avgTurnaround, setAvgTurnaround] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    const fetchAnalytics = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('get_critic_dashboard_analytics', {
        p_critic_id: session.user.id
      });

      if (error) {
        toast.error("Failed to load dashboard analytics.");
        console.error(error);
      } else {
        setAvgTurnaround(data.avg_turnaround_days);
      }
      setIsLoading(false);
    };

    fetchAnalytics();
  }, [session, supabase]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Critic Dashboard</h1>
        <p className="text-muted-foreground">Review assigned manuscripts and manage your workflow.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
            <CardDescription>Metrics on your review activities.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <div className="text-center p-4 bg-tertiary rounded-lg">
                <p className="text-4xl font-bold">{avgTurnaround !== null ? avgTurnaround.toFixed(1) : 'N/A'}</p>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Timer className="w-4 h-4" />
                  Average days for certification
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CriticStudentList />
    </div>
  );
}