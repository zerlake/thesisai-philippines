// Workflow Service - Handles workflow creation, execution, and management
import { Workflow, WorkflowStep, WorkflowTemplate, ProjectContext } from '../types/app-workflow';
import { getAppById } from '../lib/app-registry';

// In-memory storage for workflows (in production, this would connect to Supabase)
const workflowsStorage: Record<string, Workflow> = {};

export class WorkflowService {
  // Create a new workflow
  async createWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workflow> {
    const id = `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const newWorkflow: Workflow = {
      ...workflow,
      id,
      createdAt: now,
      updatedAt: now,
      steps: workflow.steps.map(step => ({
        ...step,
        id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending',
        createdAt: now
      }))
    };
    
    workflowsStorage[id] = newWorkflow;
    return newWorkflow;
  }

  // Get workflow by ID
  async getWorkflowById(id: string): Promise<Workflow | null> {
    return workflowsStorage[id] || null;
  }

  // Update workflow
  async updateWorkflow(workflow: Workflow): Promise<Workflow> {
    workflow.updatedAt = new Date();
    workflowsStorage[workflow.id] = workflow;
    return workflow;
  }

  // Run a workflow
  async runWorkflow(workflowId: string, projectContext: ProjectContext): Promise<Workflow> {
    const workflow = await this.getWorkflowById(workflowId);
    if (!workflow) {
      throw new Error(`Workflow with id ${workflowId} not found`);
    }

    // Update workflow status
    workflow.status = 'active';
    workflow.lastRunAt = new Date();

    // Execute each step in sequence
    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      
      try {
        step.status = 'running';
        await this.updateWorkflow(workflow);

        // Resolve inputs by checking for references to previous steps
        const resolvedInputs = this.resolveInputs(step, workflow, projectContext);

        // Get the app and run it
        const app = getAppById(step.appId);
        if (!app) {
          throw new Error(`App with ID ${step.appId} not found`);
        }

        // Validate inputs against schema
        const inputResult = app.inputSchema.safeParse(resolvedInputs);
        if (!inputResult.success) {
          throw new Error(`Input validation failed: ${inputResult.error.message}`);
        }

        // Run the app
        step.status = 'running';
        await this.updateWorkflow(workflow);

        const outputs = await app.handler(resolvedInputs);

        // Validate outputs against schema
        const outputResult = app.outputSchema.safeParse(outputs);
        if (!outputResult.success) {
          throw new Error(`Output validation failed: ${outputResult.error.message}`);
        }

        // Update step with results
        step.outputs = outputs;
        step.status = 'completed';
        step.completedAt = new Date();

        await this.updateWorkflow(workflow);

      } catch (error) {
        step.status = 'failed';
        step.completedAt = new Date();
        await this.updateWorkflow(workflow);
        throw error;
      }
    }

    // Update workflow status to completed
    workflow.status = 'completed';
    await this.updateWorkflow(workflow);

    return workflow;
  }

  // Resolve step inputs by looking at previous steps and project context
  private resolveInputs(step: WorkflowStep, workflow: Workflow, projectContext: ProjectContext): Record<string, unknown> {
    // Start with the configured inputs for this step
    let inputs = { ...step.config };

    // Check if any input values reference outputs from previous steps
    // This is a simplified implementation - a full implementation would have more sophisticated dependency resolution
    for (const [key, value] of Object.entries(inputs)) {
      if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
        // Extract reference (e.g., {{stepId.outputKey}})
        const reference = value.slice(2, -2).trim();
        const [stepId, outputKey] = reference.split('.');
        
        // Find the referenced step in previous steps
        const referencedStep = workflow.steps.find(s => s.id === stepId);
        if (referencedStep && referencedStep.outputs) {
          inputs[key] = referencedStep.outputs[outputKey];
        }
      }
    }

    // Also merge in project context
    inputs = { ...inputs, ...projectContext };

    return inputs;
  }

  // Get all workflows for a user
  async getUserWorkflows(userId: string): Promise<Workflow[]> {
    return Object.values(workflowsStorage).filter(wf => wf.userId === userId);
  }

  // Get workflows for a specific project
  async getProjectWorkflows(projectId: string): Promise<Workflow[]> {
    return Object.values(workflowsStorage).filter(wf => wf.projectId === projectId);
  }

  // Get workflow templates
  getWorkflowTemplates(): WorkflowTemplate[] {
    return [
      {
        id: 'thesis-conceptualize-template',
        name: 'Thesis Conceptualization',
        description: 'Start your thesis with topic ideation and problem statement refinement',
        category: 'conceptualize',
        steps: [
          {
            appId: 'topic-ideation',
            name: 'Generate Topic Ideas',
            config: {}
          },
          {
            appId: 'problem-statement-refiner',
            name: 'Refine Problem Statement',
            config: {}
          }
        ]
      },
      {
        id: 'thesis-research-template',
        name: 'Literature Research',
        description: 'Conduct literature review and identify research gaps',
        category: 'research',
        steps: [
          {
            appId: 'ai-search',
            name: 'Find Research Papers',
            config: {}
          },
          {
            appId: 'rrl-analyzer',
            name: 'Analyze Papers',
            config: {}
          },
          {
            appId: 'rrl-synthesizer',
            name: 'Synthesize Review',
            config: {}
          },
          {
            appId: 'gap-finder',
            name: 'Find Research Gaps',
            config: {}
          }
        ]
      },
      {
        id: 'thesis-writing-template',
        name: 'Thesis Writing',
        description: 'Draft and refine your thesis content',
        category: 'write',
        steps: [
          {
            appId: 'methodology-designer',
            name: 'Design Methodology',
            config: { researchType: 'qualitative' }
          },
          {
            appId: 'chapter-drafter',
            name: 'Draft Chapter',
            config: { chapterTitle: 'Introduction' }
          },
          {
            appId: 'citation-formatter',
            name: 'Format Citations',
            config: { style: 'APA' }
          }
        ]
      },
      {
        id: 'thesis-defense-template',
        name: 'Defense Preparation',
        description: 'Prepare for your thesis defense',
        category: 'defense',
        steps: [
          {
            appId: 'defense-simulator',
            name: 'Practice Defense Q&A',
            config: {}
          },
          {
            appId: 'slide-generator',
            name: 'Generate Defense Slides',
            config: {}
          }
        ]
      }
    ];
  }
}

export const workflowService = new WorkflowService();