'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ThemeSettings from './preference-panels/theme-settings';
import NotificationSettings from './preference-panels/notification-settings';
import AccessibilitySettings from './preference-panels/accessibility-settings';
import LayoutSettings from './preference-panels/layout-settings';
import PrivacySettings from './preference-panels/privacy-settings';
import DeviceManagement from './preference-panels/device-management';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('theme');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save will be handled by individual panel components
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Settings & Preferences
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Customize your experience and manage your account settings
          </p>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-300 font-medium">
              ✓ Preferences saved successfully
            </p>
          </div>
        )}

        {/* Settings Tabs */}
        <Card className="bg-white dark:bg-slate-800 shadow-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 rounded-t-lg border-b">
              <TabsTrigger value="theme">Theme</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="devices">Devices</TabsTrigger>
            </TabsList>

            {/* Theme Settings */}
            <TabsContent value="theme" className="p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Theme Settings
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Customize the appearance and color scheme of your application
                  </p>
                </div>
                <ThemeSettings />
              </div>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Notification Preferences
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Control how and when you receive notifications
                  </p>
                </div>
                <NotificationSettings />
              </div>
            </TabsContent>

            {/* Accessibility Settings */}
            <TabsContent value="accessibility" className="p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Accessibility
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Make the application more accessible for your needs
                  </p>
                </div>
                <AccessibilitySettings />
              </div>
            </TabsContent>

            {/* Layout Settings */}
            <TabsContent value="layout" className="p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Layout Preferences
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Adjust the layout and organization of interface elements
                  </p>
                </div>
                <LayoutSettings />
              </div>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy" className="p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Privacy & Data
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Manage your privacy preferences and data collection
                  </p>
                </div>
                <PrivacySettings />
              </div>
            </TabsContent>

            {/* Device Management */}
            <TabsContent value="devices" className="p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Connected Devices
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Manage your devices and cross-device synchronization
                  </p>
                </div>
                <DeviceManagement />
              </div>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="border-t bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
