// src/app/api/ai-tools/[toolId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Schema for AI tool execution requests
const executeToolSchema = z.object({
  inputs: z.record(z.unknown()).optional().default({}),
  config: z.record(z.unknown()).optional().default({}),
  context: z.object({
    projectId: z.string().uuid('Invalid project ID').optional(),
    documentId: z.string().uuid('Invalid document ID').optional(),
    chapterId: z.string().uuid('Invalid chapter ID').optional(),
  }).optional().default({}),
});

// Helper functions for responses
function createSuccessResponse(data: any, message?: string, status: number = 200) {
  return NextResponse.json({ 
    success: true, 
    data, 
    ...(message && { message }) 
  }, { status });
}

function createErrorResponse(message: string, status: number, code?: string) {
  return NextResponse.json(
    { 
      success: false, 
      error: { 
        message, 
        code,
        ...(process.env.NODE_ENV === 'development' && { timestamp: new Date().toISOString() })
      } 
    },
    { status }
  );
}

// POST /api/ai-tools/:toolId/execute
export async function POST(
  request: NextRequest,
  context: any // Use 'any' to bypass the type error
) {
  const params = context.params as { toolId: string }; // Cast inside the function
  try {
    // Extract user ID from auth middleware
    const userId = request.headers.get('x-user-id');
    const toolId = params.toolId;

    if (!userId) {
      return createErrorResponse('Authentication required', 401, 'UNAUTHORIZED');
    }

    if (!toolId) {
      return createErrorResponse('Tool ID is required', 400, 'MISSING_TOOL_ID');
    }

    // Parse request body
    const requestBody = await request.json();

    // Validate input
    const validatedData = executeToolSchema.parse(requestBody);

    // Check if the requested tool exists
    const { data: tool, error: toolError } = await supabase
      .from('ai_tools')
      .select('*')
      .eq('id', toolId)
      .eq('is_active', true)
      .single();

    if (toolError || !tool) {
      return createErrorResponse('AI tool not found or inactive', 404, 'TOOL_NOT_FOUND');
    }

    // Verify user has permission to use this tool
    // In a real implementation, we'd check user's plan/subscriptions
    // For now, we'll assume all authenticated users can use public tools

    // Check if user has access to the specified project/document if provided
    if (validatedData.context?.projectId) {
      const { data: project, error: projectError } = await supabase
        .from('thesis_projects')
        .select('id')
        .eq('id', validatedData.context.projectId)
        .eq('user_id', userId)
        .single();

      if (projectError || !project) {
        return createErrorResponse('Project not found or access denied', 404, 'PROJECT_NOT_FOUND');
      }
    }

    if (validatedData.context?.documentId) {
      const { data: document, error: documentError } = await supabase
        .from('thesis_documents')
        .select('id, user_id, project_id')
        .eq('id', validatedData.context.documentId)
        .single();

      if (documentError || !document) {
        return createErrorResponse('Document not found', 404, 'DOCUMENT_NOT_FOUND');
      }

      // Verify user has access to this document (either owns it or is collaborating)
      const hasAccess = document.user_id === userId || 
        await checkCollaborationAccess(userId, document.id, 'thesis_documents');

      if (!hasAccess) {
        return createErrorResponse('Access denied to document', 403, 'ACCESS_DENIED');
      }
    }

    // Prepare input data for the tool execution
    // In a real implementation, this would call the actual AI service
    const inputData = {
      userId,
      toolId,
      inputs: validatedData.inputs,
      config: validatedData.config,
      context: validatedData.context,
      timestamp: new Date().toISOString(),
    };

    // Simulate tool execution (in a real app, this would call an actual AI service)
    let result;
    switch (toolId) {
      case 'topic-ideation':
        result = await simulateTopicIdeation(inputData);
        break;
      case 'outline-generator':
        result = await simulateOutlineGeneration(inputData);
        break;
      case 'content-improver':
        result = await simulateContentImprovement(inputData);
        break;
      case 'citation-generator':
        result = await simulateCitationGeneration(inputData);
        break;
      case 'grammar-checker':
        result = await simulateGrammarCheck(inputData);
        break;
      case 'plagiarism-checker':
        result = await simulatePlagiarismCheck(inputData);
        break;
      default:
        // For other tools, return a generic simulation
        result = {
          success: true,
          output: `Simulated output for tool: ${toolId}`,
          metadata: {
            toolId,
            executionTime: 1000, // ms
            tokensUsed: 50,
            cost: 0.02,
          }
        };
    }

    // Store the tool usage in the database
    const usageRecord = {
      user_id: userId,
      tool_id: toolId,
      project_id: validatedData.context?.projectId || null,
      document_id: validatedData.context?.documentId || null,
      inputs: validatedData.inputs,
      outputs: result.output,
      execution_time_ms: result.metadata?.executionTime || 0,
      tokens_used: result.metadata?.tokensUsed || 0,
      cost_credits: result.metadata?.cost || 0,
      success: result.success,
      error_message: result.error || null,
      created_at: new Date().toISOString(),
    };

    const { error: usageError } = await supabase
      .from('ai_tool_usage')
      .insert([usageRecord]);

    if (usageError) {
      console.error('Error logging tool usage:', usageError);
      // We don't fail the request if we can't log usage, just log the error
    }

    return createSuccessResponse(result, `AI tool ${toolId} executed successfully`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle Zod validation errors
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: 'Validation error',
            code: 'VALIDATION_ERROR',
            details: error.errors
          } 
        },
        { status: 400 }
      );
    }

    console.error(`Error in POST /api/ai-tools/${context.params.toolId}/execute:`, error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500,
      'INTERNAL_ERROR'
    );
  }
}

