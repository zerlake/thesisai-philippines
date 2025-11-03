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
        if (userMessage && userMessage.content.includes('test findings')) {
          return Promise.resolve({
            choices: [{
              message: {
                content: JSON.stringify({
                  summary: "Summary of test findings.",
                  conclusion: "Conclusion based on test findings.",
                  recommendations: "Recommendations based on test findings."
                }),
              },
            }],
          });
        }
        return Promise.resolve({
          choices: [{
            message: {
              content: JSON.stringify({
                summary: "Default summary.",
                conclusion: "Default conclusion.",
                recommendations: "Default recommendations."
              }),
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
  const mockRequest = new Request('http://localhost/generate-conclusion', {
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

Deno.test("generate-conclusion: should return a generated conclusion", async () => {
  const response = await simulateRequest({ findings: "This is some test findings." });
  const conclusionData = await response.json();
  assertEquals(response.status, 200);
  assertEquals(conclusionData.summary, "Summary of test findings.");
  assertEquals(conclusionData.conclusion, "Conclusion based on test findings.");
  assertEquals(conclusionData.recommendations, "Recommendations based on test findings.");
});

Deno.test("generate-conclusion: should return 400 if findings are missing", async () => {
  const response = await simulateRequest({});
  const { error } = await response.json();
  assertEquals(response.status, 400);
  assertEquals(error, "Research findings are required");
});

Deno.test("generate-conclusion: should return 500 if authorization header is missing", async () => {
  const response = await simulateRequest({ findings: "Some findings" }, { 'Authorization': '' });
  const { error } = await response.json();
  assertEquals(response.status, 500); // Supabase auth error will result in 500
  assert(error.includes('Missing authorization header'));
});

Deno.test("generate-conclusion: should return 500 if OpenRouter API fails", async () => {
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

  const response = await simulateRequest({ findings: "Some findings" });
  const { error } = await response.json();
  assertEquals(response.status, 500);
  assert(error.includes('OpenRouter API error'));

  // Restore the original mock
  // @ts-ignore
  stub(globalThis, 'getOpenRouterClient', originalOpenRouterClient);
});
