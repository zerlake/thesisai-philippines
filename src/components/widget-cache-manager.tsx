"use client";

import { useAuth } from "./auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { 
  Database, 
  Clock, 
  Trash2, 
  RefreshCw, 
  Calendar,
  Timer
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface WidgetCacheEntry {
  id: string;
  widget_id: string;
  user_id: string;
  data: any;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export function WidgetCacheManager() {
  const { profile, supabase } = useAuth();
  const [cacheEntries, setCacheEntries] = useState<WidgetCacheEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load cache entries
  useEffect(() => {
    if (!profile) return;
    
    const loadCacheEntries = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('widget_data_cache')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setCacheEntries(data || []);
      } catch (error) {
        console.error("Error loading cache entries:", error);
        toast.error("Failed to load widget cache data");
      } finally {
        setIsLoading(false);
      }
    };

    loadCacheEntries();
  }, [profile, supabase]);

  // Clear all cache
  const clearAllCache = async () => {
    try {
      const { error } = await supabase
        .from('widget_data_cache')
        .delete()
        .eq('user_id', profile?.id);

      if (error) throw error;

      setCacheEntries([]);
      toast.success("All widget cache cleared successfully!");
    } catch (error) {
      console.error("Error clearing cache:", error);
      toast.error("Failed to clear widget cache");
    }
  };

  // Clear expired cache
  const clearExpiredCache = async () => {
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('widget_data_cache')
        .delete()
        .eq('user_id', profile?.id)
        .lt('expires_at', now);

      if (error) throw error;

      // Refresh the list
      const { data, error: refreshError } = await supabase
        .from('widget_data_cache')
        .select('*')
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false });

      if (refreshError) throw refreshError;

      setCacheEntries(data || []);
      toast.success("Expired widget cache cleared successfully!");
    } catch (error) {
      console.error("Error clearing expired cache:", error);
      toast.error("Failed to clear expired widget cache");
    }
  };

  // Refresh cache for a specific widget
  const refreshWidgetCache = async (widgetId: string) => {
    setIsRefreshing(true);
    try {
      const { error } = await supabase
        .from('widget_data_cache')
        .delete()
        .eq('user_id', profile?.id)
        .eq('widget_id', widgetId);

      if (error) throw error;

      // Remove from local state
      setCacheEntries(cacheEntries.filter(entry => entry.widget_id !== widgetId));
      toast.success(`Cache for widget "${widgetId}" refreshed!`);
    } catch (error) {
      console.error("Error refreshing widget cache:", error);
      toast.error("Failed to refresh widget cache");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculate cache status
  const expiredCount = cacheEntries.filter(entry => 
    new Date(entry.expires_at) < new Date()
  ).length;

  const activeCount = cacheEntries.length - expiredCount;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Widget Data Cache
        </CardTitle>
        <CardDescription>
          Manage cached widget data to improve dashboard performance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cache Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium">Total Entries</h3>
            </div>
            <p className="text-2xl font-bold">{cacheEntries.length}</p>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium">Active</h3>
            </div>
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium">Expired</h3>
            </div>
            <p className="text-2xl font-bold text-destructive">{expiredCount}</p>
          </div>
        </div>

        {/* Cache Actions */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={clearExpiredCache}
            disabled={isRefreshing || expiredCount === 0}
          >
            <Timer className="w-4 h-4 mr-2" />
            Clear Expired ({expiredCount})
          </Button>
          <Button 
            variant="outline" 
            onClick={clearAllCache}
            disabled={isRefreshing || cacheEntries.length === 0}
            className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Cache
          </Button>
        </div>

        {/* Cache Entries */}
        <div>
          <h3 className="font-medium mb-3">Cached Widget Data</h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-3 border rounded animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : cacheEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No cached widget data.</p>
              <p className="text-sm">Your dashboard widgets will cache data automatically.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cacheEntries.map(entry => {
                const isExpired = new Date(entry.expires_at) < new Date();
                const timeUntilExpiry = formatDistanceToNow(new Date(entry.expires_at), { addSuffix: true });
                
                return (
                  <div 
                    key={entry.id} 
                    className={`p-4 border rounded-lg ${
                      isExpired ? 'border-destructive/50 bg-destructive/5' : 'border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium font-mono text-sm bg-muted px-2 py-0.5 rounded">
                            {entry.widget_id}
                          </h4>
                          {isExpired ? (
                            <Badge variant="destructive">Expired</Badge>
                          ) : (
                            <Badge variant="secondary">Active</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Created: {new Date(entry.created_at).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Expires: {timeUntilExpiry}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => refreshWidgetCache(entry.widget_id)}
                          disabled={isRefreshing}
                          title="Refresh cache for this widget"
                        >
                          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Remove single entry
                            setCacheEntries(cacheEntries.filter(e => e.id !== entry.id));
                            toast.success(`Cache for "${entry.widget_id}" cleared!`);
                          }}
                          title="Clear this cache entry"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
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