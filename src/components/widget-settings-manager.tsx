"use client";

import { useAuth } from "./auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { 
  Settings,
  Save,
  Trash2,
  RotateCcw,
  Monitor,
  Palette,
  Type,
  Layout as LayoutIcon
} from "lucide-react";
import { Switch } from "./ui/switch";

interface WidgetSettings {
  id: string;
  widget_id: string;
  user_id: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export function WidgetSettingsManager() {
  const { profile, supabase } = useAuth();
  const [widgetSettings, setWidgetSettings] = useState<WidgetSettings[]>([]);
  const [editingSettings, setEditingSettings] = useState<Record<string, any> | null>(null);
  const [editingWidgetId, setEditingWidgetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load widget settings
  useEffect(() => {
    if (!profile) return;
    
    const loadWidgetSettings = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('widget_settings')
          .select('*')
          .eq('user_id', profile.id)
          .order('widget_id');

        if (error) throw error;
        
        setWidgetSettings(data || []);
      } catch (error) {
        console.error("Error loading widget settings:", error);
        toast.error("Failed to load widget settings");
      } finally {
        setIsLoading(false);
      }
    };

    loadWidgetSettings();
  }, [profile, supabase]);

  // Save widget settings
  const saveWidgetSettings = async (widgetId: string, settings: Record<string, any>) => {
    if (!profile) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('widget_settings')
        .upsert({
          user_id: profile.id,
          widget_id: widgetId,
          settings: settings
        });

      if (error) throw error;

      // Update local state
      const existingIndex = widgetSettings.findIndex(ws => ws.widget_id === widgetId);
      if (existingIndex >= 0) {
        const updatedSettings = [...widgetSettings];
        updatedSettings[existingIndex] = {
          ...updatedSettings[existingIndex],
          settings: settings
        };
        setWidgetSettings(updatedSettings);
      } else {
        // Add new setting
        const newSetting = {
          id: Math.random().toString(36).substring(7),
          user_id: profile.id,
          widget_id: widgetId,
          settings: settings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setWidgetSettings([...widgetSettings, newSetting]);
      }

      toast.success(`Settings for "${widgetId}" saved successfully!`);
      setEditingSettings(null);
      setEditingWidgetId(null);
    } catch (error) {
      console.error("Error saving widget settings:", error);
      toast.error("Failed to save widget settings");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete widget settings
  const deleteWidgetSettings = async (widgetId: string) => {
    try {
      const { error } = await supabase
        .from('widget_settings')
        .delete()
        .eq('user_id', profile?.id)
        .eq('widget_id', widgetId);

      if (error) throw error;

      setWidgetSettings(widgetSettings.filter(ws => ws.widget_id !== widgetId));
      toast.success(`Settings for "${widgetId}" deleted successfully!`);
    } catch (error) {
      console.error("Error deleting widget settings:", error);
      toast.error("Failed to delete widget settings");
    }
  };

  // Start editing settings
  const startEditing = (widgetId: string, currentSettings: Record<string, any>) => {
    setEditingSettings({ ...currentSettings });
    setEditingWidgetId(widgetId);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingSettings(null);
    setEditingWidgetId(null);
  };

  // Handle setting change
  const handleSettingChange = (key: string, value: any) => {
    if (editingSettings) {
      setEditingSettings({
        ...editingSettings,
        [key]: value
      });
    }
  };

  // Get unique widget IDs
  const uniqueWidgetIds = Array.from(new Set([
    ...widgetSettings.map(ws => ws.widget_id),
    'stats', 'next_action', 'recent_activity', 'checklist', 'session_goal', 
    'writing_streak', 'milestones', 'quick_access', 'wellbeing', 'progress_milestones'
  ]));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Widget Settings
        </CardTitle>
        <CardDescription>
          Customize settings for individual dashboard widgets.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Widget Settings List */}
        <div>
          <h3 className="font-medium mb-3">Widget Configuration</h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-3 border rounded animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : uniqueWidgetIds.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No widget settings configured.</p>
              <p className="text-sm">Start by customizing your dashboard widgets.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {uniqueWidgetIds.map(widgetId => {
                const setting = widgetSettings.find(ws => ws.widget_id === widgetId);
                const isEditing = editingWidgetId === widgetId;
                
                return (
                  <div key={widgetId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        {widgetId}
                      </h4>
                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (editingSettings) {
                                  saveWidgetSettings(widgetId, editingSettings);
                                }
                              }}
                              disabled={isSaving}
                            >
                              <Save className="w-4 h-4 mr-2" />
                              {isSaving ? "Saving..." : "Save"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={cancelEditing}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditing(widgetId, setting?.settings || {})}
                            >
                              <Settings className="w-4 h-4 mr-2" />
                              Configure
                            </Button>
                            {setting && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteWidgetSettings(widgetId)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="space-y-4">
                        {/* Common widget settings */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`${widgetId}-title`}>Widget Title</Label>
                            <Input
                              id={`${widgetId}-title`}
                              value={editingSettings?.title || ''}
                              onChange={(e) => handleSettingChange('title', e.target.value)}
                              placeholder="Custom title for widget"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`${widgetId}-theme`}>Theme</Label>
                            <select
                              id={`${widgetId}-theme`}
                              value={editingSettings?.theme || 'default'}
                              onChange={(e) => handleSettingChange('theme', e.target.value)}
                              className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="default">Default</option>
                              <option value="light">Light</option>
                              <option value="dark">Dark</option>
                              <option value="auto">Auto</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`${widgetId}-enabled`}>Enabled</Label>
                            <Switch
                              id={`${widgetId}-enabled`}
                              checked={editingSettings?.enabled !== false}
                              onCheckedChange={(checked) => handleSettingChange('enabled', checked)}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Toggle whether this widget is displayed on your dashboard
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`${widgetId}-refresh`}>Auto-refresh</Label>
                            <Switch
                              id={`${widgetId}-refresh`}
                              checked={editingSettings?.autoRefresh !== false}
                              onCheckedChange={(checked) => handleSettingChange('autoRefresh', checked)}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Enable automatic data refresh for this widget
                          </p>
                        </div>

                        {editingSettings?.autoRefresh && (
                          <div className="space-y-2">
                            <Label htmlFor={`${widgetId}-refresh-interval`}>Refresh Interval (seconds)</Label>
                            <Input
                              id={`${widgetId}-refresh-interval`}
                              type="number"
                              min="10"
                              max="3600"
                              value={editingSettings?.refreshInterval || 60}
                              onChange={(e) => handleSettingChange('refreshInterval', parseInt(e.target.value))}
                              placeholder="60"
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor={`${widgetId}-size`}>Widget Size</Label>
                          <select
                            id={`${widgetId}-size`}
                            value={editingSettings?.size || 'medium'}
                            onChange={(e) => handleSettingChange('size', e.target.value)}
                            className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                            <option value="full">Full Width</option>
                          </select>
                        </div>
                      </div>
                    ) : setting ? (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Title:</span> {setting.settings.title || 'Default'}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Theme:</span> {setting.settings.theme || 'default'}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Enabled:</span> {setting.settings.enabled !== false ? 'Yes' : 'No'}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Auto-refresh:</span> {setting.settings.autoRefresh !== false ? 'Yes' : 'No'}
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No custom settings configured for this widget.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}