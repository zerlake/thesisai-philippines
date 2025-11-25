// src/tests/integration/topic-idea-generator.integration.test.ts
import { NextRequest, NextResponse } from 'next/server';
import { POST } from '@/app/api/generate-topic-ideas/route'; // Assuming your API route POST handler is exported
import { verify } from 'jsonwebtoken';

// Mock environment variables for testing purposes
// IMPORTANT: For actual integration tests hitting live services,
// these should be configured in your test runner's environment
// or a dedicated .env.test.local file.
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_TEST_SUPABASE_URL';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_TEST_SUPABASE_SERVICE_ROLE_KEY';
process.env.PUTER_API_KEY = process.env.PUTER_API_KEY || 'YOUR_TEST_PUTER_API_KEY';
process.env.PUTER_API_ENDPOINT = process.env.PUTER_API_ENDPOINT || 'https://api.puter.com/v1/ai/chat';
process.env.NEXT_PUBLIC_APP_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000';
process.env.NEXT_PUBLIC_VERCEL_URL = process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000';

// Mock Supabase client for testing (if not hitting actual Supabase)
// For true integration, you'd ensure a test Supabase project is running.
// If you want to mock Supabase calls *within* the API route handler,
// you would need to adjust how createServerSupabaseClient is mocked.
// For now, we assume createServerSupabaseClient uses the mocked env vars.

// Helper to generate a dummy JWT for a test user
// In a real scenario, you would log in a test user and obtain a valid JWT.
const generateTestJwt = (userId: string) => {
  // Use a secret key that matches your Supabase setup for local testing
  // In production, Supabase generates the JWTs.
  const jwtSecret = process.env.SUPABASE_JWT_SECRET || 'super-secret-jwt-key'; // Replace with your actual JWT secret for local testing
  return verify({ sub: userId, email: `${userId}@example.com` }, jwtSecret, { expiresIn: '1h' });
};

describe('API Integration Test: generate-topic-ideas', () => {
  let testUserId: string;
  let testUserJwt: string;

  // Before all tests, set up a test user ID and JWT
  beforeAll(() => {
    // This UUID should ideally be for a test user in your Supabase project
    // or a dynamically created test user.
    testUserId = 'e207d57c-17e4-4d8b-96d5-a7b3b9b4b001'; // Replace with a valid test user ID
    // For a real integration test, you might use Playwright to log in and capture the JWT
    // For this example, we generate a dummy JWT. Ensure your Supabase functions
    // accept such a JWT for local testing, or provide a real one.
    testUserJwt = generateTestJwt(testUserId);
  });

  it('should generate topic ideas for an authenticated user with valid input', async () => {
    // Simulate a request to the API route
    const request = new NextRequest('http://localhost:3000/api/generate-topic-ideas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testUserJwt}`,
      },
      body: JSON.stringify({ field: 'Computer Science' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('topicIdeas');
    expect(Array.isArray(body.topicIdeas)).toBe(true);
    expect(body.topicIdeas.length).toBeGreaterThan(0); // Expect at least one idea
    expect(body.topicIdeas[0]).toHaveProperty('title');
    expect(body.topicIdeas[0]).toHaveProperty('description');
  });

  it('should return 400 if field is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/generate-topic-ideas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testUserJwt}`,
      },
      body: JSON.stringify({}), // Missing 'field'
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('error', 'Field of study is required');
  });

  it('should return 401 if user is unauthenticated', async () => {
    const request = new NextRequest('http://localhost:3000/api/generate-topic-ideas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No Authorization header
      },
      body: JSON.stringify({ field: 'History' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toHaveProperty('error', 'Authentication required');
  });
});
