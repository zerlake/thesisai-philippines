// src/app/workflows/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { workflowService } from '@/lib/workflow-service';
import { Workflow } from '@/types/app-workflow';
import { Play, Save, RotateCcw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function WorkflowDetailPage({ params }: { params: { id: string } }) {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const fetchWorkflow = async () => {
      const wf = await workflowService.getWorkflowById(params.id);
      if (wf) {
        setWorkflow(wf);
      }
    };
    
    fetchWorkflow();
  }, [params.id]);

  const runWorkflow = async () => {
    if (!workflow) return;
    
    try {
      setIsRunning(true);
      // In a real implementation, we would run the actual workflow
      // For now, we'll just simulate execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update workflow status
      const updatedWorkflow = { ...workflow, status: 'completed' as const };
      setWorkflow(updatedWorkflow);
      
      alert('Workflow completed successfully!');
    } catch (error) {
      console.error('Error running workflow:', error);
      alert('Error running workflow: ' + (error as Error).message);
    } finally {
      setIsRunning(false);
    }
  };

  if (!workflow) {
    return (
      <div className="container py-8">
        <p>Workflow not found</p>
        <Link href="/workflows">Back to workflows</Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'running': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-3xl font-bold">{workflow.name}</h1>
          <Badge className={`${getStatusColor(workflow.status)} capitalize`}>
            {workflow.status}
          </Badge>
        </div>
        <p className="text-slate-400">{workflow.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Steps</CardTitle>
              <CardDescription>
                {workflow.steps.length} step{workflow.steps.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflow.steps.map((step, index) => (
                  <div 
                    key={step.id} 
                    className="border border-slate-700 rounded-lg p-4 bg-slate-800/30"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Step {index + 1}: {step.name}</h3>
                        <p className="text-sm text-slate-400 mt-1">
                          App ID: {step.appId}
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {step.status}
                      </Badge>
                    </div>
                    
                    {step.outputs && (
                      <div className="mt-3 p-3 bg-slate-900/50 rounded text-sm">
                        <p className="text-xs text-slate-500 mb-1">Output:</p>
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(step.outputs, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full gap-2"
                disabled={isRunning || workflow.status === 'active'}
                onClick={runWorkflow}
              >
                {isRunning ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run Workflow
                  </>
                )}
              </Button>
              
              <Button variant="outline" className="w-full gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
              
              <Button variant="outline" className="w-full gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset Workflow
              </Button>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Workflow Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="capitalize">{workflow.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Created:</span>
                  <span>{new Date(workflow.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Run:</span>
                  <span>
                    {workflow.lastRunAt 
                      ? new Date(workflow.lastRunAt).toLocaleString() 
                      : 'Never'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Project:</span>
                  <span>{workflow.projectId}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}