globalThis.__DENO_TEST__ = true;
import { createClient } from "npm:@supabase/supabase-js";
import { assert, assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { stub } from "https://deno.land/std@0.190.0/testing/mock.ts";

// Mock the global fetch API
stub(globalThis, 'fetch', () => Promise.resolve(new Response(JSON.stringify({}), { status: 200 })));

import { handler } from "./index.ts"; // Import the exported handler

// Mock the Deno.env.get function for consistent environment variables
const mockDenoEnv = (key: string) => {
  switch (key) {
    case 'SUPABASE_URL': return 'http://mock-supabase-url';
    case 'SUPABASE_SERVICE_ROLE_KEY': return 'mock-service-role-key';
    case 'SUPABASE_ANON_KEY': return 'mock-anon-key';
    default: return undefined;
  }
};

// Mock the createClient function from Supabase
const mockCreateClient = () => ({
  auth: {
    getUser: () => Promise.resolve({ data: { user: { id: 'mock-user-id' } } }),
  },
  from: () => ({
    insert: () => Promise.resolve({ error: null }),
  }),
});

// Mock the getOpenRouterClient function
const mockOpenRouterClient = () => ({
  chat: {
    completions: {
      create: ({ messages }: { messages: Array<{ role: string; content: string }> }) => {
        const userMessage = messages.find(m => m.role === 'user');
        if (userMessage && userMessage.content.includes('test chapter content')) {
          return Promise.resolve({
            choices: [{
              message: {
                content: `[
                  {
                    "title": "Mock Slide 1 Title",
                    "bulletPoints": ["Bullet 1", "Bullet 2"],
                    "speakerNotes": "Speaker notes for slide 1."
                  },
                  {
                    "title": "Mock Slide 2 Title",
                    "bulletPoints": ["Bullet A", "Bullet B"],
                    "speakerNotes": "Speaker notes for slide 2."
                  }
                ]`,
              },
            }],
          });
        }
        return Promise.resolve({
          choices: [{
            message: {
              content: JSON.stringify([
                {
                  title: "Default Slide Title",
                  bulletPoints: ["Default Bullet 1", "Default Bullet 2"],
                  speakerNotes: "Default speaker notes."
                }
              ]),
            },
          }],
        });
      },
    },
  },
});

// Stub Deno.env.get and createClient globally for the test file
stub(Deno.env, 'get', mockDenoEnv);

// Stub createClient from esm.sh/@supabase/supabase-js
// @ts-ignore
stub(globalThis, 'createClient', mockCreateClient);



// Helper to simulate a request to the Deno serve function
async function simulateRequest(body: any, headers: Record<string, string> = {}) {
  const mockRequest = new Request('http://localhost/generate-presentation-slides', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer mock-jwt',
      ...headers,
    },
    body: JSON.stringify(body),
  });

  return handler(mockRequest);
}

Deno.test("generate-presentation-slides: should return generated slides", async () => {
  const response = await simulateRequest({ chapterContent: "This is some test chapter content." });
  const { slides } = await response.json();
  assertEquals(response.status, 200);
  assertEquals(slides.length, 2);
  assertEquals(slides[0].title, "Mock Slide 1 Title");
});

Deno.test("generate-presentation-slides: should return 400 if chapterContent is missing", async () => {
  const response = await simulateRequest({});
  const { error } = await response.json();
  assertEquals(response.status, 400);
  assertEquals(error, "Chapter content is required");
});

Deno.test("generate-presentation-slides: should return 500 if authorization header is missing", async () => {
  const response = await simulateRequest({ chapterContent: "Some content" }, { 'Authorization': '' });
  const { error } = await response.json();
  assertEquals(response.status, 500); // Supabase auth error will result in 500
  assert(error.includes('Missing authorization header'));
});

Deno.test("generate-presentation-slides: should return 500 if OpenRouter API fails", async () => {
  // Temporarily override the mockOpenRouterClient to simulate an API failure
  const originalOpenRouterClient = mockOpenRouterClient;
  // @ts-ignore
  stub(globalThis, 'getOpenRouterClient', () => ({
    chat: {
      completions: {
        create: () => Promise.reject(new Error('OpenRouter API error')),
      },
    },
  }));

  const response = await simulateRequest({ chapterContent: "Some content" });
  const { error } = await response.json();
  assertEquals(response.status, 500);
  assert(error.includes('OpenRouter API error'));

  // Restore the original mock
  // @ts-ignore
  stub(globalThis, 'getOpenRouterClient', originalOpenRouterClient);
});
