"use client";

import { SettingsForm } from "@/components/settings-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvisorManagement } from "@/components/advisor-management";
import { useAuth } from "@/components/auth-provider";
import { DashboardCustomization } from "@/components/dashboard-customization";
import { NotificationSettings } from "@/components/notification-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CriticManagement } from "@/components/critic-management";
import { DashboardSettingsPage } from "@/components/dashboard-settings-page";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function SettingsPageContent() {
  const { profile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-center">
          <Skeleton className="h-10 w-full max-w-md" />
        </div>
        <div className="relative mt-8">
          <Skeleton className="h-32 w-full rounded-t-lg" />
          <Card className="pt-12">
            <CardHeader>
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isStudent = profile.role === 'user';
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
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="advisor">Manage Advisor</TabsTrigger>
            <TabsTrigger value="critic">Manage Critic</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile">
          {profileContent}
        </TabsContent>

        <TabsContent value="dashboard">
          <div className="mt-8">
            <DashboardSettingsPage />
          </div>
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