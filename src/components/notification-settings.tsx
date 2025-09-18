"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";
import { BellRing } from "lucide-react";

const notificationTypes = [
  { id: 'document_review', label: 'Document Reviews & Submissions' },
  { id: 'milestone_update', label: 'Milestone Updates & Reminders' },
  { id: 'advisor_request', label: 'Advisor Requests' },
  { id: 'credit_transfer', label: 'Credit Transfers & Payouts' },
];

const defaultPreferences = {
  document_review: true,
  milestone_update: true,
  advisor_request: true,
  credit_transfer: true,
};

export function NotificationSettings() {
  const { profile, supabase, refreshProfile } = useAuth();
  const [preferences, setPreferences] = useState(profile?.user_preferences?.notification_preferences || defaultPreferences);
  const [isLoading, setIsLoading] = useState(!profile);

  useEffect(() => {
    if (profile) {
      const currentPrefs = { ...defaultPreferences, ...profile.user_preferences?.notification_preferences };
      setPreferences(currentPrefs);
      setIsLoading(false);
    }
  }, [profile]);

  const handlePreferenceChange = async (typeId: string, checked: boolean) => {
    if (!profile) return;

    const newPreferences = { ...preferences, [typeId]: checked };
    setPreferences(newPreferences);

    const { error } = await supabase
      .from('user_preferences')
      .upsert({ user_id: profile.id, notification_preferences: newPreferences });

    if (error) {
      toast.error("Failed to save notification preference.");
      setPreferences(preferences); // Revert on error
    } else {
      toast.success("Preference saved!");
      await refreshProfile();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Manage how you receive notifications.</CardDescription>
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
        <CardTitle className="flex items-center gap-3">
          <BellRing className="w-6 h-6" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Choose which in-app notifications you want to receive. Email notifications are not yet supported.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {notificationTypes.map(type => (
          <div key={type.id} className="flex items-center justify-between p-3 rounded-md border">
            <Label htmlFor={type.id}>{type.label}</Label>
            <Switch
              id={type.id}
              checked={preferences[type.id as keyof typeof preferences]}
              onCheckedChange={(checked) => handlePreferenceChange(type.id, checked)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}