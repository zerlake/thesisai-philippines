"use client";

import { DashboardLayoutManager } from "./dashboard-layout-manager";
import { WidgetCacheManager } from "./widget-cache-manager";
import { WidgetSettingsManager } from "./widget-settings-manager";
import { DashboardActivityLog } from "./dashboard-activity-log";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { 
  LayoutDashboard, 
  Database, 
  Settings, 
  Activity,
  Cog,
  Monitor,
  DatabaseBackup,
  Palette
} from "lucide-react";

export function DashboardSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Settings</h1>
        <p className="text-muted-foreground">
          Customize your dashboard experience with layouts, caching, and activity tracking.
        </p>
      </div>

      <Tabs defaultValue="layout" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="layout" className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Layouts
          </TabsTrigger>
          <TabsTrigger value="cache" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Cache
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Widget Settings
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Activity Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="layout" className="space-y-6">
          <DashboardLayoutManager />
        </TabsContent>

        <TabsContent value="cache" className="space-y-6">
          <WidgetCacheManager />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <WidgetSettingsManager />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <DashboardActivityLog />
        </TabsContent>
      </Tabs>

      {/* Quick Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cog className="w-5 h-5" />
            Quick Dashboard Actions
          </CardTitle>
          <CardDescription>
            Perform common dashboard management tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Monitor className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium">Reset Layout</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Restore default dashboard layout
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Reset
            </Button>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DatabaseBackup className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium">Clear Cache</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Clear all cached widget data
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Clear
            </Button>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium">Theme Settings</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Customize dashboard appearance
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Customize
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}