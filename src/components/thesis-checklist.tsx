"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { thesisChecklist, type ChecklistItem, type ChecklistPhase } from "../lib/checklist-items";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";
import Confetti from "react-confetti";
import { useWindowSize } from "../hooks/use-window-size";
import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const allItems = thesisChecklist.flatMap((phase: ChecklistPhase) => phase.items);
const totalItems = allItems.length;

export function ThesisChecklist() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [openPhases, setOpenPhases] = useState<string[]>(["phase-1"]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (!user) return;

    const fetchCheckedItems = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("checklist_progress")
        .select("item_id")
        .eq("user_id", user.id);

      if (error) {
        toast.error("Failed to load checklist progress.");
        console.error(error);
      } else {
        setCheckedItems(data.map((item: { item_id: string }) => item.item_id));
      }
      setIsLoading(false);
    };

    fetchCheckedItems();
  }, [user, supabase]);

  const handleCheckedChange = async (itemId: string, isChecked: boolean) => {
    if (!user) return;

    const originalState = [...checkedItems];
    const newState = isChecked
      ? [...checkedItems, itemId]
      : checkedItems.filter((id) => id !== itemId);
    setCheckedItems(newState);

    if (newState.length === totalItems && originalState.length !== totalItems) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 8000); // Let the confetti run for 8 seconds
    }

    if (isChecked) {
      const { error } = await supabase
        .from("checklist_progress")
        .insert({ user_id: user.id, item_id: itemId });
      
      if (error) {
        toast.error("Failed to save progress.");
        setCheckedItems(originalState); // Revert on error
      }
    } else {
      const { error } = await supabase
        .from("checklist_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("item_id", itemId);

      if (error) {
        toast.error("Failed to save progress.");
        setCheckedItems(originalState); // Revert on error
      }
    }
  };

  const progressPercentage = (checkedItems.length / totalItems) * 100;

  if (isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Thesis/Dissertation Checklist</CardTitle>
          <CardDescription>A step-by-step guide from topic to submission, based on best practices.</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2 relative overflow-hidden">
      {showConfetti && <Confetti width={width} height={height} recycle={false} />}
      <CardHeader>
        <CardTitle>Thesis/Dissertation Checklist</CardTitle>
        <CardDescription>
          A step-by-step guide from topic to submission, based on best practices.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Progress value={progressPercentage} className="mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              {checkedItems.length} of {totalItems} tasks completed ({Math.round(progressPercentage)}%)
            </p>
          </div>
          <Accordion type="multiple" value={openPhases} onValueChange={setOpenPhases} className="w-full">
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
                    <AnimatePresence>
                      {phase.items.map((item: ChecklistItem) => {
                        const isChecked = checkedItems.includes(item.id);
                        
                        const handleDragEnd = (event: any, info: any) => {
                          if (info.offset.x > 50 && !isChecked) {
                            handleCheckedChange(item.id, true);
                          } else if (info.offset.x < -50 && isChecked) {
                            handleCheckedChange(item.id, false);
                          }
                        };

                        return (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }}
                            exit={{ opacity: 0, scale: 0.8, x: 50 }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={{ left: 0.2, right: 0.2 }}
                            onDragEnd={handleDragEnd}
                            className="flex items-start space-x-3 cursor-grab active:cursor-grabbing"
                          >
                            <Checkbox
                              id={item.id}
                              checked={isChecked}
                              onCheckedChange={(isChecked) => handleCheckedChange(item.id, !!isChecked)}
                              className="mt-1"
                            />
                            <div className="grid gap-1.5 leading-none">
                              <Label
                                htmlFor={item.id}
                                className={`font-medium ${
                                  isChecked ? "line-through text-muted-foreground" : ""
                                }`}
                              >
                                {item.title}
                              </Label>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                              {item.href && (
                                <Link href={item.href} className="mt-1">
                                  <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                                    Go to {item.toolName}
                                    <ArrowRight className="w-3 h-3 ml-1" />
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}