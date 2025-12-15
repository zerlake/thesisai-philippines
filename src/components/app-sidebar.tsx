// src/components/app-sidebar.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkflowTemplate } from '@/types/app-workflow';
import { workflowService } from '@/lib/workflow-service';
import { Play, Plus, Settings, BookOpen, Target, FileText, Presentation, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AppSidebarProps {
  projectId: string;
  currentPhase?: 'conceptualize' | 'research' | 'write' | 'submit' | 'defense';
  userId: string;
}

export function AppSidebar({ projectId, currentPhase, userId }: AppSidebarProps) {
  const router = useRouter();
  const [templates] = useState(() => workflowService.getWorkflowTemplates());
  
  // Filter templates that match the current phase
  const phaseTemplates = currentPhase 
    ? templates.filter(t => t.category === currentPhase) 
    : [];

  // Get recommended templates based on phase
  const recommendedTemplates = currentPhase ? 
    templates.filter(t => t.category === currentPhase) : [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2"
            onClick={() => router.push(`/workflows`)}
          >
            <Plus className="w-4 h-4" />
            New Workflow
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2"
            onClick={() => router.push(`/apps`)}
          >
            <Play className="w-4 h-4" />
            All Apps
          </Button>
        </CardContent>
      </Card>

      {currentPhase && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {currentPhase === 'conceptualize' && <Target className="w-5 h-5" />}
              {currentPhase === 'research' && <BookOpen className="w-5 h-5" />}
              {currentPhase === 'write' && <FileText className="w-5 h-5" />}
              {currentPhase === 'submit' && <Users className="w-5 h-5" />}
              {currentPhase === 'defense' && <Presentation className="w-5 h-5" />}
              Recommended for {currentPhase}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recommendedTemplates.length > 0 ? (
              recommendedTemplates.map(template => (
                <Button
                  key={template.id}
                  variant="outline"
                  className="w-full justify-start gap-2 text-left h-auto py-3"
                  onClick={() => router.push(`/workflows?template=${template.id}`)}
                >
                  <div>
                    <div className="font-medium">{template.name}</div>
                    <p className="text-xs text-slate-400 mt-1">{template.description}</p>
                  </div>
                </Button>
              ))
            ) : (
              <p className="text-slate-400 text-sm">No templates available for this phase</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Play className="w-5 h-5" />
            Quick Apps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => router.push('/apps/topic-ideation')}
          >
            <Target className="w-4 h-4" />
            Topic Ideation
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => router.push('/apps/ai-search')}
          >
            <BookOpen className="w-4 h-4" />
            AI Research
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => router.push('/apps/methodology-designer')}
          >
            <FileText className="w-4 h-4" />
            Methodology
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}