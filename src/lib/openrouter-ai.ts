/**
 * OpenRouter AI Integration - Fallback when Puter SDK is unavailable
 */

interface OpenRouterRequestBody {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  temperature: number;
  max_tokens: number;
  top_p?: number;
}

interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

/**
 * Call OpenRouter API for text generation
 */
export async function callOpenRouterAPI(
  prompt: string,
  systemPrompt: string,
  options: {
    temperature?: number;
    max_tokens?: number;
    timeout?: number;
    model?: string;
  } = {}
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OpenRouter API key is not configured. Please contact support.');
  }

  const model = options.model || 'qwen/qwen3-coder:free';
  const temperature = options.temperature ?? 0.7;
  const max_tokens = options.max_tokens ?? 2000;
  const timeout = options.timeout ?? 30000;

  const requestBody: OpenRouterRequestBody = {
    model,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature,
    max_tokens,
    top_p: 0.95,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(process.env.NEXT_PUBLIC_OPENROUTER_API_ENDPOINT || 'https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.href : 'https://thesisai-philippines.vercel.app',
        'X-Title': 'ThesisAI Philippines',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[OpenRouter] API error:', response.status, errorData);

      if (response.status === 401 || response.status === 403) {
        throw new Error('OpenRouter API authentication failed. Please contact support.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      } else if (response.status >= 500) {
        throw new Error('OpenRouter service is temporarily unavailable. Please try again later.');
      }

      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data: OpenRouterResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error('OpenRouter returned an empty response');
    }

    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenRouter returned no text content');
    }

    return content.trim();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Unable to reach OpenRouter. Please check your internet connection.');
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('OpenRouter request timed out. Please try again.');
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Failed to call OpenRouter API: ' + String(error));
  }
}
