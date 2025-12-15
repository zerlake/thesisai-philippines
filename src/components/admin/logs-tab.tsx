"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  user_id?: string;
  stack_trace?: string;
  url?: string;
  user_agent?: string;
}

const levelColors: Record<LogLevel, string> = {
  debug: 'bg-gray-100 text-gray-800',
  info: 'bg-blue-100 text-blue-800',
  warn: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  critical: 'bg-purple-100 text-purple-800',
};

export function LogsTab() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterLevel, setFilterLevel] = useState<LogLevel | 'all'>('all');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (filterLevel !== 'all') {
        params.append('level', filterLevel);
      }

      const response = await fetch(`/api/logs?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch logs');

      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      toast.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const deleteOldLogs = async () => {
    if (!confirm('Delete logs older than 30 days?')) return;

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const response = await fetch(`/api/logs?before=${thirtyDaysAgo.toISOString()}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete logs');

      toast.success('Old logs deleted successfully');
      fetchLogs();
    } catch (error) {
      console.error('Failed to delete logs:', error);
      toast.error('Failed to delete old logs');
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterLevel]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>System Logs</CardTitle>
          <CardDescription>
            View and manage application logs from all users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Select value={filterLevel} onValueChange={(v) => setFilterLevel(v as LogLevel | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={fetchLogs} disabled={loading} variant="outline">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-2">Refresh</span>
            </Button>

            <Button onClick={deleteOldLogs} variant="destructive">
              <Trash2 className="h-4 w-4" />
              <span className="ml-2">Delete Old Logs</span>
            </Button>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No logs found
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer"
                  onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={levelColors[log.level]}>
                          {log.level.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                        {log.user_id && (
                          <span className="text-xs text-muted-foreground">
                            User: {log.user_id.slice(0, 8)}...
                          </span>
                        )}
                      </div>
                      <p className="font-medium">{log.message}</p>
                    </div>
                  </div>

                  {expandedLog === log.id && (
                    <div className="mt-4 space-y-2 text-sm">
                      {log.url && (
                        <div>
                          <strong>URL:</strong> {log.url}
                        </div>
                      )}
                      {log.context && (
                        <div>
                          <strong>Context:</strong>
                          <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.context, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.stack_trace && (
                        <div>
                          <strong>Stack Trace:</strong>
                          <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto whitespace-pre-wrap">
                            {log.stack_trace}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
