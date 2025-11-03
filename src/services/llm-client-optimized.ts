// src/services/llm-client-optimized.ts

import { MEMORY_CONFIG, checkMemoryUsage } from '@/lib/memory.config';

/**
 * Calls the OpenRouter API provider with memory management.
 * This function reads the API key from environment variables and should only be run on the server.
 * @param prompt The prompt to send to the LLM.
 * @param imageUrl Optional image URL for multimodal requests
 * @returns A promise that resolves to the LLM's response.
 */
export async function callLlmProviderOptimized(
  prompt: string,
  imageUrl?: string,
): Promise<string> {
  // Check memory before processing
  const memoryUsage = checkMemoryUsage();
  console.log("Current memory usage:", memoryUsage);
  
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set in environment variables.");
  }

  const API_URL = "https://openrouter.ai/api/v1/chat/completions";

  // Limit prompt size to prevent excessive memory usage
  const MAX_PROMPT_LENGTH = 10000;
  if (prompt.length > MAX_PROMPT_LENGTH) {
    throw new Error(`Prompt too long. Maximum length is ${MAX_PROMPT_LENGTH} characters.`);
  }

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
    // Set a timeout for the API call to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), MEMORY_CONFIG.OPERATION_TIMEOUT);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "THESISAI-PHILIPPINES.VERCEL.APP", // Optional. Site URL for rankings on openrouter.ai.
        "X-Title": "THESISAI PHILIPPINES", // Optional. Site title for rankings on openrouter.ai.
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `OpenRouter API request failed with status ${response.status}: ${errorBody}`,
      );
    }

    const data = await response.json();
    
    // Check memory after processing
    const finalMemory = checkMemoryUsage();
    console.log("Final memory usage:", finalMemory);

    return data.choices[0]?.message?.content || "No response from model.";
  } catch (error: any) {
    console.error("Error calling OpenRouter API:", error);
    if (error.name === 'AbortError') {
      throw new Error('LLM API request timed out');
    }
    throw new Error(`Failed to call OpenRouter API: ${error.message}`);
  }
}