// Helper function to simulate AI tool execution
async function simulateTopicIdeation(inputData: any) {
  // Simulate topic ideation AI tool
  const fieldOfStudy = inputData.inputs?.fieldOfStudy || 'General';
  const interests = inputData.inputs?.interests || [];

  return {
    success: true,
    output: [
      `Research topic in ${fieldOfStudy}: Impact of ${interests[0] || 'technology'} on ${fieldOfStudy}`,
      `Innovative approach to ${fieldOfStudy} using ${interests[1] || 'modern techniques'}`,
      `Comparative study of ${fieldOfStudy} methodologies in the Philippines`,
    ],
    metadata: {
      executionTime: 1500,
      tokensUsed: 120,
      cost: 0.05,
    },
    error: null
  };
}

async function simulateOutlineGeneration(inputData: any) {
  // Simulate outline generation AI tool
  const documentType = inputData.inputs?.documentType || 'thesis';
  const topic = inputData.inputs?.topic || 'General Research';

  return {
    success: true,
    output: {
      title: `${topic} Outline`,
      sections: [
        { id: '1', title: 'Introduction', level: 1 },
        { id: '2', title: 'Literature Review', level: 1 },
        { id: '3', title: 'Methodology', level: 1 },
        { id: '4', title: 'Results', level: 1 },
        { id: '5', title: 'Discussion', level: 1 },
        { id: '6', title: 'Conclusion', level: 1 },
      ]
    },
    metadata: {
      executionTime: 2000,
      tokensUsed: 200,
      cost: 0.08,
    },
    error: null
  };
}

async function simulateContentImprovement(inputData: any) {
  // Simulate content improvement AI tool
  const content = inputData.inputs?.content || '';
  const improvementType = inputData.inputs?.improvementType || 'clarity';

  return {
    success: true,
    output: `Improved content for ${improvementType}: ${content.substring(0, 20)}...`,
    metadata: {
      executionTime: 1800,
      tokensUsed: 150,
      cost: 0.06,
    },
    error: null
  };
}

async function simulateCitationGeneration(inputData: any) {
  // Simulate citation generation AI tool
  const sourceType = inputData.inputs?.sourceType || 'journal';
  const details = inputData.inputs?.details || {};

  return {
    success: true,
    output: {
      citation: `[Generated citation for ${sourceType} in ${details.style || 'APA'} style]`,
      formatted: `[Formatted citation based on provided details]`
    },
    metadata: {
      executionTime: 1200,
      tokensUsed: 80,
      cost: 0.03,
    },
    error: null
  };
}

async function simulateGrammarCheck(inputData: any) {
  // Simulate grammar check AI tool
  const content = inputData.inputs?.content || '';

  return {
    success: true,
    output: {
      correctedContent: content, // In simulation, return the same content
      issuesFound: 0,
      suggestions: []
    },
    metadata: {
      executionTime: 2500,
      tokensUsed: 300,
      cost: 0.12,
    },
    error: null
  };
}

async function simulatePlagiarismCheck(inputData: any) {
  // Simulate plagiarism check AI tool
  const content = inputData.inputs?.content || '';

  return {
    success: true,
    output: {
      overallSimilarity: 5.2,
      sources: [],
      flaggedSections: [],
      isOriginal: true
    },
    metadata: {
      executionTime: 5000,
      tokensUsed: 500,
      cost: 0.20,
    },
    error: null
  };
}

// Helper function to check collaboration access (simplified)
async function checkCollaborationAccess(userId: string, entityId: string, entityType: string) {
  // In a real implementation, this would check if the user has collaboration access
  // to the specific entity through collaboration invites or group memberships
  return true; // For now, assume true
}