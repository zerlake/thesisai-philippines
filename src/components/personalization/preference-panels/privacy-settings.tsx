'use client';

import React, { useState, useEffect } from 'react';
import { usePersonalization } from '@/hooks/usePersonalization';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Lock, BarChart3, Eye, Trash2 } from 'lucide-react';

interface PrivacySettings {
  dataCollection: boolean;
  analyticsSharing: boolean;
  thirdPartyIntegration: boolean;
  publicProfile: boolean;
  behaviorTracking: boolean;
  analyticsOptIn: boolean;
  personalizationOptIn: boolean;
  dataRetentionDays: number;
}

const defaultSettings: PrivacySettings = {
  dataCollection: true,
  analyticsSharing: false,
  thirdPartyIntegration: false,
  publicProfile: false,
  behaviorTracking: true,
  analyticsOptIn: true,
  personalizationOptIn: true,
  dataRetentionDays: 90,
};

export default function PrivacySettings() {
  const { preferences, updatePreferences, isLoading } = usePersonalization();
  const [settings, setSettings] = useState<PrivacySettings>(defaultSettings);
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    // Privacy settings will be stored in behavior settings in the future
    // For now, use defaults
    setSettings(defaultSettings);
  }, [preferences]);

  const handleChange = async (key: string, value: any) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    // Privacy settings can be extended to UserPreferences when needed
    console.log('Privacy settings updated:', updated);
  };

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      // Call export API
      const response = await fetch('/api/personalization/export', {
        method: 'GET'
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `personal-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export data:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteData = async () => {
    if (window.confirm('Are you sure? This action cannot be undone.')) {
      setDeleteLoading(true);
      try {
        // Call delete API
        await fetch('/api/personalization/delete', {
          method: 'POST'
        });
        alert('Your data has been deleted.');
      } catch (error) {
        console.error('Failed to delete data:', error);
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Data Collection */}
      <Card className="p-6 border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Data Collection
        </h3>

        <div className="space-y-4">
          <div className="flex items-start justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <div>
              <Label className="font-medium text-slate-900 dark:text-white">
                Behavior Tracking
              </Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Allow us to track how you use the app to improve features
              </p>
            </div>
            <Switch
              checked={settings.behaviorTracking ?? true}
              onCheckedChange={(value) => handleChange('behaviorTracking', value)}
            />
          </div>

          <div className="flex items-start justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <div>
              <Label className="font-medium text-slate-900 dark:text-white">
                Analytics
              </Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Help us understand usage patterns with anonymous analytics
              </p>
            </div>
            <Switch
              checked={settings.analyticsOptIn ?? true}
              onCheckedChange={(value) => handleChange('analyticsOptIn', value)}
            />
          </div>

          <div className="flex items-start justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <div>
              <Label className="font-medium text-slate-900 dark:text-white">
                Personalization
              </Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Use collected data to personalize your experience
              </p>
            </div>
            <Switch
              checked={settings.personalizationOptIn ?? true}
              onCheckedChange={(value) => handleChange('personalizationOptIn', value)}
            />
          </div>
        </div>
      </Card>

      {/* Data Retention */}
      <Card className="p-6 border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Data Retention
        </h3>

        <div>
          <Label htmlFor="retention-days" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Retention Period (days)
          </Label>
          <Input
            id="retention-days"
            type="number"
            min="7"
            max="730"
            value={settings.dataRetentionDays || 90}
            onChange={(e) => handleChange('dataRetentionDays', parseInt(e.target.value))}
            className="w-full sm:w-32"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Behavior logs and analytics data will be automatically deleted after this period
          </p>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="p-6 border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Data Management
        </h3>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Your Data Rights:</strong> You have the right to access, export, and delete your personal data at any time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              onClick={handleExportData}
              disabled={exportLoading}
              variant="outline"
              className="w-full"
            >
              {exportLoading ? 'Exporting...' : 'Export My Data'}
            </Button>

            <Button
              onClick={handleDeleteData}
              disabled={deleteLoading}
              variant="destructive"
              className="w-full"
            >
              {deleteLoading ? 'Deleting...' : 'Delete All Data'}
            </Button>
          </div>
        </div>
      </Card>

      {/* GDPR & Compliance */}
      <Card className="p-6 border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Privacy & Compliance
        </h3>

        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
          <p>
            ✓ <strong>GDPR Compliant:</strong> We comply with GDPR and other privacy regulations
          </p>
          <p>
            ✓ <strong>Data Encryption:</strong> Your data is encrypted in transit and at rest
          </p>
          <p>
            ✓ <strong>No Third-Party Sharing:</strong> We never sell or share your personal data
          </p>
          <p>
            ✓ <strong>User Control:</strong> You have full control over your data and preferences
          </p>
        </div>

        <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-700/30 rounded">
          <a href="/privacy-policy" className="text-blue-600 hover:underline text-sm">
            Read our Privacy Policy →
          </a>
        </div>
      </Card>

      {/* Last Updated */}
      <div className="text-sm text-slate-500 dark:text-slate-400">
        <p>Privacy settings last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}
