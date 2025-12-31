"use client";

import { useAuth } from "./auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  Activity,
  Clock,
  User,
  Monitor,
  Filter,
  RotateCcw,
  Calendar,
  Search
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Input } from "./ui/input";

interface DashboardActivityLog {
  id: string;
  user_id: string;
  action: string;
  layout_id?: string;
  widget_id?: string;
  changes?: any;
  metadata?: any;
  created_at: string;
}

export function DashboardActivityLog() {
  const { profile, supabase } = useAuth();
  const [activities, setActivities] = useState<DashboardActivityLog[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<DashboardActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterAction, setFilterAction] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Load activity logs
  useEffect(() => {
    if (!profile) return;
    
    const loadActivityLogs = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('dashboard_activity_log')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(50); // Limit to last 50 activities

        if (error) throw error;
        
        setActivities(data || []);
        setFilteredActivities(data || []);
      } catch (error) {
        console.error("Error loading activity logs:", error);
        toast.error("Failed to load dashboard activity logs");
      } finally {
        setIsLoading(false);
      }
    };

    loadActivityLogs();
  }, [profile, supabase]);

  // Apply filters
  useEffect(() => {
    let result = activities;

    // Filter by action
    if (filterAction) {
      result = result.filter(activity => 
        activity.action.toLowerCase().includes(filterAction.toLowerCase())
      );
    }

    // Filter by search term
    if (searchTerm) {
      result = result.filter(activity => 
        activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.widget_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.layout_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(activity.changes).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredActivities(result);
  }, [activities, filterAction, searchTerm]);

  // Refresh activity logs
  const refreshLogs = async () => {
    if (!profile) return;
    
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('dashboard_activity_log')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setActivities(data || []);
      toast.success("Activity logs refreshed!");
    } catch (error) {
      console.error("Error refreshing activity logs:", error);
      toast.error("Failed to refresh activity logs");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get unique actions for filter
  const uniqueActions = Array.from(new Set(activities.map(activity => activity.action)));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Dashboard Activity Log
        </CardTitle>
        <CardDescription>
          Track all dashboard-related activities and changes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <div className="relative">
              <Filter className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full rounded border border-input bg-background pl-8 pr-8 py-2 text-sm"
              >
                <option value="">All Actions</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={refreshLogs}
            disabled={isRefreshing}
          >
            <RotateCcw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium">Total Activities</h3>
            </div>
            <p className="text-2xl font-bold">{activities.length}</p>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium">Recent (7 days)</h3>
            </div>
            <p className="text-2xl font-bold">
              {activities.filter(a => 
                new Date(a.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Monitor className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium">Filtered</h3>
            </div>
            <p className="text-2xl font-bold">{filteredActivities.length}</p>
          </div>
        </div>

        {/* Activity List */}
        <div>
          <h3 className="font-medium mb-3">Recent Activities</h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-3 border rounded animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No activity logs found.</p>
              <p className="text-sm">Your dashboard activities will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredActivities.map(activity => (
                <div 
                  key={activity.id} 
                  className="p-4 border rounded-lg bg-card"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{activity.action}</h4>
                        <Badge variant="outline" className="text-xs">
                          {activity.widget_id || activity.layout_id || 'Dashboard'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(activity.created_at).toLocaleString()}</span>
                        </div>
                      </div>

                      {activity.changes && (
                        <div className="mt-2 text-sm">
                          <p className="font-medium">Changes:</p>
                          <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(activity.changes, null, 2)}
                          </pre>
                        </div>
                      )}

                      {activity.metadata && (
                        <div className="mt-2 text-sm">
                          <p className="font-medium">Metadata:</p>
                          <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(activity.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
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