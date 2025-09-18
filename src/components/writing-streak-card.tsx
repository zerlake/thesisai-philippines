"use client";

import { Flame } from "lucide-react";
import { useAuth } from "./auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export function WritingStreakCard() {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Writing Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const streak = profile.writing_streak || 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Writing Streak</CardTitle>
        <Flame className={`h-5 w-5 ${streak > 0 ? 'text-orange-500 fill-orange-400' : 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{streak} day{streak !== 1 ? 's' : ''}</div>
        <p className="text-xs text-muted-foreground">
          {streak > 0 ? "Keep the fire going!" : "Save a document to start your streak."}
        </p>
      </CardContent>
    </Card>
  );
}