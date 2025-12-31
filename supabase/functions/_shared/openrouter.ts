// @ts-nocheck
// Shared utility functions for OpenRouter API calls with fallback mechanisms

interface OpenRouterOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

/**
 * Call OpenRouter API with fallback mechanisms
 */
export async function callOpenRouterWithFallback(
  apiKey: string,
  userPrompt: string,
  systemPrompt: string,
  options: OpenRouterOptions = {}
): Promise<string> {
  // Default options
  const defaultOptions: OpenRouterOptions = {
    model: "openai/gpt-4o",
    temperature: 0.7,
    max_tokens: 2048,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    ...options
  };

  // Primary OpenRouter API call
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: defaultOptions.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: defaultOptions.temperature,
        max_tokens: defaultOptions.max_tokens,
        top_p: defaultOptions.top_p,
        frequency_penalty: defaultOptions.frequency_penalty,
        presence_penalty: defaultOptions.presence_penalty
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (primaryError) {
    console.error("Primary OpenRouter call failed:", primaryError);

    // Fallback: return a structured response indicating the error
    // In a real implementation, you might have additional fallbacks here
    throw new Error(`AI service temporarily unavailable. Error: ${primaryError.message}`);
  }
}

/**
 * Simple fallback function for when AI services are unavailable
 */
export function getSimpleFallbackResponse(prompt: string): string {
  return `This is a fallback response. The AI service is currently unavailable. 
Original prompt: ${prompt.substring(0, 100)}...`;
}