// src/components/enterprise-workflows-card.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Workflow } from "@/types/app-workflow";
import { workflowService } from "@/lib/workflow-service";
import { Play, Plus, Target, BookOpen, FileText, Presentation } from "lucide-react";

export function EnterpriseWorkflowsCard() {
  const router = useRouter();
  const templates = workflowService.getWorkflowTemplates().slice(0, 2); // Show first 2 templates

  return (
    <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-600/20">
              <Target className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Research Workflows</CardTitle>
              <CardDescription className="text-xs">
                Pre-built sequences to accelerate your research
              </CardDescription>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/workflows')}
          >
            <Plus className="w-4 h-4 mr-1" />
            All Workflows
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {templates.map(template => (
            <div 
              key={template.id} 
              className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/30 hover:bg-slate-800/70 transition-colors cursor-pointer"
              onClick={() => router.push(`/workflows?template=${template.id}`)}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-sm">{template.name}</h3>
                <span className="text-xs bg-slate-700 px-2 py-1 rounded-full text-slate-300">
                  {template.steps.length} steps
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{template.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {template.steps.slice(0, 3).map((step, i) => (
                  <span key={i} className="text-xs bg-slate-700/50 px-1.5 py-0.5 rounded text-slate-300">
                    {step.name}
                  </span>
                ))}
                {template.steps.length > 3 && (
                  <span className="text-xs text-slate-500">+{template.steps.length - 3} more</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <Button 
          className="w-full mt-4" 
          variant="outline"
          onClick={() => router.push('/workflows')}
        >
          View All Templates
        </Button>
      </CardContent>
    </Card>
  );
}