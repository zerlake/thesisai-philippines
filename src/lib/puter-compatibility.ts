/**
 * Puter Compatibility Layer
 * 
 * Provides fallback mechanism when Puter AI SDK is unavailable.
 * Allows existing code to work with direct Puter connection.
 */

import { getPuterConnection, PuterRequest, PuterResponse } from './puter-direct-connection';

/**
 * AI generation options
 */
export interface AIGenerationOptions {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  onStream?: (chunk: string) => void;
}

/**
 * Generate text using Puter
 */
export async function generateWithPuter(options: AIGenerationOptions): Promise<string> {
  const puter = getPuterConnection();

  try {
    if (options.stream && options.onStream) {
      // Stream mode
      let fullText = '';
      for await (const chunk of puter.stream({
        prompt: options.prompt,
        model: options.model,
        maxTokens: options.maxTokens,
        temperature: options.temperature,
        stream: true,
      })) {
        fullText += chunk;
        options.onStream(chunk);
      }
      return fullText;
    } else {
      // Non-stream mode
      const response = await puter.request({
        prompt: options.prompt,
        model: options.model,
        maxTokens: options.maxTokens,
        temperature: options.temperature,
        stream: false,
      });
      return response.text;
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`Puter generation failed: ${errorMsg}`);
  }
}

/**
 * Check if Puter is available
 */
export async function isPuterAvailable(): Promise<boolean> {
  const puter = getPuterConnection();
  return await puter.healthCheck();
}

/**
 * Get Puter status
 */
export interface PuterStatus {
  available: boolean;
  lastChecked: number;
  error?: string;
}

export async function getPuterStatus(): Promise<PuterStatus> {
  const puter = getPuterConnection();

  try {
    const available = await puter.healthCheck();
    return {
      available,
      lastChecked: Date.now(),
    };
  } catch (error) {
    return {
      available: false,
      lastChecked: Date.now(),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Batch generate multiple prompts
 */
export async function batchGenerate(
  prompts: string[],
  options?: Omit<AIGenerationOptions, 'prompt'>
): Promise<string[]> {
  const results: string[] = [];
  const puter = getPuterConnection();

  for (const prompt of prompts) {
    try {
      const response = await puter.request({
        prompt,
        model: options?.model,
        maxTokens: options?.maxTokens,
        temperature: options?.temperature,
      });
      results.push(response.text);
    } catch (error) {
      console.error(`Failed to generate for prompt: ${prompt}`);
      results.push('');
    }
  }

  return results;
}

/**
 * Generate with timeout
 */
export async function generateWithTimeout(
  options: AIGenerationOptions,
  timeoutMs: number = 30000
): Promise<string> {
  return Promise.race([
    generateWithPuter(options),
    new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error('Generation timeout')), timeoutMs)
    ),
  ]);
}

/**
 * Streaming generator for realtime updates
 */
export async function* streamGenerate(
  options: AIGenerationOptions
): AsyncGenerator<string, void, unknown> {
  const puter = getPuterConnection();

  for await (const chunk of puter.stream({
    prompt: options.prompt,
    model: options.model,
    maxTokens: options.maxTokens,
    temperature: options.temperature,
    stream: true,
  })) {
    yield chunk;
  }
}
