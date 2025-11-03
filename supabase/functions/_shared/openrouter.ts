// _shared/openrouter.ts - OpenRouter model rotation utility

interface OpenRouterRequest {
  messages: Array<{
    role: string;
    content: string;
  }>;
  systemPrompt?: string;
  temperature?: number;
  max_tokens?: number;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const FREE_MODELS = [
  "google/gemini-2.0-flash-exp:free",
  "mistralai/mistral-7b-instruct:free",
  "openchat/openchat-7b:free",
  "google/gemma-7b-it:free",
  "microsoft/wizardlm-2-7b:free"
];

export async function callOpenRouterWithFallback(
  apiKey: string,
  prompt: string,
  systemPrompt: string = "You are a helpful academic assistant.",
  maxRetries: number = 1
): Promise<string> {
  const request: OpenRouterRequest = {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 1000
  };

  // Try each model in sequence until one succeeds
  for (const model of FREE_MODELS) {
    try {
      console.log(`Attempting OpenRouter call with model: ${model}`);
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://thesisai-philippines.vercel.app",
          "X-Title": "THESISAI PHILIPPINES"
        },
        body: JSON.stringify({
          ...request,
          model: model
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`Model ${model} failed with status ${response.status}:`, errorData);
        continue; // Try next model
      }

      const data: OpenRouterResponse = await response.json();
      
      if (data.choices && data.choices[0]?.message?.content) {
        console.log(`Successfully used model: ${model}`);
        return data.choices[0].message.content;
      } else {
        console.warn(`Model ${model} returned invalid response format`);
        continue; // Try next model
      }
    } catch (error) {
      console.warn(`Model ${model} failed with error:`, error);
      continue; // Try next model
    }
  }

  // If all models failed, throw an error
  throw new Error(`All free OpenRouter models failed. Please try again later.`);
}