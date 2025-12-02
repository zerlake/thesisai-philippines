/**
 * Puter AI Wrapper
 * Provides a unified interface for calling Puter AI across the application
 * Handles SDK initialization, error handling, and fallbacks
 */

interface PuterAIOptions {
  temperature?: number;
  max_tokens?: number;
  timeout?: number;
  systemPrompt?: string;
}

/**
 * Check if Puter AI is available
 */
export function isPuterAIAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window.puter && window.puter.ai && typeof window.puter.ai.chat === 'function');
}

/**
 * Load and wait for Puter SDK to be ready
 */
async function ensurePuterSDK(timeoutMs: number = 5000): Promise<void> {
  // Import here to avoid circular dependency
  const { loadPuterSDK } = await import('@/utils/puter-sdk-loader');

  try {
    // Load the SDK if not already loaded
    await loadPuterSDK();
  } catch (error) {
    console.error('Failed to load Puter SDK:', error);
    throw new Error('Failed to load Puter AI SDK');
  }

  // Wait for puter.ai.chat to be available
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    if (typeof window !== 'undefined' && window.puter?.ai?.chat) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('Puter AI SDK failed to load after initialization');
}

/**
 * Call Puter AI with a given prompt
 */
export async function callPuterAI(
  prompt: string,
  options: PuterAIOptions = {},
  retries: number = 2  // Default to 2 retries
): Promise<string> {
  const {
    temperature = 0.7,
    max_tokens = 2000,
    timeout = 120000,  // Increased from 60s to 120s for complex requests
    systemPrompt
  } = options;

  // Try to call Puter AI, with retries for timeout errors
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Ensure SDK is loaded
      await ensurePuterSDK(timeout);

      // Build the final prompt
      let finalPrompt = prompt;
      if (systemPrompt) {
        finalPrompt = `${systemPrompt}\n\n${prompt}`;
      }

      // Call Puter AI directly (single string parameter)
      const result = await Promise.race([
        (window as any).puter.ai.chat(finalPrompt),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Puter AI request timed out')), timeout)
        ),
      ]);

      // Extract text from response - Puter returns {message: {content: "..."}}
      let text = '';
      if (typeof result === 'string') {
        text = result.trim();
      } else if (result && typeof result === 'object') {
        text =
          (result as any).message?.content?.trim() ||
          (result as any).choices?.[0]?.message?.content?.trim() ||
          (result as any).choices?.[0]?.text?.trim() ||
          (result as any).response?.trim() ||
          (result as any).text?.trim() ||
          (result as any).content?.trim() ||
          '';
      }

      if (!text) {
        throw new Error('Puter AI returned an empty response. Please try again.');
      }

      return text;
    } catch (error) {
      // Detailed error extraction
      let errorMessage = 'Failed to call Puter AI';

      if (error instanceof Error) {
        errorMessage = error.message;
        if (errorMessage.includes('timed out') && attempt < retries) {
          console.warn(`Puter AI request timed out (attempt ${attempt + 1}/${retries + 1}), retrying...`);
          // Wait before retrying - exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue; // Retry the request
        } else if (errorMessage.includes('timed out')) {
          throw new Error('The AI service took too long to respond. Please try again.');
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
        if (error.includes('timed out') && attempt < retries) {
          console.warn(`Puter AI request timed out (attempt ${attempt + 1}/${retries + 1}), retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
      } else if (error && typeof error === 'object') {
        if ((error as any).error) {
          errorMessage = (error as any).error;
        } else if ((error as any).message) {
          errorMessage = (error as any).message;
        } else {
          // Try to extract meaningful info from object
          const errorStr = JSON.stringify(error);
          if (errorStr && errorStr !== '{}') {
            errorMessage = `AI Error: ${errorStr}`;
          }
        }
      }

      if (attempt >= retries) {
        throw new Error(errorMessage);
      }
    }
  }

  // This line should never be reached due to the loop logic, but added for type safety
  throw new Error('Failed to call Puter AI after retries.');
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
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // Continue to throw original error
      }
    }
    throw new Error('Failed to parse Puter AI response as JSON');
  }
}

/**
 * Format academic writing prompts
 */
export function createAcademicPrompt(
  instruction: string,
  content: string,
  context?: string
): string {
  let prompt = `You are an expert academic writing assistant.\n\nTask: ${instruction}\n\nContent:\n"${content}"`;
  
  if (context) {
    prompt += `\n\nContext: ${context}`;
  }
  
  prompt += '\n\nProvide only the output without any additional explanation.';
  
  return prompt;
}

/**
 * Wrap Puter AI calls with error handling for UI components
 */
export async function callPuterAIWithErrorHandling(
  prompt: string,
  options: PuterAIOptions = {},
  retries: number = 2
): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const result = await callPuterAI(prompt, options, retries);
    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: message };
  }
}
