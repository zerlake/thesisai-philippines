"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";
import { Timer, Users } from "lucide-react";
import { CriticStudentList } from "./critic-student-list";
import { StatCard } from "./stat-card";
import { CriticReviewQueueCard } from "./critic-review-queue-card";

export function CriticDashboard() {
  const { session, supabase } = useAuth();
  const [analytics, setAnalytics] = useState<{ avg_turnaround_days: number | null, student_count: number }>({ avg_turnaround_days: null, student_count: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    const fetchAnalytics = async () => {
      setIsLoading(true);
      
      const analyticsPromise = supabase.rpc('get_critic_dashboard_analytics', {
        p_critic_id: session.user.id
      });

      const studentCountPromise = supabase
        .from('critic_student_relationships')
        .select('*', { count: 'exact', head: true })
        .eq('critic_id', session.user.id);

      const [analyticsResult, studentCountResult] = await Promise.all([analyticsPromise, studentCountPromise]);

      if (analyticsResult.error || studentCountResult.error) {
        toast.error("Failed to load dashboard analytics.");
        console.error(analyticsResult.error || studentCountResult.error);
      } else {
        setAnalytics({
          avg_turnaround_days: analyticsResult.data.avg_turnaround_days,
          student_count: studentCountResult.count || 0,
        });
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

      <div className="grid gap-6 md:grid-cols-2">
        <StatCard title="Total Students" value={isLoading ? <Skeleton className="h-8 w-12" /> : analytics.student_count} icon={Users} />
        <StatCard title="Avg. Certification Time" value={isLoading ? <Skeleton className="h-8 w-12" /> : `${analytics.avg_turnaround_days?.toFixed(1) ?? 'N/A'} days`} icon={Timer} />
      </div>

      <CriticReviewQueueCard />

      <CriticStudentList />
    </div>
  );
}