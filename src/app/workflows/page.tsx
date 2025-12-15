// src/app/workflows/page.tsx
'use client';

import { useState } from 'react';
import { WorkflowBuilder } from '@/components/workflow-builder';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { workflowService } from '@/lib/workflow-service';
import { Workflow } from '@/types/app-workflow';
import { useRouter } from 'next/navigation';

export default function WorkflowsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'builder' | 'templates' | 'my-workflows'>('builder');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [projectId] = useState('project-123'); // This would come from the actual project
  const [userId] = useState('user-123'); // This would come from auth context

  const templates = workflowService.getWorkflowTemplates();

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">ThesisAI Workflows</h1>
        <p className="text-slate-400">Create and manage your research workflows</p>
      </div>

      <div className="flex border-b border-slate-700 mb-6">
        <Button
          variant={activeTab === 'builder' ? 'secondary' : 'ghost'}
          className="rounded-none border-b-2 border-transparent hover:border-slate-500"
          onClick={() => setActiveTab('builder')}
        >
          Workflow Builder
        </Button>
        <Button
          variant={activeTab === 'templates' ? 'secondary' : 'ghost'}
          className="rounded-none border-b-2 border-transparent hover:border-slate-500"
          onClick={() => setActiveTab('templates')}
        >
          Templates
        </Button>
        <Button
          variant={activeTab === 'my-workflows' ? 'secondary' : 'ghost'}
          className="rounded-none border-b-2 border-transparent hover:border-slate-500"
          onClick={() => setActiveTab('my-workflows')}
        >
          My Workflows
        </Button>
      </div>

      {activeTab === 'builder' && (
        <WorkflowBuilder 
          template={selectedTemplate ? templates.find(t => t.id === selectedTemplate) : undefined}
          projectId={projectId}
          userId={userId}
        />
      )}

      {activeTab === 'templates' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Workflow Templates</h2>
          <p className="text-slate-400">Get started quickly with pre-built workflow templates</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium">Steps:</p>
                    <ul className="text-sm text-slate-400">
                      {template.steps.slice(0, 3).map((step, i) => (
                        <li key={i} className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                          {step.name}
                        </li>
                      ))}
                      {template.steps.length > 3 && (
                        <li className="text-xs text-slate-500">+ {template.steps.length - 3} more steps</li>
                      )}
                    </ul>
                  </div>
                  <Button 
                    className="w-full mt-2"
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setActiveTab('builder');
                    }}
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'my-workflows' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">My Workflows</h2>
          <p className="text-slate-400">Manage your saved workflows</p>
          
          <Card>
            <CardHeader>
              <CardTitle>No workflows yet</CardTitle>
              <CardDescription>
                Create your first workflow using the Workflow Builder or a template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setActiveTab('builder')}>Create Workflow</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}