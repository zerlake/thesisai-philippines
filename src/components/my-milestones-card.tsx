"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { thesisMilestones } from "../lib/milestones";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";
import { CheckCircle, Clock, AlertCircle, Trophy } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../lib/utils";

type MilestoneProgress = {
  milestone_key: string;
  deadline: string | null;
  completed_at: string | null;
};

export function MyMilestonesCard() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const [progress, setProgress] = useState<Map<string, MilestoneProgress>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProgress = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("thesis_milestones")
        .select("milestone_key, deadline, completed_at")
        .eq("student_id", user.id);

      if (error) {
        toast.error("Failed to load milestone progress.");
      } else {
        const progressMap = new Map(data.map(item => [item.milestone_key, item]));
        setProgress(progressMap);
      }
      setIsLoading(false);
    };
    fetchProgress();
  }, [user, supabase]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Milestones</CardTitle>
          <CardDescription>Deadlines set by your advisor.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  const hasMilestones = Array.from(progress.values()).some(p => p.deadline || p.completed_at);

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Milestones</CardTitle>
        <CardDescription>A timeline of key deadlines set by your advisor.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {hasMilestones ? (
          thesisMilestones.map((milestone) => {
            const currentProgress = progress.get(milestone.key);
            if (!currentProgress?.deadline && !currentProgress?.completed_at) {
              return null; // Don't show milestones that haven't been set by the advisor
            }

            const isCompleted = !!currentProgress?.completed_at;
            const deadline = currentProgress?.deadline ? new Date(currentProgress.deadline) : null;
            const isOverdue = deadline && !isCompleted && deadline < new Date();

            return (
              <div key={milestone.key} className={cn("flex items-center p-3 rounded-md border", isCompleted ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-muted/50")}>
                <milestone.icon className={cn("w-5 h-5 mr-4 flex-shrink-0", isCompleted ? "text-green-500" : "text-muted-foreground")} />
                <div className="flex-1">
                  <p className={cn("font-medium", isCompleted && "line-through text-muted-foreground")}>{milestone.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {isCompleted ? (
                      <><CheckCircle className="w-3 h-3 text-green-500" /> Completed on {format(new Date(currentProgress.completed_at!), "MMM d, yyyy")}</>
                    ) : deadline ? (
                      isOverdue ? (
                        <><AlertCircle className="w-3 h-3 text-red-500" /> Overdue: {format(deadline, "MMM d, yyyy")}</>
                      ) : (
                        <><Clock className="w-3 h-3" /> Due: {format(deadline, "MMM d, yyyy")}</>
                      )
                    ) : (
                      <span>No deadline set</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Your advisor has not set any milestones yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}