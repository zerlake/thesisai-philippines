"use client";

import { Calendar, Clock, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { DashboardSyncIndicator } from "./dashboard/DashboardSyncIndicator";

interface DashboardHeaderProps {
  displayName: string;
  streak?: number;
  projectProgress?: number;
}

export function DashboardHeader({ displayName, streak = 0, projectProgress = 0 }: DashboardHeaderProps) {
  return (
    <div className="space-y-6 border-b bg-gradient-to-b from-background to-background/50 pb-8">
      {/* Main Title Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Welcome back, <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">{displayName}</span>
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Here's your research thesis progress and upcoming actions.
          </p>
        </div>
        
        {/* Sync Status Indicator */}
        <div className="flex items-center">
          <DashboardSyncIndicator className="px-4 py-2 rounded-lg bg-card/50 border" />
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Writing Streak */}
        <div className="flex items-center gap-3 rounded-lg border bg-card/50 p-4 backdrop-blur-sm">
          <div className="rounded-lg bg-orange-100 p-2.5 dark:bg-orange-950">
            <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Writing Streak</p>
            <p className="text-2xl font-bold text-foreground">{streak}</p>
            <span className="text-xs text-muted-foreground">days in a row</span>
          </div>
        </div>

        {/* Project Status */}
        <div className="flex items-center gap-3 rounded-lg border bg-card/50 p-4 backdrop-blur-sm">
          <div className="rounded-lg bg-blue-100 p-2.5 dark:bg-blue-950">
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Overall Progress</p>
            <p className="text-2xl font-bold text-foreground">{projectProgress}%</p>
            <span className="text-xs text-muted-foreground">thesis completion</span>
          </div>
        </div>

        {/* Quick Action */}
        <div className="flex items-center gap-3 rounded-lg border bg-card/50 p-4 backdrop-blur-sm">
          <div className="rounded-lg bg-green-100 p-2.5 dark:bg-green-950">
            <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Last Session</p>
            <p className="text-2xl font-bold text-foreground">Today</p>
            <span className="text-xs text-muted-foreground">2 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
