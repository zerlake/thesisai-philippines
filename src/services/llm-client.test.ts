// src/services/llm-client.test.ts
import { callLlmProvider } from "./llm-client";

global.fetch = jest.fn();

describe("LLM Client Service (OpenRouter)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      OPENROUTER_API_KEY: "test-openrouter-key",
    };
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should call the OpenRouter API for text-only prompt and return content on success", async () => {
    const mockApiResponse = {
      choices: [
        {
          message: {
            content: "This is the AI text response.",
          },
        },
      ],
    };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    const prompt = "Describe a cat.";
    const response = await callLlmProvider(prompt);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer test-openrouter-key",
          "Content-Type": "application/json",
          "HTTP-Referer": "THESISAI-PHILIPPINES.VERCEL.APP",
          "X-Title": "THESISAI PHILIPPINES",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-exp:free",
          messages: [
            {
              role: "system",
              content: "You are a helpful academic assistant.",
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }),
    );
    expect(response).toBe("This is the AI text response.");
  });

  it("should call the OpenRouter API for multimodal prompt and return content on success", async () => {
    const mockApiResponse = {
      choices: [
        {
          message: {
            content: "This is the AI image description.",
          },
        },
      ],
    };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    const prompt = "What is in this image?";
    const imageUrl = "https://example.com/image.jpg";
    const response = await callLlmProvider(prompt, imageUrl);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer test-openrouter-key",
          "Content-Type": "application/json",
          "HTTP-Referer": "THESISAI-PHILIPPINES.VERCEL.APP",
          "X-Title": "THESISAI PHILIPPINES",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-exp:free",
          messages: [
            {
              role: "system",
              content: "You are a helpful academic assistant.",
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt,
                },
                {
                  type: "image_url",
                  image_url: { url: imageUrl },
                },
              ],
            },
          ],
        }),
      }),
    );
    expect(response).toBe("This is the AI image description.");
  });

  it("should throw an error if the API key is not set", async () => {
    delete process.env.OPENROUTER_API_KEY;
    const prompt = "This will fail";

    await expect(callLlmProvider(prompt)).rejects.toThrow(
      "OPENROUTER_API_KEY is not set in environment variables.",
    );
  });

  it("should throw an error if the API call fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Internal Server Error"),
    });
    const prompt = "This will also fail";

    await expect(callLlmProvider(prompt)).rejects.toThrow(
      "OpenRouter API request failed with status 500: Internal Server Error",
    );
  });
});
