// src/components/enterprise-apps-card.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppCard } from "@/components/app-card";
import { getAllApps } from "@/lib/app-registry";
import { useRouter } from "next/navigation";
import { Play, Plus, Target, BookOpen, FileText, Presentation } from "lucide-react";

export function EnterpriseAppsCard() {
  const router = useRouter();
  const apps = getAllApps().slice(0, 4); // Show first 4 apps as examples

  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20">
              <Play className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg">ThesisAI Apps</CardTitle>
              <CardDescription className="text-xs">
                Discrete tools for specific research tasks
              </CardDescription>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/apps')}
          >
            <Plus className="w-4 h-4 mr-1" />
            All Apps
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {apps.map(app => (
            <AppCard 
              key={app.id} 
              app={app} 
              onRun={() => router.push(`/apps/${app.id}`)}
              showRunButton={false}
            />
          ))}
        </div>
        <Button 
          className="w-full mt-4" 
          variant="outline"
          onClick={() => router.push('/apps')}
        >
          Explore All {apps.length} Apps
        </Button>
      </CardContent>
    </Card>
  );
}