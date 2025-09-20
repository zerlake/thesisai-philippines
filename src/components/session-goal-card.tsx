"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Check, Edit, Target } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { toast } from "sonner";

const LOCAL_STORAGE_KEY = "thesis-session-goal";

type Goal = {
  text: string;
  isCompleted: boolean;
};

export function SessionGoalCard() {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    try {
      const storedGoal = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedGoal) {
        setGoal(JSON.parse(storedGoal));
      }
    } catch (error) {
      console.error("Failed to parse goal from localStorage", error);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  const handleSetGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editText.trim()) return;
    
    // Validate goal length - keep it realistic
    const wordCount = editText.trim().split(/\s+/).length;
    if (wordCount > 10) {
      toast.warning("Please make your goal more specific and concise.");
      return;
    }
    
    const newGoal = { text: editText, isCompleted: false };
    setGoal(newGoal);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newGoal));
    setIsEditing(false);
    setEditText("");
    toast.success("Session goal set!");
  };

  const handleToggleCompletion = (isCompleted: boolean) => {
    if (!goal) return;
    const updatedGoal = { ...goal, isCompleted };
    setGoal(updatedGoal);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedGoal));
  };

  const handleEdit = () => {
    if (!goal) return;
    setEditText(goal.text);
    setIsEditing(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Today's Goal</CardTitle>
        <div className="p-2 bg-primary/10 rounded-md">
          <Target className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        {!goal || isEditing ? (
          <form onSubmit={handleSetGoal} className="flex items-center gap-2 pt-2">
            <Input
              placeholder="e.g., Write 300 words..."
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />
            <Button type="submit" size="icon">
              <Check className="w-4 h-4" />
            </Button>
          </form>
        ) : (
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="goal-checkbox"
                checked={goal.isCompleted}
                onCheckedChange={(checked) => handleToggleCompletion(!!checked)}
              />
              <Label
                htmlFor="goal-checkbox"
                className={`text-base font-medium ${
                  goal.isCompleted ? "line-through text-muted-foreground" : ""
                }`}
              >
                {goal.text}
              </Label>
            </div>
            <Button variant="ghost" size="icon" onClick={handleEdit}>
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}