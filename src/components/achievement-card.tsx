"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Trophy, Award, Star } from "lucide-react";
import { Badge } from "./ui/badge";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  unlocked: boolean;
}

export function AchievementCard() {
  // For now, these are static. In a real app, these would be fetched from a backend
  // and their unlocked status would be dynamic based on user actions.
  const achievements: Achievement[] = [
    {
      id: "first_document",
      name: "First Document",
      description: "Created your first document.",
      icon: Star,
      unlocked: true, // Assuming for demo purposes
    },
    {
      id: "five_documents",
      name: "Five Documents",
      description: "Created five documents.",
      icon: Award,
      unlocked: false,
    },
    {
      id: "milestone_achieved",
      name: "Milestone Achieved",
      description: "Completed your first thesis milestone.",
      icon: Trophy,
      unlocked: true, // Assuming for demo purposes
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`flex items-center gap-3 p-3 rounded-md ${
              achievement.unlocked
                ? "bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-700"
                : "bg-muted/50 border border-border"
            }`}
          >
            <achievement.icon
              className={`w-6 h-6 ${
                achievement.unlocked ? "text-green-600" : "text-muted-foreground"
              }`}
            />
            <div>
              <p
                className={`font-medium ${
                  achievement.unlocked ? "text-green-800 dark:text-green-300" : ""
                }`}
              >
                {achievement.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {achievement.description}
              </p>
            </div>
            {achievement.unlocked && <Badge variant="secondary">Unlocked</Badge>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
