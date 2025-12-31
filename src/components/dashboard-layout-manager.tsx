"use client";

import { useAuth } from "./auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { 
  Layout, 
  LayoutDashboard, 
  Save, 
  RotateCcw, 
  Trash2, 
  Copy, 
  Monitor,
  Smartphone,
  Tablet
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  widgets: any[]; // Widget configuration
  breakpoint: string; // 'desktop', 'tablet', 'mobile'
  is_default: boolean;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export function DashboardLayoutManager() {
  const { profile, supabase } = useAuth();
  const [layouts, setLayouts] = useState<DashboardLayout[]>([]);
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout | null>(null);
  const [newLayoutName, setNewLayoutName] = useState("");
  const [newLayoutDescription, setNewLayoutDescription] = useState("");
  const [breakpoint, setBreakpoint] = useState("desktop");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing layouts
  useEffect(() => {
    if (!profile) return;
    
    const loadLayouts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('dashboard_layouts')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setLayouts(data || []);
        
        // Load current layout if exists
        const { data: defaultLayout } = await supabase
          .from('dashboard_layouts')
          .select('*')
          .eq('user_id', profile.id)
          .eq('is_default', true)
          .single();

        if (defaultLayout) {
          setCurrentLayout(defaultLayout);
        }
      } catch (error) {
        console.error("Error loading layouts:", error);
        toast.error("Failed to load dashboard layouts");
      } finally {
        setIsLoading(false);
      }
    };

    loadLayouts();
  }, [profile, supabase]);

  // Save current layout
  const saveCurrentLayout = async () => {
    if (!profile || !newLayoutName.trim()) return;

    setIsSaving(true);
    try {
      // Get current widget configuration from dashboard
      // This would typically come from the dashboard state
      const widgetConfig = []; // Placeholder - would get actual widget config

      const layoutData = {
        user_id: profile.id,
        name: newLayoutName,
        description: newLayoutDescription,
        widgets: widgetConfig,
        breakpoint: breakpoint,
        is_default: layouts.length === 0, // First layout is default
      };

      const { data, error } = await supabase
        .from('dashboard_layouts')
        .insert(layoutData)
        .select()
        .single();

      if (error) throw error;

      setLayouts([data, ...layouts]);
      setCurrentLayout(data);
      setNewLayoutName("");
      setNewLayoutDescription("");
      toast.success("Layout saved successfully!");
    } catch (error) {
      console.error("Error saving layout:", error);
      toast.error("Failed to save layout");
    } finally {
      setIsSaving(false);
    }
  };

  // Load a layout
  const loadLayout = async (layoutId: string) => {
    try {
      const { data, error } = await supabase
        .from('dashboard_layouts')
        .select('*')
        .eq('id', layoutId)
        .eq('user_id', profile?.id)
        .single();

      if (error) throw error;

      setCurrentLayout(data);
      
      // Update default layout
      await supabase
        .from('dashboard_layouts')
        .update({ is_default: false })
        .eq('user_id', profile?.id)
        .neq('id', layoutId);

      await supabase
        .from('dashboard_layouts')
        .update({ is_default: true })
        .eq('id', layoutId);

      setLayouts(layouts.map(l => ({
        ...l,
        is_default: l.id === layoutId
      })));

      toast.success("Layout loaded successfully!");
    } catch (error) {
      console.error("Error loading layout:", error);
      toast.error("Failed to load layout");
    }
  };

  // Delete a layout
  const deleteLayout = async (layoutId: string) => {
    try {
      const { error } = await supabase
        .from('dashboard_layouts')
        .delete()
        .eq('id', layoutId)
        .eq('user_id', profile?.id);

      if (error) throw error;

      setLayouts(layouts.filter(l => l.id !== layoutId));
      if (currentLayout?.id === layoutId) {
        setCurrentLayout(null);
      }
      toast.success("Layout deleted successfully!");
    } catch (error) {
      console.error("Error deleting layout:", error);
      toast.error("Failed to delete layout");
    }
  };

  // Set as default
  const setAsDefault = async (layoutId: string) => {
    try {
      // Update all layouts to not be default
      await supabase
        .from('dashboard_layouts')
        .update({ is_default: false })
        .eq('user_id', profile?.id);

      // Set selected layout as default
      await supabase
        .from('dashboard_layouts')
        .update({ is_default: true })
        .eq('id', layoutId);

      setLayouts(layouts.map(l => ({
        ...l,
        is_default: l.id === layoutId
      })));

      toast.success("Layout set as default!");
    } catch (error) {
      console.error("Error setting default layout:", error);
      toast.error("Failed to set default layout");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5" />
          Dashboard Layouts
        </CardTitle>
        <CardDescription>
          Save and manage your dashboard layouts for different views and purposes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create New Layout */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-3">Create New Layout</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="layout-name">Layout Name</Label>
              <Input
                id="layout-name"
                value={newLayoutName}
                onChange={(e) => setNewLayoutName(e.target.value)}
                placeholder="e.g., Research View, Writing View"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="breakpoint">Breakpoint</Label>
              <Select value={breakpoint} onValueChange={setBreakpoint}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desktop">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      Desktop
                    </div>
                  </SelectItem>
                  <SelectItem value="tablet">
                    <div className="flex items-center gap-2">
                      <Tablet className="w-4 h-4" />
                      Tablet
                    </div>
                  </SelectItem>
                  <SelectItem value="mobile">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Mobile
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2 mt-3">
            <Label htmlFor="layout-desc">Description (Optional)</Label>
            <Input
              id="layout-desc"
              value={newLayoutDescription}
              onChange={(e) => setNewLayoutDescription(e.target.value)}
              placeholder="Describe the purpose of this layout"
            />
          </div>
          <Button 
            className="mt-4 w-full md:w-auto" 
            onClick={saveCurrentLayout}
            disabled={isSaving || !newLayoutName.trim()}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Current Layout"}
          </Button>
        </div>

        {/* Saved Layouts */}
        <div>
          <h3 className="font-medium mb-3">Saved Layouts</h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-3 border rounded animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : layouts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Layout className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No saved layouts yet.</p>
              <p className="text-sm">Create your first layout above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {layouts.map(layout => (
                <div 
                  key={layout.id} 
                  className={`p-4 border rounded-lg ${
                    layout.is_default ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{layout.name}</h4>
                        {layout.is_default && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      {layout.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {layout.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Breakpoint: {layout.breakpoint}</span>
                        <span>Created: {new Date(layout.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadLayout(layout.id)}
                        title="Load this layout"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      {!layout.is_default && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAsDefault(layout.id)}
                          title="Set as default"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteLayout(layout.id)}
                        title="Delete layout"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}