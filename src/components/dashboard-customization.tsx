"use client";

import { useAuth } from "./auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";
import { useState, useEffect } from "react";

const widgetConfig = [
  { id: 'stats', label: 'Project Statistics Cards' },
  { id: 'next_action', label: 'What\'s Next & Feedback Cards' },
  { id: 'recent_activity', label: 'Recent Activity Chart' },
  { id: 'checklist', label: 'Thesis Checklist' },
  { id: 'session_goal', label: 'Session Goal Card' },
  { id: 'writing_streak', label: 'Writing Streak Card' },
  { id: 'milestones', label: 'My Milestones Card' },
  { id: 'quick_access', label: 'Quick Access Tools' },
];

const defaultWidgets = {
  stats: true,
  next_action: true,
  recent_activity: true,
  checklist: true,
  session_goal: true,
  writing_streak: true,
  milestones: true,
  quick_access: true,
};

export function DashboardCustomization() {
  const { profile, supabase, refreshProfile } = useAuth();
  const [widgets, setWidgets] = useState(profile?.user_preferences?.dashboard_widgets || defaultWidgets);
  const [isLoading, setIsLoading] = useState(!profile);

  useEffect(() => {
    if (profile) {
      // Ensure all keys exist, falling back to default
      const currentWidgets = { ...defaultWidgets, ...profile.user_preferences?.dashboard_widgets };
      setWidgets(currentWidgets);
      setIsLoading(false);
    }
  }, [profile]);

  const handleWidgetToggle = async (widgetId: string, checked: boolean) => {
    if (!profile) return;

    const newWidgets = { ...widgets, [widgetId]: checked };
    setWidgets(newWidgets);

    const { error } = await supabase
      .from('user_preferences')
      .upsert({ user_id: profile.id, dashboard_widgets: newWidgets });

    if (error) {
      toast.error("Failed to save preference.");
      // Revert state on error
      setWidgets(widgets);
    } else {
      toast.success("Preference saved!");
      await refreshProfile();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Customization</CardTitle>
          <CardDescription>Choose which widgets to display on your dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard Customization</CardTitle>
        <CardDescription>Choose which widgets to display on your dashboard.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {widgetConfig.map(widget => (
          <div key={widget.id} className="flex items-center justify-between p-3 rounded-md border">
            <Label htmlFor={widget.id}>{widget.label}</Label>
            <Switch
              id={widget.id}
              checked={widgets[widget.id as keyof typeof widgets]}
              onCheckedChange={(checked) => handleWidgetToggle(widget.id, checked)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}