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
        if (userMessage && userMessage.content.includes('test sentence')) {
          return Promise.resolve({
            choices: [{
              message: {
                content: JSON.stringify({
                  inText: "(MockAuthor, 2023)",
                  reference: "MockAuthor, A. (2023). Mock Title. Mock Publisher."
                }),
              }
            }]
          });
        };
        return Promise.resolve({
          choices: [{
            message: {
              content: JSON.stringify({
                inText: "(DefaultAuthor, 2022)",
                reference: "DefaultAuthor, D. (2022). Default Title. Default Publisher."
              }),
            }
            }]
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
  const mockRequest = new Request('http://localhost/generate-citation-from-source', {
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

Deno.test("generate-citation-from-source: should return a generated citation", async () => {
  const response = await simulateRequest({ sentence: "This is a test sentence.", sourceUrl: "http://example.com" });
  const citationData = await response.json();
  assertEquals(response.status, 200);
  assertEquals(citationData.inText, "(MockAuthor, 2023)");
  assertEquals(citationData.reference, "MockAuthor, A. (2023). Mock Title. Mock Publisher.");
});

Deno.test("generate-citation-from-source: should return 400 if sentence is missing", async () => {
  const response = await simulateRequest({ sourceUrl: "http://example.com" });
  const { error } = await response.json();
  assertEquals(response.status, 400);
  assertEquals(error, "Sentence and sourceUrl are required");
});

Deno.test("generate-citation-from-source: should return 400 if sourceUrl is missing", async () => {
  const response = await simulateRequest({ sentence: "This is a test sentence." });
  const { error } = await response.json();
  assertEquals(response.status, 400);
  assertEquals(error, "Sentence and sourceUrl are required");
});

Deno.test("generate-citation-from-source: should return 500 if authorization header is missing", async () => {
  const response = await simulateRequest({ sentence: "Some content", sourceUrl: "http://example.com" }, { 'Authorization': '' });
  const { error } = await response.json();
  assertEquals(response.status, 500); // Supabase auth error will result in 500
  assert(error.includes('Missing authorization header'));
});

Deno.test("generate-citation-from-source: should return 500 if OpenRouter API fails", async () => {
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

  const response = await simulateRequest({ sentence: "Some content", sourceUrl: "http://example.com" });
  const { error } = await response.json();
  assertEquals(response.status, 500);
  assert(error.includes('OpenRouter API error'));

  // Restore the original mock
  // @ts-ignore
  stub(globalThis, 'getOpenRouterClient', originalOpenRouterClient);
});
