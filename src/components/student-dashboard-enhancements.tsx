"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Heart, Trophy, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export function WellbeingWidget() {
  const [mood, setMood] = useState<string | null>(null);

  const moods = [
    { emoji: "😊", label: "Feeling Good", color: "text-green-500" },
    { emoji: "😐", label: "Neutral", color: "text-yellow-500" },
    { emoji: "😔", label: "Needing Support", color: "text-red-500" }
  ];

  const handleSubmitMood = (selectedMood: string) => {
    setMood(selectedMood);
    toast.success("Your wellbeing check-in has been recorded!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Wellbeing Check-in
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mood ? (
          <div className="text-center py-4">
            <p className="text-2xl mb-2">{mood}</p>
            <p className="text-sm text-muted-foreground">Thank you for checking in!</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {moods.map((mood) => (
              <button
                key={mood.label}
                onClick={() => handleSubmitMood(mood.emoji)}
                className={`p-4 rounded-lg border-2 hover:border-primary transition-all ${mood.color}`}
              >
                <span className="text-3xl block">{mood.emoji}</span>
                <span className="text-xs mt-2">{mood.label}</span>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProgressMilestones() {
  const [milestoneProgress, setMilestoneProgress] = useState([
    { name: "Proposal Defense", completed: true },
    { name: "Chapter I Draft", completed: true },
    { name: "Chapter II Draft", completed: false },
    { name: "Chapter III Draft", completed: false },
    { name: "Final Defense", completed: false }
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Your Milestones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {milestoneProgress.map((milestone, index) => (
            <div key={milestone.name} className="flex items-center justify-between">
              <span className={milestone.completed ? "text-muted-foreground line-through" : ""}>
                {index + 1}. {milestone.name}
              </span>
              <div className="flex items-center gap-2">
                {milestone.completed && (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                )}
                <input 
                  type="checkbox" 
                  defaultChecked={milestone.completed}
                  className="rounded accent-primary"
                  onChange={() => {
                    const updated = [...milestoneProgress];
                    updated[index].completed = !updated[index].completed;
                    setMilestoneProgress(updated);
                    toast.success(`${updated[index].name} marked as ${updated[index].completed ? 'complete' : 'in progress'}!`);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}