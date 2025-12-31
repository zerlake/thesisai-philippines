"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle, Lock, Eye, Download } from "lucide-react";

const securityLogs = [
  { event: "Failed login attempt", user: "unknown@email.com", ip: "192.168.1.100", time: "2024-12-27 10:45:23", severity: "warning" },
  { event: "Password changed", user: "maria@university.edu", ip: "203.177.45.12", time: "2024-12-27 10:30:15", severity: "info" },
  { event: "Admin role granted", user: "admin@thesisai.com", ip: "192.168.1.1", time: "2024-12-27 09:15:00", severity: "info" },
  { event: "Multiple failed logins", user: "test@test.com", ip: "45.33.32.156", time: "2024-12-27 08:22:45", severity: "critical" },
  { event: "API key regenerated", user: "system", ip: "127.0.0.1", time: "2024-12-27 07:00:00", severity: "info" },
];

const securityMetrics = [
  { label: "Failed Logins (24h)", value: 23, status: "warning" },
  { label: "Active Sessions", value: 847, status: "normal" },
  { label: "Blocked IPs", value: 12, status: "normal" },
  { label: "2FA Enabled Users", value: "78%", status: "good" },
];

export default function SecurityLogsPage() {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical": return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Critical</Badge>;
      case "warning": return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />Warning</Badge>;
      default: return <Badge variant="outline"><CheckCircle className="w-3 h-3 mr-1" />Info</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Logs</h1>
          <p className="text-muted-foreground">Monitor security events and access logs</p>
        </div>
        <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export Logs</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {securityMetrics.map((metric, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
              <Shield className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <Badge variant={metric.status === "good" ? "default" : metric.status === "warning" ? "secondary" : "outline"} className="mt-1">
                {metric.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>Latest authentication and access events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityLogs.map((log, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {log.severity === "critical" ? <AlertTriangle className="h-5 w-5 text-red-500" /> :
                   log.severity === "warning" ? <AlertTriangle className="h-5 w-5 text-yellow-500" /> :
                   <CheckCircle className="h-5 w-5 text-blue-500" />}
                  <div>
                    <div className="font-medium">{log.event}</div>
                    <div className="text-sm text-muted-foreground">{log.user} - {log.ip}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getSeverityBadge(log.severity)}
                  <div className="text-sm text-muted-foreground">{log.time}</div>
                  <Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
