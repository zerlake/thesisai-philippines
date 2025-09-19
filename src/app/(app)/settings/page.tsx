"use client";

import { SettingsForm } from "@/components/settings-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvisorManagement } from "@/components/advisor-management";
import { useAuth } from "@/components/auth-provider";
import { DashboardCustomization } from "@/components/dashboard-customization";
import { NotificationSettings } from "@/components/notification-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CriticManagement } from "@/components/critic-management";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function SettingsPageContent() {
  const { profile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isStudent = profile?.role === 'user';
  const activeTab = searchParams.get('tab') || 'profile';

  const handleTabChange = (value: string) => {
    router.push(`/settings?tab=${value}`, { scroll: false });
  };

  const profileContent = (
    <div className="space-y-8">
      <div className="relative mt-8">
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
      <NotificationSettings />
      {isStudent && <DashboardCustomization />}
    </div>
  );

  if (!isStudent) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {profileContent}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="flex justify-center">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="advisor">Manage Advisor</TabsTrigger>
            <TabsTrigger value="critic">Manage Critic</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile">
          {profileContent}
        </TabsContent>

        <TabsContent value="advisor">
          <div className="mt-8">
            <AdvisorManagement />
          </div>
        </TabsContent>

        <TabsContent value="critic">
          <div className="mt-8">
            <CriticManagement />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SettingsPageContent />
    </Suspense>
  );
}