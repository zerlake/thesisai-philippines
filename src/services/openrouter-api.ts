// OpenRouter API Service for AI-powered features

interface ChatCompletionRequest {
  model: string;
  messages: Array<{
    role: string;
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class OpenRouterAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // In a real environment, we'd load this from environment variables
    // For this example, we'll use a placeholder that would be replaced in production
    this.apiKey = process.env.OPENROUTER_API_KEY || "YOUR_OPENROUTER_API_KEY";
    this.baseUrl = "https://openrouter.ai/api/v1";
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    // Make the actual API call to OpenRouter
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", // App URL
        "X-Title": "ThesisAI" // App name
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenRouter API request failed with status ${response.status}: ${errorBody}`);
    }

    return await response.json();
  }

  // Additional API methods could be implemented here
  async textCompletion(prompt: string) {
    const request: ChatCompletionRequest = {
      model: "openai/gpt-3.5-turbo",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    };
    
    return await this.chatCompletion(request);
  }
}

export { OpenRouterAPI };
export type { ChatCompletionRequest, ChatCompletionResponse };