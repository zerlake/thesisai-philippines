// src/app/api/composio-mcp/route.ts
import { NextRequest } from 'next/server';
import { validateAction, createSafeErrorResponse, sanitizeInput } from '@/lib/security';

// Define types for better type safety
// interface UserProfile {
//   id: string;
//   role: string;
// }

// interface ComposioConfig {
//   server: string;
//   model: string;
//   maxTokens: number;
//   temperature: number;
// }

// interface APIResponse {
//   success?: boolean;
//   message?: string;
//   error?: string;
//   config?: ComposioConfig;
//   status: string;
//   server?: string;
//   model?: string;
//   maxTokens?: number;
//   temperature?: number;
//   connectedAt?: string;
//   lastChecked?: string;
// }

// Note: On the server-side, we can't use user session tokens directly in API routes
// because Next.js edge runtime has limitations with Supabase auth
// Instead, we'll rely on the auth middleware or the client to handle this

// For server-side rendering compatibility, we'll handle auth verification in the middleware
// or in the client-side component before making the API call
// This route assumes the caller has been authorized already

export async function POST(request: NextRequest) {
  try {
    // Note: In a real implementation, authentication should be handled by middleware
    // The actual verification would happen before reaching this API route
    // This is just a placeholder for the actual implementation
    
    const { action, server } = await request.json();

    // Validate action parameter to prevent arbitrary operations
    const allowedActions = ['connect', 'status', 'execute', 'tools'];
    const validatedAction = validateAction(action, allowedActions);
    
    // Sanitize server parameter if provided
    const validatedServer = server ? sanitizeInput(server, 100) : 'composio';

    // Get the API keys from environment
    const openrouterApiKey = process.env.OPENROUTER_API_KEY;
    
    if (!openrouterApiKey) {
      return Response.json(
        { error: 'OpenRouter API key is not configured in environment' },
        { status: 500 }
      );
    }

    // Define the configuration based on the MCP configuration provided
    const composioConfig = {
      server: validatedServer,
      model: "qwen/qwen3-coder:free",
      maxTokens: 1024,
      temperature: 0.7
    };

    // In a real implementation, this would connect to the actual Composio Playground service
    // For now, we'll return the configuration and simulate the connection
    switch (validatedAction) {
      case 'connect':
        return Response.json({ 
          success: true, 
          message: 'Connected to Composio Playground',
          config: {
            ...composioConfig,
            status: 'connected',
            connectedAt: new Date().toISOString()
          }
        });
        
      case 'status':
        return Response.json({ 
          status: 'connected',
          ...composioConfig,
          connectedAt: new Date().toISOString()
        });
        
      case 'execute':
        return Response.json({
          result: 'Command executed successfully',
          output: 'This is a simulated response from Composio Playground',
          success: true
        });
        
      case 'tools':
        return Response.json({
          tools: ['composio', 'documentation', 'integration'],
          server: composioConfig.server
        });
        
      default:
        return Response.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in Composio MCP API:', error);
    const { error: errorMessage } = createSafeErrorResponse(error);
    return Response.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    // Check connection status
    const composioConfig = {
      server: 'composio',
      model: "qwen/qwen3-coder:free",
      maxTokens: 1024,
      temperature: 0.7
    };
    
    return Response.json({ 
      status: 'disconnected',
      ...composioConfig,
      lastChecked: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in Composio MCP API:', error);
    const { error: errorMessage } = createSafeErrorResponse(error);
    return Response.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}