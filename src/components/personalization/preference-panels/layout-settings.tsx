'use client';

import React, { useState, useEffect } from 'react';
import { usePersonalization } from '@/hooks/usePersonalization';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { AlignLeft, AlignRight, LayoutGrid, Eye } from 'lucide-react';

export default function LayoutSettings() {
  const { preferences, updatePreferences, isLoading } = usePersonalization();
  const [settings, setSettings] = useState(preferences?.layout || {});

  useEffect(() => {
    if (preferences?.layout) {
      setSettings(preferences.layout);
    }
  }, [preferences]);

  const handleChange = async (key: string, value: any) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await updatePreferences({
      layout: updated
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Sidebar Position */}
      <Card className="p-6 border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Sidebar Position
        </h3>
        <RadioGroup
          value={settings.sidebarPosition || 'left'}
          onValueChange={(value) => handleChange('sidebarPosition', value)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
              <RadioGroupItem value="left" id="sidebar-left" />
              <Label htmlFor="sidebar-left" className="flex items-center cursor-pointer gap-3 flex-1">
                <AlignLeft className="w-5 h-5" />
                <span>Left Sidebar</span>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
              <RadioGroupItem value="right" id="sidebar-right" />
              <Label htmlFor="sidebar-right" className="flex items-center cursor-pointer gap-3 flex-1">
                <AlignRight className="w-5 h-5" />
                <span>Right Sidebar</span>
              </Label>
            </div>
          </div>
        </RadioGroup>
      </Card>

      {/* Compact Mode */}
      <Card className="p-6 border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold text-slate-900 dark:text-white">
              Compact Mode
            </Label>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Reduces padding and spacing for more content per screen
            </p>
          </div>
          <Switch
            checked={settings.compactMode ?? false}
            onCheckedChange={(value) => handleChange('compactMode', value)}
          />
        </div>
      </Card>

      {/* Breadcrumbs */}
      <Card className="p-6 border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold text-slate-900 dark:text-white">
              Show Breadcrumbs
            </Label>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Display navigation breadcrumbs at the top of pages
            </p>
          </div>
          <Switch
            checked={settings.showBreadcrumbs ?? true}
            onCheckedChange={(value) => handleChange('showBreadcrumbs', value)}
          />
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-6 border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold text-slate-900 dark:text-white">
              Show Filter Panel
            </Label>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Display filters by default in list views
            </p>
          </div>
          <Switch
            checked={settings.showFilters ?? true}
            onCheckedChange={(value) => handleChange('showFilters', value)}
          />
        </div>
      </Card>

      {/* Default View Type */}
      <Card className="p-6 border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Default View Type
        </h3>
        <RadioGroup
          value={settings.defaultViewType || 'list'}
          onValueChange={(value) => handleChange('defaultViewType', value)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
              <RadioGroupItem value="list" id="view-list" />
              <Label htmlFor="view-list" className="flex items-center cursor-pointer gap-2 flex-1">
                <LayoutGrid className="w-4 h-4" />
                <span>List View</span>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
              <RadioGroupItem value="grid" id="view-grid" />
              <Label htmlFor="view-grid" className="flex items-center cursor-pointer gap-2 flex-1">
                <LayoutGrid className="w-4 h-4" />
                <span>Grid View</span>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
              <RadioGroupItem value="kanban" id="view-kanban" />
              <Label htmlFor="view-kanban" className="flex items-center cursor-pointer gap-2 flex-1">
                <LayoutGrid className="w-4 h-4" />
                <span>Kanban View</span>
              </Label>
            </div>
          </div>
        </RadioGroup>
      </Card>

      {/* Layout Preview */}
      <Card className="p-6 border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Layout Preview
        </h3>
        
        <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 mb-4 min-h-32">
          <div className={`flex ${settings.sidebarPosition === 'right' ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
            {/* Sidebar */}
            <div className="w-24 bg-slate-300 dark:bg-slate-600 rounded flex items-center justify-center text-xs text-slate-700 dark:text-slate-300">
              Sidebar
            </div>
            {/* Main Content */}
            <div className="flex-1 space-y-2">
              {settings.showBreadcrumbs && (
                <div className="bg-slate-200 dark:bg-slate-500 h-6 rounded text-xs text-slate-600 dark:text-slate-300 flex items-center px-2">
                  Breadcrumbs
                </div>
              )}
              {settings.showFilters && (
                <div className="bg-slate-200 dark:bg-slate-500 h-8 rounded text-xs text-slate-600 dark:text-slate-300 flex items-center px-2">
                  Filters
                </div>
              )}
              <div className="space-y-1">
                <div className="bg-slate-200 dark:bg-slate-500 h-4 rounded"></div>
                <div className="bg-slate-200 dark:bg-slate-500 h-4 rounded w-4/5"></div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400">
          This preview shows how your layout settings will appear. Changes are applied immediately.
        </p>
      </Card>

      {/* Info */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          💡 <strong>Tip:</strong> Adjust these settings to match your workflow and screen size for better productivity.
        </p>
      </div>
    </div>
  );
}
