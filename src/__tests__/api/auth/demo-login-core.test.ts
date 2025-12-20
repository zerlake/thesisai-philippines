import { describe, it, expect } from 'vitest';

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

describe('Demo Login API - Core Functionality', () => {
  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await fetch(API_URL, { method: 'GET' });
      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data).toHaveProperty('status', 'healthy');
      expect(data).toHaveProperty('demoAvailable');
      expect(Array.isArray(data.demoAccounts)).toBe(true);
    });
  });

  describe('Demo Account Logins', () => {
    DEMO_ACCOUNTS.forEach((account) => {
      it(`${account.name} can login successfully`, async () => {
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
        expect(data.success).toBe(true);
        expect(data.session).toBeDefined();
        expect(data.session.user.id).toBe(account.id);
        expect(data.session.user.email).toBe(account.email);
        expect(data.session.access_token).toBeDefined();
        expect(data.session.refresh_token).toBeDefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('should require email and password', async () => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });
});
