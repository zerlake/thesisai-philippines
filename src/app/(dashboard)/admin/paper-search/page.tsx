"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlaskConical, Search, Database, Activity, RefreshCw } from "lucide-react";

const searchSources = [
  { name: "Semantic Scholar", status: "active", requests: 12547, lastSync: "2024-12-27 10:30" },
  { name: "arXiv", status: "active", requests: 8923, lastSync: "2024-12-27 10:25" },
  { name: "PubMed", status: "active", requests: 6234, lastSync: "2024-12-27 10:20" },
  { name: "CrossRef", status: "degraded", requests: 3421, lastSync: "2024-12-27 09:15" },
  { name: "CORE", status: "inactive", requests: 0, lastSync: "2024-12-26 18:00" },
];

export default function PaperSearchPage() {
  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paper Search</h1>
          <p className="text-muted-foreground">Manage academic paper search integrations</p>
        </div>
        <Button><RefreshCw className="w-4 h-4 mr-2" />Sync All</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
            <Search className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">31,125</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Papers Indexed</CardTitle>
            <Database className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4M</div>
            <p className="text-xs text-muted-foreground">In cache</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2s</div>
            <p className="text-xs text-green-600">-0.3s from last week</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Sources</CardTitle>
          <CardDescription>Connected academic databases and APIs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {searchSources.map((source, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <FlaskConical className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{source.name}</div>
                    <div className="text-sm text-muted-foreground">Last sync: {source.lastSync}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={source.status === "active" ? "default" : source.status === "degraded" ? "secondary" : "destructive"}>
                    {source.status}
                  </Badge>
                  <div className="text-right">
                    <div className="font-medium">{source.requests.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">requests</div>
                  </div>
                  <Button size="sm" variant="outline">Configure</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
