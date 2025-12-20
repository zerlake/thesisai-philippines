import { describe, it, expect, beforeAll, vi } from 'vitest';

const API_URL = 'http://localhost:3000/api/auth/demo-login';

const DEMO_ACCOUNTS = [
  {
    name: 'Student',
    email: 'demo-student@thesis.ai',
    password: 'demo123456',
    role: 'student',
    id: '6e4c887c-6d11-4c8a-bf7b-eb94f562b9b7',
  },
  {
    name: 'Advisor',
    email: 'demo-advisor@thesis.ai',
    password: 'demo123456',
    role: 'advisor',
    id: 'ff79d401-5614-4de8-9f17-bc920f360dcf',
  },
  {
    name: 'Critic',
    email: 'demo-critic@thesis.ai',
    password: 'demo123456',
    role: 'critic',
    id: '14a7ff7d-c6d2-4b27-ace1-32237ac28e02',
  },
  {
    name: 'Admin',
    email: 'demo-admin@thesis.ai',
    password: 'demo123456',
    role: 'admin',
    id: '7f22dff0-b8a9-4e08-835f-2a79dba9e6f7',
  },
];

describe('Demo Login API', () => {
  describe('GET /api/auth/demo-login - Health Check', () => {
    it('should return health status and available demo accounts', async () => {
      const response = await fetch(API_URL, { method: 'GET' });
      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data).toHaveProperty('status', 'healthy');
      expect(data).toHaveProperty('demoAvailable');
      expect(data).toHaveProperty('demoAccounts');
      expect(Array.isArray(data.demoAccounts)).toBe(true);
      expect(data.demoAccounts.length).toBe(4);
    });
  });

  describe('POST /api/auth/demo-login - Login for all roles', () => {
    DEMO_ACCOUNTS.forEach((account) => {
      it(`should successfully login ${account.name} (${account.email})`, async () => {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: account.email,
            password: account.password,
          }),
        });

        expect(response.ok).toBe(true);
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data).toHaveProperty('success', true);
        expect(data).toHaveProperty('session');

        const session = data.session;
        expect(session).toHaveProperty('access_token');
        expect(session).toHaveProperty('refresh_token');
        expect(session).toHaveProperty('user');

        const user = session.user;
        expect(user.id).toBe(account.id);
        expect(user.email).toBe(account.email);
      });
    });
  });

  describe('POST /api/auth/demo-login - Error Handling', () => {
    it('should return 400 error for missing email and password', async () => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });

    it('should handle invalid password gracefully', async () => {
      // Note: The API may return 200 with an error message instead of 401
      // This test verifies the behavior works as designed
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo-student@thesis.ai',
          password: 'wrongpassword',
        }),
      });

      // API may return 200 or 401, but should have error field
      const data = await response.json();
      expect(data).toBeTruthy();
      // Either has error field or error in response
      expect(response.status >= 400 || data.error).toBeTruthy();
    });

    it('should handle non-existent user gracefully', async () => {
      // Note: The API may return 200 with an error message instead of 401
      // This test verifies the behavior works as designed
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@thesis.ai',
          password: 'demo123456',
        }),
      });

      // API may return 200 or 401, but should have error or failed authentication
      const data = await response.json();
      expect(data).toBeTruthy();
      // Either has error field or failed authentication
      expect(response.status >= 400 || data.error).toBeTruthy();
    });
  });

  describe('Session Data Validation', () => {
    it('should return valid session tokens for all roles', async () => {
      for (const account of DEMO_ACCOUNTS) {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: account.email,
            password: account.password,
          }),
        });

        expect(response.ok).toBe(true);

        const data = await response.json();
        const session = data.session;

        // Validate access token format (JWT)
        expect(session.access_token).toBeTruthy();
        expect(typeof session.access_token).toBe('string');
        const accessTokenParts = session.access_token.split('.');
        expect(accessTokenParts.length).toBe(3); // JWT has 3 parts

        // Validate refresh token
        expect(session.refresh_token).toBeTruthy();
        expect(typeof session.refresh_token).toBe('string');

        // Validate user metadata
        expect(session.user).toBeTruthy();
        expect(session.user.email).toBe(account.email);
        expect(session.user.id).toBe(account.id);

        // Validate session expiration
        expect(session.expires_in).toBeGreaterThan(0);
      }
    });
  });
});
