'use client';

import { useEffect, useState } from "react";
import { useAuth } from "./auth-provider";

import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";
import { Timer, Users } from "lucide-react";
import { DashboardNotificationSettings } from "./dashboard-notification-settings";
import { CriticStudentList } from "./critic-student-list";
import { StatCard } from "./stat-card";
import { CriticReviewQueueCard } from "./critic-review-queue-card";
import { CriticRequestsCard } from "./critic-requests-card";
import { AIOnboardingModal } from "./ai-onboarding-modal";

export function CriticDashboard() {
  const { session, supabase } = useAuth();
  const [analytics, setAnalytics] = useState<{ avg_turnaround_days: number | null, student_count: number }>({ avg_turnaround_days: null, student_count: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    const fetchAnalytics = async () => {
      setIsLoading(true);

      // Try to call the analytics function, but handle gracefully if it doesn't exist
      let avg_turnaround_days = null;
      let student_count = 0;

      try {
        const analyticsResult = await supabase.rpc('get_critic_dashboard_analytics', {
          p_critic_id: session.user.id
        });

        if (analyticsResult.error) {
          console.warn("Analytics function not available:", analyticsResult.error);
          // Set a default value or skip this metric
          avg_turnaround_days = null;
        } else {
          avg_turnaround_days = analyticsResult.data?.avg_turnaround_days || null;
        }
      } catch (error) {
        console.warn("Analytics function call failed:", error);
        avg_turnaround_days = null;
      }

      try {
        const studentCountResult = await supabase
          .from('critic_student_relationships')
          .select('*', { count: 'exact', head: true })
          .eq('critic_id', session.user.id);

        if (studentCountResult.error) {
          console.error("Failed to fetch student count:", studentCountResult.error);
          toast.error("Failed to load student count analytics.");
        } else {
          student_count = studentCountResult.count || 0;
        }
      } catch (error) {
        console.error("Failed to fetch student count:", error);
        toast.error("Failed to load student count analytics.");
      }

      setAnalytics({
        avg_turnaround_days,
        student_count,
      });

      setIsLoading(false);
    };

    fetchAnalytics();
  }, [session, supabase]);

  return (
    <>
      <AIOnboardingModal />
      <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Critic Dashboard</h1>
          <p className="text-muted-foreground">Review assigned manuscripts and manage your workflow.</p>
        </div>
        <DashboardNotificationSettings userRole="critic" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <StatCard title="Total Students" value={isLoading ? <Skeleton className="h-8 w-12" /> : analytics.student_count} icon={Users} />
        <StatCard title="Avg. Certification Time" value={isLoading ? <Skeleton className="h-8 w-12" /> : `${analytics.avg_turnaround_days?.toFixed(1) ?? 'N/A'} days`} icon={Timer} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CriticReviewQueueCard />
        </div>
        <div className="space-y-6">
          <CriticRequestsCard />
        </div>
      </div>

      <CriticStudentList />
    </div>
    </>
  );
}