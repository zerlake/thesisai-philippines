"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { thesisMilestones, type Milestone } from "../lib/milestones";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";
import { Check, CheckCircle, Clock, Edit, Save, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";

type MilestoneProgress = {
  milestone_key: string;
  deadline: string | null;
  completed_at: string | null;
};

export function MilestoneTracker({ studentId }: { studentId: string }) {
  const { supabase } = useAuth();
  const [progress, setProgress] = useState<Map<string, MilestoneProgress>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newDeadline, setNewDeadline] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (!studentId) return;

    const fetchProgress = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("thesis_milestones")
        .select("milestone_key, deadline, completed_at")
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

  const handleSaveMilestone = async (milestoneKey: string) => {
    const { error } = await supabase
      .from("thesis_milestones")
      .upsert({ student_id: studentId, milestone_key: milestoneKey, deadline: newDeadline?.toISOString() }, { onConflict: 'student_id, milestone_key' });

    if (error) {
      toast.error("Failed to save milestone.");
    } else {
      toast.success("Milestone updated.");
      const newProgress = new Map(progress);
      newProgress.set(milestoneKey, { ...newProgress.get(milestoneKey)!, milestone_key: milestoneKey, deadline: newDeadline?.toISOString() || null });
      setProgress(newProgress);
      setEditingKey(null);
      setNewDeadline(undefined);
    }
  };

  const handleToggleComplete = async (milestoneKey: string) => {
    const current = progress.get(milestoneKey);
    const newCompletedAt = current?.completed_at ? null : new Date().toISOString();

    const { error } = await supabase
      .from("thesis_milestones")
      .upsert({ student_id: studentId, milestone_key: milestoneKey, completed_at: newCompletedAt }, { onConflict: 'student_id, milestone_key' });

    if (error) {
      toast.error("Failed to update completion status.");
    } else {
      const newProgress = new Map(progress);
      newProgress.set(milestoneKey, { ...newProgress.get(milestoneKey)!, milestone_key: milestoneKey, completed_at: newCompletedAt });
      setProgress(newProgress);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Milestone Tracker</CardTitle>
        <CardDescription>Set and track key deadlines for this student.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
        ) : (
          thesisMilestones.map((milestone: Milestone) => {
            const currentProgress = progress.get(milestone.key);
            const isCompleted = !!currentProgress?.completed_at;
            const deadline = currentProgress?.deadline ? parseISO(currentProgress.deadline) : null;
            const isOverdue = deadline && !isCompleted && deadline < new Date();

            return (
              <div key={milestone.key} className="flex items-center p-2 rounded-md border">
                <milestone.icon className={cn("w-5 h-5 mr-3 flex-shrink-0", isCompleted ? "text-green-500" : "text-muted-foreground")} />
                <div className="flex-1">
                  <p className={cn("font-medium text-sm", isCompleted && "line-through text-muted-foreground")}>{milestone.title}</p>
                  {editingKey === milestone.key ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="text-xs h-7">
                            {newDeadline ? format(newDeadline, "PPP") : "Set Deadline"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={newDeadline} onSelect={setNewDeadline} initialFocus /></PopoverContent>
                      </Popover>
                      <Button size="icon" className="h-7 w-7" onClick={() => handleSaveMilestone(milestone.key)}><Save className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingKey(null)}><X className="w-4 h-4" /></Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {isCompleted ? (
                        <><CheckCircle className="w-3 h-3 text-green-500" /> Completed</>
                      ) : deadline ? (
                        isOverdue ? (
                          <><Clock className="w-3 h-3 text-red-500" /> Overdue: {format(deadline, "MMM d")}</>
                        ) : (
                          <><Clock className="w-3 h-3" /> Due: {format(deadline, "MMM d")}</>
                        )
                      ) : (
                        <span>No deadline set</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingKey(milestone.key); setNewDeadline(deadline || undefined); }}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleToggleComplete(milestone.key)}>
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}