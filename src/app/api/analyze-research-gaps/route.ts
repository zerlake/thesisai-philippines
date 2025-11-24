// src/app/api/analyze-research-gaps/route.ts
import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from "@/integrations/supabase/server-client";

// This API route calls the Supabase function that wraps Puter.js functionality
export async function POST(req: NextRequest) {
  try {
    const { researchTopic, fieldOfStudy, keywords, existingLiterature, _researchFocus, _importedReferences } = await req.json();

    // Create supabase client to call the function
    const supabase = createServerSupabaseClient();
    
    // Call the Supabase function that wraps Puter.js AI capabilities
    const { data, error } = await supabase.functions.invoke('puter-ai-wrapper', {
      body: { 
        researchTopic, 
        fieldOfStudy, 
        keywords, 
        existingLiterature
      }
    });

    if (error) {
      console.error('Error invoking puter-ai-wrapper function:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to analyze research gaps', details: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error: any) {
    console.error('Error in analyze-research-gaps API route:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}