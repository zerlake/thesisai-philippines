// src/app/api/paraphrase/route.ts
import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/integrations/supabase/server-client';

interface ParaphraseRequest {
  text: string;
  mode: 'formal' | 'simple' | 'expand' | 'standard';
}

export async function POST(request: NextRequest) {
  try {
    const body: ParaphraseRequest = await request.json();

    if (!body.text || !body.text.trim()) {
      return Response.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Get auth session from Supabase
    const supabase = createServerSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { text, mode } = body;

    // Build the prompt based on mode
    let systemPrompt = '';
    switch (mode) {
      case 'formal':
        systemPrompt = `You are an expert academic editor. Rewrite the following text to make it more formal and suitable for a thesis. 
- Elevate the vocabulary and sentence structure.
- Ensure the core meaning is preserved.
- Return only the rewritten text, with no additional comments or explanations.`;
        break;
      case 'simple':
        systemPrompt = `You are an expert academic editor. Simplify the following text.
- Make it easier to understand for a general audience.
- Use clearer, more direct language.
- Retain the key information and core meaning.
- Return only the simplified text, with no additional comments or explanations.`;
        break;
      case 'expand':
        systemPrompt = `You are an expert academic editor. Expand on the following text.
- Add more detail, context, or examples to elaborate on the core idea.
- The length should be slightly longer but not excessively so.
- Maintain a consistent academic tone.
- Return only the expanded text, with no additional comments or explanations.`;
        break;
      case 'standard':
      default:
        systemPrompt = `You are an expert academic editor. Paraphrase the following text.
- The new version should have a different sentence structure and use different vocabulary.
- It must retain the original meaning and academic tone.
- Return only the paraphrased text, with no additional comments or explanations.`;
    }

    // For now, return a placeholder response
    // In production, this would call an actual AI service
    return Response.json(
      {
        error: 'AI service temporarily unavailable. Please try using the Puter SDK directly, or refresh the page to load it.',
        code: 'SERVICE_UNAVAILABLE',
      },
      { status: 503 }
    );
  } catch (error) {
    console.error('Error in paraphrase API:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
