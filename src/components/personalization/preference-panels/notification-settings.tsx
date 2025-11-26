'use client';

import React, { useState, useEffect } from 'react';
import { usePersonalization } from '@/hooks/usePersonalization';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Bell, Mail, Smartphone, Clock } from 'lucide-react';
import type { NotificationPreferences } from '@/lib/personalization/types';

const defaultNotifications: NotificationPreferences = {
  enabled: true,
  emailNotifications: true,
  pushNotifications: true,
  soundEnabled: true,
  priorityBasedTiming: false,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
  channels: [],
};

export default function NotificationSettings() {
  const { preferences, updatePreferences, isLoading } = usePersonalization();
  const [settings, setSettings] = useState<NotificationPreferences>(
    preferences?.notifications || defaultNotifications
  );

  useEffect(() => {
    if (preferences?.notifications) {
      setSettings(preferences.notifications);
    }
  }, [preferences]);

  const handleChange = async (key: string, value: any) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await updatePreferences({
      notifications: updated
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Master Toggle */}
      <Card className="p-6 border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-blue-600" />
            <div>
              <Label className="text-base font-semibold text-slate-900 dark:text-white">
                Enable Notifications
              </Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Turn on to receive all types of notifications
              </p>
            </div>
          </div>
          <Switch
            checked={settings.enabled ?? true}
            onCheckedChange={(value) => handleChange('enabled', value)}
          />
        </div>
      </Card>

      {/* Notification Channels */}
      <Card className="p-6 border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Notification Channels
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-blue-600" />
                <Label className="font-medium text-slate-900 dark:text-white cursor-pointer">
                  Sound Notifications
                </Label>
              </div>
              <Switch
                checked={settings.soundEnabled ?? true}
                onCheckedChange={(value) => handleChange('soundEnabled', value)}
              />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-green-600" />
              <Label className="font-medium text-slate-900 dark:text-white cursor-pointer">
                Email Notifications
              </Label>
            </div>
            <Switch
              checked={settings.emailNotifications ?? true}
              onCheckedChange={(value) => handleChange('emailNotifications', value)}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-purple-600" />
              <Label className="font-medium text-slate-900 dark:text-white cursor-pointer">
                Push Notifications
              </Label>
            </div>
            <Switch
              checked={settings.pushNotifications ?? true}
              onCheckedChange={(value) => handleChange('pushNotifications', value)}
            />
          </div>
        </div>
      </Card>

      {/* Quiet Hours */}
      <Card className="p-6 border-slate-200 dark:border-slate-700">
        <div className="flex items-start gap-3 mb-4">
          <Clock className="w-5 h-5 text-orange-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Quiet Hours
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No notifications will be sent during these hours
            </p>
          </div>
        </div>

        <div className="space-y-4">
           <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
             <Label className="font-medium text-slate-900 dark:text-white cursor-pointer">
               Enable Quiet Hours
             </Label>
             <Switch
               checked={settings.quietHours?.enabled ?? false}
               onCheckedChange={(value) => handleChange('quietHours', { ...settings.quietHours, enabled: value })}
             />
           </div>

           {settings.quietHours?.enabled && (
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="quiet-start" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                   Start Time
                 </Label>
                 <Input
                   id="quiet-start"
                   type="time"
                   value={settings.quietHours?.start || '22:00'}
                   onChange={(e) => handleChange('quietHours', { ...settings.quietHours, start: e.target.value })}
                   className="w-full"
                 />
               </div>
               <div>
                 <Label htmlFor="quiet-end" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                   End Time
                 </Label>
                 <Input
                   id="quiet-end"
                   type="time"
                   value={settings.quietHours?.end || '08:00'}
                   onChange={(e) => handleChange('quietHours', { ...settings.quietHours, end: e.target.value })}
                   className="w-full"
                 />
               </div>
             </div>
           )}
         </div>
      </Card>

      {/* Priority-based Timing */}
      <Card className="p-6 border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold text-slate-900 dark:text-white">
              Priority-Based Timing
            </Label>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Send high-priority notifications immediately, others periodically
            </p>
          </div>
          <Switch
            checked={settings.priorityBasedTiming ?? false}
            onCheckedChange={(value) => handleChange('priorityBasedTiming', value)}
          />
        </div>
      </Card>

      {/* Info */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          💡 <strong>Tip:</strong> Customize these settings to reduce notification fatigue while staying informed about what matters most to you.
        </p>
      </div>
    </div>
  );
}
