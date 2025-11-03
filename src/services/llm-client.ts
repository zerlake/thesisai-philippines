// src/services/llm-client.ts

/**
 * Calls the OpenRouter API provider.
 * This function reads the API key from environment variables and should only be run on the server.
 * @param prompt The prompt to send to the LLM.
 * @returns A promise that resolves to the LLM's response.
 */
export async function callLlmProvider(
  prompt: string,
  imageUrl?: string,
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set in environment variables.");
  }

  const API_URL = "https://openrouter.ai/api/v1/chat/completions";

  const messages = [
    {
      role: "system",
      content: "You are a helpful academic assistant.",
    },
    {
      role: "user",
      content: prompt,
    }
  ];

  if (imageUrl) {
    // For multimodal requests, we need a different format
    messages[1] = {
      role: "user",
      content: [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: imageUrl } }
      ]
    };
  }

  const requestBody = {
    model: "google/gemini-2.0-flash-exp:free",
    messages: messages,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "THESISAI-PHILIPPINES.VERCEL.APP", // Optional. Site URL for rankings on openrouter.ai.
        "X-Title": "THESISAI PHILIPPINES", // Optional. Site title for rankings on openrouter.ai.
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `OpenRouter API request failed with status ${response.status}: ${errorBody}`,
      );
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "No response from model.";
  } catch (error: any) {
    console.error("Error calling OpenRouter API:", error);
    throw new Error(`Failed to call OpenRouter API: ${error.message}`);
  }
}
