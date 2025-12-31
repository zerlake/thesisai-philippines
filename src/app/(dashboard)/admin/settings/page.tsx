"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Settings, Save, Bell, Shield, Database, Mail } from "lucide-react";

export default function SystemSettingsPage() {
  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">Configure platform-wide settings</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Notifications</CardTitle>
            <CardDescription>Configure system notification settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div><div className="font-medium">Email Notifications</div><div className="text-sm text-muted-foreground">Send email alerts for system events</div></div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div><div className="font-medium">Push Notifications</div><div className="text-sm text-muted-foreground">Enable browser push notifications</div></div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div><div className="font-medium">Maintenance Alerts</div><div className="text-sm text-muted-foreground">Notify users before scheduled maintenance</div></div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Security</CardTitle>
            <CardDescription>Security and authentication settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div><div className="font-medium">Two-Factor Authentication</div><div className="text-sm text-muted-foreground">Require 2FA for admin accounts</div></div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div><div className="font-medium">Session Timeout</div><div className="text-sm text-muted-foreground">Auto-logout after inactivity</div></div>
              <Input type="number" defaultValue="30" className="w-24" />
              <span className="text-sm text-muted-foreground">minutes</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" />Data Management</CardTitle>
            <CardDescription>Database and storage settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div><div className="font-medium">Auto Backup</div><div className="text-sm text-muted-foreground">Enable automatic daily backups</div></div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div><div className="font-medium">Data Retention</div><div className="text-sm text-muted-foreground">Keep deleted items for</div></div>
              <Input type="number" defaultValue="90" className="w-24" />
              <span className="text-sm text-muted-foreground">days</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button><Save className="w-4 h-4 mr-2" />Save Settings</Button>
        </div>
      </div>
    </div>
  );
}
