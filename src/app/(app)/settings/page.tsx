"use client";

import { SettingsForm } from "@/components/settings-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvisorManagement } from "@/components/advisor-management";
import { useAuth } from "@/components/auth-provider";

export default function SettingsPage() {
  const { profile } = useAuth();
  const isStudent = profile?.role === 'user';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="relative">
        <div className="h-32 bg-muted rounded-t-lg"></div>
        <Card className="pt-12">
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm />
          </CardContent>
        </Card>
      </div>
      {isStudent && <AdvisorManagement />}
    </div>
  );
}