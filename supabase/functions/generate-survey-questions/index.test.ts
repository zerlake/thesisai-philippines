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
        if (userMessage && userMessage.content.includes('test topic')) {
          return Promise.resolve({
            choices: [{
              message: {
                content: `{"questions": ["Mock Survey Question 1 for test topic?", "Mock Survey Question 2 for test topic?"]}`,
              },
            }],
          });
        }
        return Promise.resolve({
          choices: [{
            message: {
              content: JSON.stringify({
                questions: [
                  "Default Survey Question 1?",
                  "Default Survey Question 2?"
                ]
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
  const mockRequest = new Request('http://localhost/generate-survey-questions', {
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

Deno.test("generate-survey-questions: should return generated questions", async () => {
  const response = await simulateRequest({ topic: "This is a test topic.", questionType: "Likert Scale" });
  const questionData = await response.json();
  assertEquals(response.status, 200);
  assertEquals(questionData.questions.length, 2);
  assertEquals(questionData.questions[0], "Mock Survey Question 1 for test topic?");
});

Deno.test("generate-survey-questions: should return 400 if topic is missing", async () => {
  const response = await simulateRequest({ questionType: "Likert Scale" });
  const { error } = await response.json();
  assertEquals(response.status, 400);
  assertEquals(error, "Topic and question type are required");
});

Deno.test("generate-survey-questions: should return 400 if questionType is missing", async () => {
  const response = await simulateRequest({ topic: "Some topic" });
  const { error } = await response.json();
  assertEquals(response.status, 400);
  assertEquals(error, "Topic and question type are required");
});

Deno.test("generate-survey-questions: should return 500 if authorization header is missing", async () => {
  const response = await simulateRequest({ topic: "Some topic", questionType: "Likert Scale" }, { 'Authorization': '' });
  const { error } = await response.json();
  assertEquals(response.status, 500); // Supabase auth error will result in 500
  assert(error.includes('Missing authorization header'));
});

Deno.test("generate-survey-questions: should return 500 if OpenRouter API fails", async () => {
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

  const response = await simulateRequest({ topic: "Some topic", questionType: "Likert Scale" });
  const { error } = await response.json();
  assertEquals(response.status, 500);
  assert(error.includes('OpenRouter API error'));

  // Restore the original mock
  // @ts-ignore
  stub(globalThis, 'getOpenRouterClient', originalOpenRouterClient);
});
