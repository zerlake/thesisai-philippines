"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { thesisMilestones } from "../lib/milestones";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";
import { Check, Clock, AlertCircle, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

type MilestoneProgress = {
  id: string;
  milestone_key: string;
  deadline: string | null;
  completed_at: string | null;
};

export function MilestoneTracker({ studentId }: { studentId: string }) {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const [progress, setProgress] = useState<Map<string, MilestoneProgress>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;

    const fetchProgress = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("thesis_milestones")
        .select("*")
        .eq("student_id", studentId);

      if (error) {
        toast.error("Failed to load milestone progress.");
      } else {
        const progressMap = new Map(data.map(item => [item.milestone_key, item]));
        setProgress(progressMap);
      }
      setIsLoading(false);
    };
    fetchProgress();
  }, [studentId, supabase]);

  const handleUpdateMilestone = async (
    milestoneKey: string,
    updates: { deadline?: string | null; completed_at?: string | null }
  ) => {
    if (!user) return;
    setIsUpdating(milestoneKey);

    const existingMilestone = progress.get(milestoneKey);

    if (existingMilestone) {
      const { error } = await supabase
        .from("thesis_milestones")
        .update(updates)
        .eq("id", existingMilestone.id);
      
      if (error) {
        toast.error("Failed to update milestone.");
      } else {
        setProgress(prev => new Map(prev).set(milestoneKey, { ...existingMilestone, ...updates }));
        toast.success("Milestone updated.");
      }
    } else {
      const { data, error } = await supabase
        .from("thesis_milestones")
        .insert({ student_id: studentId, milestone_key: milestoneKey, ...updates })
        .select()
        .single();
      
      if (error) {
        toast.error("Failed to set milestone.");
      } else if (data) {
        setProgress(prev => new Map(prev).set(milestoneKey, data));
        toast.success("Milestone set.");
      }
    }
    setIsUpdating(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Milestone Progress</CardTitle>
          <CardDescription>Set deadlines and track completion for key thesis milestones.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Milestone Progress</CardTitle>
        <CardDescription>Set deadlines and track completion for key thesis milestones.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {thesisMilestones.map((milestone) => {
          const currentProgress = progress.get(milestone.key);
          const isCompleted = !!currentProgress?.completed_at;
          const deadline = currentProgress?.deadline ? new Date(currentProgress.deadline) : null;
          const isOverdue = deadline && !isCompleted && deadline < new Date();

          return (
            <div key={milestone.key} className={cn("flex items-center p-3 rounded-md border", isCompleted ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-muted/50")}>
              <div className="flex items-center gap-3 flex-1">
                <Checkbox
                  id={`complete-${milestone.key}`}
                  checked={isCompleted}
                  onCheckedChange={(checked) => handleUpdateMilestone(milestone.key, { completed_at: checked ? new Date().toISOString() : null })}
                  disabled={isUpdating === milestone.key}
                />
                <div>
                  <Label htmlFor={`complete-${milestone.key}`} className={cn("font-medium", isCompleted && "line-through text-muted-foreground")}>{milestone.title}</Label>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {isCompleted ? (
                      <><Check className="w-3 h-3 text-green-500" /> Completed on {format(new Date(currentProgress.completed_at!), "MMM d, yyyy")}</>
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isUpdating === milestone.key}>
                    {isUpdating === milestone.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CalendarIcon className="w-4 h-4 mr-2" />{deadline ? 'Change' : 'Set'} Deadline</>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={deadline || undefined}
                    onSelect={(date) => handleUpdateMilestone(milestone.key, { deadline: date ? date.toISOString() : null })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}