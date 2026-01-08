'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DashboardNotificationConfig } from '@/hooks/useDashboardNotifications';

interface NotificationPreferencesDialogProps {
  userRole: 'student' | 'advisor' | 'critic' | 'group-leader';
  trigger?: React.ReactNode;
  onSettingsChange?: (settings: DashboardNotificationConfig) => void;
}

const defaultConfig: DashboardNotificationConfig = {
  enabled: true,
  emailOnSubmission: true,
  emailOnFeedback: true,
  emailOnMilestone: true,
  emailOnGroupActivity: true,
};

export function NotificationPreferencesDialog({
  userRole,
  trigger,
  onSettingsChange,
}: NotificationPreferencesDialogProps) {
  const [settings, setSettings] = useState<DashboardNotificationConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [open, setOpen] = useState(false);

  // Load user's notification settings
  useEffect(() => {
    if (!open) return;

    const loadSettings = async () => {
      try {
        const response = await fetch('/api/user/notification-preferences');
        if (response.ok) {
          const data = await response.json();
          setSettings(prev => ({
            ...defaultConfig,
            ...data.dashboardNotifications,
          }));
        } else if (response.status === 401) {
          console.warn('Not authenticated for notification preferences');
        }
      } catch (error) {
        console.error('Failed to load notification settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [open]);

  const handleSettingChange = async (key: keyof DashboardNotificationConfig, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    setIsSaving(true);
    try {
      const response = await fetch('/api/user/notification-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dashboardNotifications: newSettings,
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      onSettingsChange?.(newSettings);
      toast.success('Notification preferences updated');
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSettings(prev => ({ ...prev, [key]: !value }));
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleSpecificSettings = () => {
    switch (userRole) {
      case 'student':
        return [
          {
            key: 'emailOnFeedback',
            label: 'Advisor/Critic Feedback',
            description: 'Get notified when advisors or critics provide feedback',
          },
          {
            key: 'emailOnMilestone',
            label: 'Milestone Updates',
            description: 'Get notified when you reach thesis milestones',
          },
          {
            key: 'emailOnGroupActivity',
            label: 'Group Updates',
            description: 'Get notified of group collaboration activity',
          },
        ];
      case 'advisor':
        return [
          {
            key: 'emailOnSubmission',
            label: 'Student Submissions',
            description: 'Get notified when students submit work',
          },
          {
            key: 'emailOnMilestone',
            label: 'Milestone Achievements',
            description: 'Get notified when your students reach milestones',
          },
          {
            key: 'emailOnGroupActivity',
            label: 'Group Updates',
            description: 'Get notified of advisor group activities',
          },
        ];
      case 'critic':
        return [
          {
            key: 'emailOnSubmission',
            label: 'Student Submissions',
            description: 'Get notified when students submit work for review',
          },
          {
            key: 'emailOnMilestone',
            label: 'Milestone Achievements',
            description: 'Get notified when students reach milestones',
          },
          {
            key: 'emailOnGroupActivity',
            label: 'Group Updates',
            description: 'Get notified of critic community activities',
          },
        ];
      case 'group-leader':
        return [
          {
            key: 'emailOnGroupActivity',
            label: 'Group Activity',
            description: 'Get notified of all group collaboration activities',
          },
          {
            key: 'emailOnSubmission',
            label: 'Member Submissions',
            description: 'Get notified when group members submit work',
          },
        ];
      default:
        return [];
    }
  };

  const roleSpecificSettings = getRoleSpecificSettings();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Email Notification Preferences
          </DialogTitle>
          <DialogDescription>
            Configure which events trigger email notifications to your inbox
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Master switch */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="master-toggle" className="cursor-pointer">
                  Enable email notifications
                </Label>
                <Switch
                  id="master-toggle"
                  checked={settings.enabled}
                  onCheckedChange={(value) =>
                    handleSettingChange('enabled', value)
                  }
                  disabled={isSaving || loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Role-specific settings */}
          {settings.enabled && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notification Types</CardTitle>
                <CardDescription>
                  Choose which events you want to be notified about
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {roleSpecificSettings.map(({ key, label, description }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-muted-foreground/20"
                  >
                    <div className="flex-1">
                      <Label htmlFor={key} className="text-sm font-medium cursor-pointer">
                        {label}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">{description}</p>
                    </div>
                    <Switch
                      id={key}
                      checked={settings[key as keyof DashboardNotificationConfig] as boolean}
                      onCheckedChange={(value) =>
                        handleSettingChange(key as keyof DashboardNotificationConfig, value)
                      }
                      disabled={isSaving || loading}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Info section */}
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-4">
              <h4 className="text-sm font-semibold mb-2">About notifications</h4>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Notifications are sent immediately when events occur</li>
                <li>• All emails respect your privacy settings</li>
                <li>• You can unsubscribe from any email</li>
                <li>• Changes are saved automatically</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
