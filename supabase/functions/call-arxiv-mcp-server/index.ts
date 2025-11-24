// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const getCorsHeaders = (req: Request) => {
  const ALLOWED_ORIGINS = [
    'https://thesisai-philippines.vercel.app',
    'http://localhost:3000',
    'http://localhost:32100',
  ];
  const origin = req.headers.get('Origin');
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cc-webhook-signature',
  };
}

interface RequestBody {
  toolName: string;
  toolArguments: Record<string, any>;
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing authorization header')
    const jwt = authHeader.replace('Bearer ', '')

    const supabaseAdmin = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user } } = await supabaseAdmin.auth.getUser(jwt)
    if (!user) throw new Error('Invalid JWT')

    // @ts-ignore
    const arxivMcpServerUrl = Deno.env.get("ARXIV_MCP_SERVER_URL");
    if (!arxivMcpServerUrl) {
      throw new Error("ARXIV_MCP_SERVER_URL is not set in Supabase project secrets. Please add it.");
    }

    const { toolName, toolArguments } = await req.json() as RequestBody;
    if (!toolName || !toolArguments) {
      return new Response(JSON.stringify({ error: 'toolName and toolArguments are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Forward the request to the arxiv-mcp-server
    const mcpResponse = await fetch(`${arxivMcpServerUrl}/call_tool`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader, // Forward the user's JWT for potential auth on MCP server
      },
      body: JSON.stringify({ name: toolName, arguments: toolArguments }),
    });

    if (!mcpResponse.ok) {
      let errorBody;
      try {
        errorBody = await mcpResponse.json();
      } catch (parseError) {
        // If response is not JSON, get text content
        const errorText = await mcpResponse.text();
        console.error("Non-JSON error response:", errorText);
        throw new Error(`ArXiv MCP Server error: ${mcpResponse.status} - ${errorText}`);
      }
      
      // Handle different possible error formats
      let errorMessage = mcpResponse.statusText;
      if (errorBody && typeof errorBody === 'object') {
        if (errorBody.error) {
          errorMessage = errorBody.error;
        } else if (errorBody.message) {
          errorMessage = errorBody.message;
        } else if (errorBody.detail) {  // Common in some APIs
          errorMessage = errorBody.detail;
        } else {
          // Try to stringify the full error object to see its content
          errorMessage = JSON.stringify(errorBody);
        }
      } else if (typeof errorBody === 'string') {
        errorMessage = errorBody;
      }
      
      console.error("MCP Server error response:", errorBody);
      throw new Error(`ArXiv MCP Server error: ${errorMessage}`);
    }

    const mcpData = await mcpResponse.json();
    console.log("MCP Server response data:", mcpData);

    // The MCP server returns a list of TextContent. We expect the first item to be the JSON result.
    const resultTextContent = mcpData[0]?.text;
    if (!resultTextContent) {
      console.error("MCP Server response structure unexpected:", mcpData);
      throw new Error(`ArXiv MCP Server did not return expected text content. Received: ${JSON.stringify(mcpData)}`);
    }

    // Parse the JSON string from the TextContent
    let parsedResult;
    try {
      parsedResult = JSON.parse(resultTextContent);
    } catch (parseError) {
      console.error("Failed to parse MCP result as JSON:", resultTextContent);
      throw new Error(`Failed to parse MCP server result as JSON: ${resultTextContent}`);
    }

    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in call-arxiv-mcp-server function:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})