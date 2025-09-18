"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { thesisChecklist, type ChecklistPhase } from "../lib/checklist-items";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";

const allItems = thesisChecklist.flatMap((phase: ChecklistPhase) => phase.items);
const totalItems = allItems.length;

export function StudentChecklist({ studentId }: { studentId: string }) {
  const { supabase } = useAuth();
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;

    const fetchCheckedItems = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("checklist_progress")
        .select("item_id")
        .eq("user_id", studentId);

      if (error) {
        toast.error("Failed to load student checklist progress.");
      } else {
        setCheckedItems(data.map((item: { item_id: string }) => item.item_id));
      }
      setIsLoading(false);
    };

    fetchCheckedItems();
  }, [studentId, supabase]);

  const progressPercentage = (checkedItems.length / totalItems) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thesis Checklist Progress</CardTitle>
        <CardDescription>A step-by-step guide from topic to submission.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <div className="space-y-4">
            <div>
              <Progress value={progressPercentage} className="mb-2" />
              <p className="text-sm text-muted-foreground text-center">
                {checkedItems.length} of {totalItems} tasks completed ({Math.round(progressPercentage)}%)
              </p>
            </div>
            <Accordion type="multiple" className="w-full max-h-80 overflow-y-auto pr-2">
              {thesisChecklist.map((phase: ChecklistPhase) => (
                <AccordionItem value={phase.id} key={phase.id}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-3">
                      <phase.icon className="w-5 h-5" />
                      <span className="font-semibold">{phase.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pl-4 border-l-2 ml-2">
                      {phase.items.map(item => (
                        <div key={item.id} className="flex items-start space-x-3">
                          <Checkbox id={`student-${item.id}`} checked={checkedItems.includes(item.id)} disabled />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor={`student-${item.id}`} className={checkedItems.includes(item.id) ? "line-through text-muted-foreground" : ""}>
                              {item.title}
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
}