/**
 * Puter AI Integration for Supabase Edge Functions
 * Provides a unified interface to call Puter AI service
 */

interface PuterAIOptions {
  temperature?: number;
  max_tokens?: number;
  timeout?: number;
  systemPrompt?: string;
}

/**
 * Call Puter AI with a given prompt using OpenAI-compatible API
 */
export async function callPuterAI(
  prompt: string,
  options: PuterAIOptions = {}
): Promise<string> {
  const { 
    temperature = 0.7, 
    max_tokens = 2000, 
    timeout = 30000,
    systemPrompt = 'You are a helpful assistant.'
  } = options;

  const puterApiKey = Deno.env.get('PUTER_API_KEY');
  const endpoint = Deno.env.get("PUTER_API_ENDPOINT") || 'https://api.puter.com/v1/ai/chat';

  console.log(`[puter-ai] Calling Puter AI - Endpoint: ${endpoint}, Has API Key: ${!!puterApiKey}`);

  try {
    const response = await Promise.race([
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(puterApiKey && { 'Authorization': `Bearer ${puterApiKey}` }),
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature,
          max_tokens,
        }),
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Puter AI request timed out')), timeout)
      ),
    ]) as Response;

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error(`[puter-ai] API error: ${response.status} - ${response.statusText}`, errorText);
      throw new Error(`Puter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    console.log(`[puter-ai] Got response with keys:`, Object.keys(data));
    
    // Handle OpenAI-compatible response format
    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content;
    }
    
    // Fallback formats
    if (typeof data === 'string') {
      return data;
    }
    
    if (data.response) {
      return data.response;
    }
    
    if (data.text) {
      return data.text;
    }

    console.error('[puter-ai] Unexpected response format:', data);
    throw new Error('Unexpected response format from Puter API');
  } catch (error) {
    console.error('[puter-ai] Exception during API call:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to call Puter AI: ' + String(error));
  }
}

/**
 * Call Puter AI with fallback to basic response if API fails
 */
export async function callPuterAIWithFallback(
  prompt: string,
  fallbackResponse: string,
  options: PuterAIOptions = {}
): Promise<string> {
  try {
    return await callPuterAI(prompt, options);
  } catch (error) {
    console.error('Puter AI call failed, using fallback:', error);
    return fallbackResponse;
  }
}

/**
 * Format a prompt for academic writing tasks
 */
export function formatAcademicPrompt(task: string, content: string): string {
  return `You are an expert academic writing assistant. Your task is to ${task}.

Content to process:
"${content}"

Provide only the output, without any additional explanation or formatting.`;
}

/**
 * Parse JSON response from Puter AI
 */
export function parsePuterJSONResponse(response: string): Record<string, any> {
  try {
    return JSON.parse(response);
  } catch {
    // If response isn't valid JSON, try to extract JSON from the text
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse Puter AI response as JSON');
  }
}
