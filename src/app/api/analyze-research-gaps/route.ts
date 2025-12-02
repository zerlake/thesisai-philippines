// src/app/api/analyze-research-gaps/route.ts
// Phase 4: Migrated from Supabase function to client-side Puter AI wrapper
// This API route provides server-side validation and proxying for research gap analysis

import { NextRequest } from 'next/server';
import { getAuthenticatedUser, AuthenticationError } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const user = await getAuthenticatedUser();

    const { researchTopic, fieldOfStudy, keywords, existingLiterature } = await req.json();

    // Validate required fields
    if (!researchTopic || !fieldOfStudy) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: researchTopic, fieldOfStudy' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Note: Client-side components should call Puter AI directly via callPuterAI wrapper
    // This endpoint can be used for server-side caching or batch processing in the future
    // For now, return instructions to use client-side wrapper
    
    return new Response(
      JSON.stringify({
        message: 'Use client-side Puter AI wrapper for research gap analysis',
        instruction: 'Import callPuterAI from @/lib/puter-ai-wrapper',
        deprecated: true,
        legacyNote: 'This endpoint previously called supabase.functions.invoke("puter-ai-wrapper")'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in analyze-research-gaps API route:', error);
    if (error instanceof AuthenticationError) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}