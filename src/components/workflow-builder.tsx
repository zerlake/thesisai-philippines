'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppCard } from '@/components/app-card';
import { getAppById, getAllApps, getAppsByCategory } from '@/lib/app-registry';
import { WorkflowStep, WorkflowTemplate } from '@/types/app-workflow';
import { workflowService } from '@/lib/workflow-service';
import { Plus, Play, Save, Trash2, MoveVertical } from 'lucide-react';

interface WorkflowBuilderProps {
  template?: WorkflowTemplate;
  projectId: string;
  userId: string;
}

export function WorkflowBuilder({ template, projectId, userId }: WorkflowBuilderProps) {
  const [steps, setSteps] = useState<WorkflowStep[]>(
    template?.steps.map((step, index) => ({
      id: `step_${index}_${Date.now()}`,
      appId: step.appId,
      name: step.name,
      config: step.config,
      inputs: {},
      outputs: {},
      status: 'pending',
      createdAt: new Date()
    })) || []
  );

  const [workflowName, setWorkflowName] = useState(template?.name || 'New Workflow');
  const [workflowDescription, setWorkflowDescription] = useState(template?.description || '');
  const [availableApps] = useState(() => getAllApps());

  const addStep = (appId: string) => {
    const app = getAppById(appId);
    if (!app) return;

    const newStep: WorkflowStep = {
      id: `step_${steps.length}_${Date.now()}`,
      appId,
      name: app.name,
      config: {},
      inputs: {},
      outputs: {},
      status: 'pending',
      createdAt: new Date()
    };

    setSteps([...steps, newStep]);
  };

  const removeStep = (index: number) => {
    const newSteps = [...steps];
    newSteps.splice(index, 1);
    setSteps(newSteps);
  };

  const moveStep = (fromIndex: number, toIndex: number) => {
    const newSteps = [...steps];
    const [movedItem] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, movedItem);
    setSteps(newSteps);
  };

  const moveStepUp = (index: number) => {
    if (index === 0) return;
    moveStep(index, index - 1);
  };

  const moveStepDown = (index: number) => {
    if (index === steps.length - 1) return;
    moveStep(index, index + 1);
  };

  const saveWorkflow = async () => {
    try {
      await workflowService.createWorkflow({
        name: workflowName,
        description: workflowDescription,
        projectId,
        userId,
        steps,
        status: 'draft'
      });
      alert('Workflow saved successfully!');
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Error saving workflow: ' + (error as Error).message);
    }
  };

  const runWorkflow = async () => {
    try {
      // In a real implementation, we'd create the workflow first, then run it
      // For simplicity, we'll just show a message here
      alert('Workflow would run now with the current steps');
    } catch (error) {
      console.error('Error running workflow:', error);
      alert('Error running workflow: ' + (error as Error).message);
    }
  };

  const categoryNames = {
    conceptualize: 'Conceptualize',
    research: 'Research',
    write: 'Write & Refine',
    submit: 'Submit & Present',
    defense: 'Defense'
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Workflow Name</label>
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter workflow name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter workflow description"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={saveWorkflow} className="gap-2">
            <Save className="w-4 h-4" />
            Save Workflow
          </Button>
          <Button onClick={runWorkflow} className="gap-2 bg-green-600 hover:bg-green-700">
            <Play className="w-4 h-4" />
            Run Workflow
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Apps */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Apps</CardTitle>
              <CardDescription>Add apps to your workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
              {Object.entries(categoryNames).map(([category, displayName]) => {
                const apps = getAppsByCategory(category as any);
                if (apps.length === 0) return null;

                return (
                  <div key={category} className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-400 border-b border-slate-700 pb-1">
                      {displayName}
                    </h3>
                    <div className="space-y-2">
                      {apps.map(app => (
                        <div key={app.id} className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 justify-start"
                            onClick={() => addStep(app.id)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            {app.name}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Workflow Steps */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Workflow Steps</CardTitle>
              <CardDescription>Reorder steps using the up/down buttons</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {steps.map((step, index) => {
                  const app = getAppById(step.appId);
                  if (!app) return null;

                  return (
                    <div key={step.id} className="border border-slate-700 rounded-lg bg-slate-800/50 flex">
                      <div className="flex flex-col justify-center p-3 border-r border-slate-700">
                        <div className="text-lg mr-3">{app.icon}</div>
                      </div>
                      <div className="flex-1 p-3">
                        <h3 className="font-medium">{app.name}</h3>
                        <p className="text-xs text-slate-400">{app.description}</p>
                      </div>
                      <div className="flex flex-col justify-center p-2 space-y-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => moveStepUp(index)}
                          disabled={index === 0}
                        >
                          <MoveVertical className="w-4 h-4 rotate-90" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => moveStepDown(index)}
                          disabled={index === steps.length - 1}
                        >
                          <MoveVertical className="w-4 h-4 -rotate-90" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                          onClick={() => removeStep(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {steps.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <p>No steps added yet. Add apps from the left panel to build your workflow.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}