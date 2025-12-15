"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { cn } from "../lib/utils";
import { ArrowRight, type LucideIcon, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

type Action = {
  type: 'feedback' | 'milestone' | 'task' | 'chapter_continuation';
  title: string;
  detail: string;
  urgency: 'critical' | 'high' | 'normal';
  href: string;
  icon: LucideIcon;
  chapter?: string;
  phase?: string;
  completion_percentage?: number;
};

interface WhatsNextCardProps {
  nextAction: Action | null;
  isLoading: boolean;
}

export function WhatsNextCard({ nextAction, isLoading }: WhatsNextCardProps) {
  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (!nextAction) {
    return null; // Don't show the card if there's nothing to do
  }

  const urgencyClasses = {
    critical: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300",
    high: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300",
    normal: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300",
  };

  const Icon = nextAction.icon;
  const completionPercentage = nextAction.completion_percentage ?? 0;
  const showProgress = nextAction.chapter && nextAction.completion_percentage !== undefined;

  return (
    <Card className={cn("border-2 transition-all", urgencyClasses[nextAction.urgency])}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Icon className="w-6 h-6" />
          <span>What&apos;s Next?</span>
          {nextAction.urgency === 'critical' && (
            <span className="ml-auto text-xs font-bold bg-red-600 text-white px-2 py-1 rounded flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              URGENT
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h3 className="text-xl font-bold">{nextAction.title}</h3>
          <p className="text-sm opacity-80 mt-1">{nextAction.detail}</p>
        </div>

        {/* Show progress for chapter work */}
        {showProgress && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span>Progress</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  nextAction.urgency === 'critical' ? "bg-red-500" :
                  nextAction.urgency === 'high' ? "bg-amber-500" :
                  "bg-blue-500"
                )}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        )}

        <Link href={nextAction.href} className="block">
          <Button className="w-full">
            Start Now <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}