// src/tests/api-client.test.ts
import { ApiClient } from '@/lib/api-client';
import {
  APIError,
  AuthenticationError,
  NetworkError,
  TimeoutError,
  RateLimitError,
  ValidationError,
  PayloadError,
  AIError,
  IntegrationError,
  ConflictError,
  QuotaExceededError,
} from '@/lib/errors';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// Mock API endpoint
const API_BASE_URL = 'http://localhost:3000/api';

const server = setupServer(
  rest.get(`${API_BASE_URL}/success`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ message: 'Success!' }));
  }),
  rest.post(`${API_BASE_URL}/data`, (req, res, ctx) => {
    return res(ctx.status(201), ctx.json(req.body));
  }),
  rest.get(`${API_BASE_URL}/auth-error`, (req, res, ctx) => {
    return res(ctx.status(401), ctx.json({ error: 'Unauthorized' }));
  }),
  rest.get(`${API_BASE_URL}/validation-error`, (req, res, ctx) => {
    return res(ctx.status(400), ctx.json({ error: 'Invalid input' }));
  }),
  rest.get(`${API_BASE_URL}/not-found`, (req, res, ctx) => {
    return res(ctx.status(404), ctx.json({ error: 'Resource not found' }));
  }),
  rest.get(`${API_BASE_URL}/server-error`, (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ error: 'Internal Server Error' }));
  }),
  rest.get(`${API_BASE_URL}/rate-limit`, (req, res, ctx) => {
    return res(ctx.status(429), ctx.json({ error: 'Too many requests' }), ctx.set('Retry-After', '60'));
  }),
  rest.get(`${API_BASE_URL}/timeout`, (req, res, ctx) => {
    // Simulate a timeout by not responding
    return new Promise(() => {}); // Never resolve to simulate hang
  }),
  rest.get(`${API_BASE_URL}/network-error`, (req, res, ctx) => {
    // Simulate a network error
    return res.networkError('Failed to connect');
  }),
  rest.get(`${API_BASE_URL}/ai-error`, (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ error: 'AI service failed', name: 'AIError' }));
  }),
  rest.get(`${API_BASE_URL}/integration-error`, (req, res, ctx) => {
    return res(ctx.status(503), ctx.json({ error: 'Third-party integration failed', name: 'IntegrationError' }));
  }),
  rest.get(`${API_BASE_URL}/conflict-error`, (req, res, ctx) => {
    return res(ctx.status(409), ctx.json({ error: 'Resource conflict', name: 'ConflictError' }));
  }),
  rest.get(`${API_BASE_URL}/quota-exceeded`, (req, res, ctx) => {
    return res(ctx.status(429), ctx.json({ error: 'Quota exceeded', name: 'QuotaExceededError' }));
  }),
);

describe('ApiClient', () => {
  let apiClient: ApiClient;

  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    // Re-initialize ApiClient to clear any interceptors or settings
    apiClient = new ApiClient({ baseURL: API_BASE_URL });
  });
  afterAll(() => server.close());

  beforeEach(() => {
    apiClient = new ApiClient({ baseURL: API_BASE_URL });
  });

  it('should make a successful GET request', async () => {
    const response = await apiClient.get('/success');
    expect(response).toEqual({ message: 'Success!' });
  });

  it('should make a successful POST request with data', async () => {
    const payload = { name: 'Test', value: 123 };
    const response = await apiClient.post('/data', payload);
    expect(response).toEqual(payload);
  });

  it('should handle 401 Unauthorized error', async () => {
    await expect(apiClient.get('/auth-error')).rejects.toBeInstanceOf(AuthenticationError);
    await expect(apiClient.get('/auth-error')).rejects.toHaveProperty('message', 'Unauthorized');
  });

  it('should handle 400 Bad Request error', async () => {
    await expect(apiClient.get('/validation-error')).rejects.toBeInstanceOf(ValidationError);
    await expect(apiClient.get('/validation-error')).rejects.toHaveProperty('message', 'Invalid input');
  });

  it('should handle 404 Not Found error', async () => {
    await expect(apiClient.get('/not-found')).rejects.toBeInstanceOf(APIError);
    await expect(apiClient.get('/not-found')).rejects.toHaveProperty('message', 'Resource not found');
    await expect(apiClient.get('/not-found')).rejects.toHaveProperty('status', 404);
  });

  it('should handle 500 Internal Server Error', async () => {
    await expect(apiClient.get('/server-error')).rejects.toBeInstanceOf(APIError);
    await expect(apiClient.get('/server-error')).rejects.toHaveProperty('message', 'Internal Server Error');
    await expect(apiClient.get('/server-error')).rejects.toHaveProperty('status', 500);
  });

  it('should handle 429 Rate Limit Exceeded error', async () => {
    await expect(apiClient.get('/rate-limit')).rejects.toBeInstanceOf(RateLimitError);
    await expect(apiClient.get('/rate-limit')).rejects.toHaveProperty('message', 'Too many requests');
    await expect(apiClient.get('/rate-limit')).rejects.toHaveProperty('retryAfter', 60);
  });

  it('should handle AIError from response body', async () => {
    await expect(apiClient.get('/ai-error')).rejects.toBeInstanceOf(AIError);
    await expect(apiClient.get('/ai-error')).rejects.toHaveProperty('message', 'AI service failed');
  });

  it('should handle IntegrationError from response body', async () => {
    await expect(apiClient.get('/integration-error')).rejects.toBeInstanceOf(IntegrationError);
    await expect(apiClient.get('/integration-error')).rejects.toHaveProperty('message', 'Third-party integration failed');
  });

  it('should handle ConflictError from response body', async () => {
    await expect(apiClient.get('/conflict-error')).rejects.toBeInstanceOf(ConflictError);
    await expect(apiClient.get('/conflict-error')).rejects.toHaveProperty('message', 'Resource conflict');
  });

  it('should handle QuotaExceededError from response body (429 status)', async () => {
    await expect(apiClient.get('/quota-exceeded')).rejects.toBeInstanceOf(QuotaExceededError);
    await expect(apiClient.get('/quota-exceeded')).rejects.toHaveProperty('message', 'Quota exceeded');
  });

  // Note: Mocking true network errors and timeouts with MSW can be tricky
  // For actual network errors, you might need to mock fetch globally or use different tools.
  // The current setup allows for simulating network conditions by letting the request hang.
  it('should handle network error (simulated)', async () => {
    server.use(
      rest.get(`${API_BASE_URL}/network-error`, (req, res) => {
        return res.networkError('Failed to fetch');
      })
    );
    await expect(apiClient.get('/network-error')).rejects.toBeInstanceOf(NetworkError);
    await expect(apiClient.get('/network-error')).rejects.toHaveProperty('message');
  });
  
  it('should handle timeout error (simulated)', async () => {
    // Increase timeout for this specific test
    const customApiClient = new ApiClient({ baseURL: API_BASE_URL, timeout: 100 });
    
    // MSW doesn't natively support timeouts, so we let the request hang.
    // The fetch API's AbortController is used by ApiClient to enforce timeouts.
    await expect(customApiClient.get('/timeout')).rejects.toBeInstanceOf(TimeoutError);
    await expect(customApiClient.get('/timeout')).rejects.toHaveProperty('message', 'The request timed out.');
  });
});
