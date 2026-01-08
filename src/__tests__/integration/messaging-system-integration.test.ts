/**
 * Messaging System Integration Tests
 * Tests for student-advisor and student-critic communication flows
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as GetMessage } from '@/app/api/messages/get/route';
import { POST as PostMessage } from '@/app/api/messages/send/route';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Mock environment variables before anything else
const originalEnv = process.env;

beforeAll(() => {
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    INTERNAL_API_KEY: 'test-api-key'
  };
});

afterAll(() => {
  process.env = originalEnv;
});

// Mock Supabase client
vi.mock('@supabase/supabase-js', async () => {
  const actual = await vi.importActual('@supabase/supabase-js');
  return {
    ...actual,
    createClient: vi.fn(() => ({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          or: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null }))
            })),
            order: vi.fn(() => Promise.resolve({ data: [], error: null }))
          })),
          in: vi.fn(() => ({
            in: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({ data: [{ id: 'test-message-1' }], error: null }))
        }))
      })),
    }))
  };
});

// Mock the server Supabase client
vi.mock('@/lib/supabase/server', async () => {
  const actual = await vi.importActual('@/lib/supabase/server');
  return {
    ...actual,
    createServerSupabaseClient: vi.fn(() => ({
      auth: {
        getSession: vi.fn(() => Promise.resolve({ data: { session: { user: { id: 'test-user-123' } } }, error: null }))
      }
    }))
  };
});

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Messaging System Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('Student-Advisor Communication', () => {
    it('should allow student to send message to advisor', async () => {
      // Mock successful session - make sure the session user ID matches the sender ID
      (createServerSupabaseClient as any).mockReturnValue({
        auth: {
          getSession: vi.fn(() => Promise.resolve({
            data: {
              session: {
                user: {
                  id: '12345678-1234-1234-1234-123456789abc' // This must match the senderId
                }
              }
            },
            error: null
          }))
        }
      });

      // Mock successful message insertion
      const mockSupabase = {
        from: vi.fn(() => ({
          insert: vi.fn(() => ({
            select: vi.fn(() => Promise.resolve({
              data: [{
                id: 'msg-1',
                sender_id: '12345678-1234-1234-1234-123456789abc',
                recipient_id: '456789ab-4567-4567-4567-123456789def',
                message: 'Hello advisor!',
                sender_role: 'student',
                created_at: new Date().toISOString()
              }],
              error: null
            }))
          }))
        }))
      };
      (createClient as any).mockReturnValue(mockSupabase);

      // Mock successful fetch for email notification
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const request = new NextRequest('http://localhost:3000/api/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          senderId: '12345678-1234-1234-1234-123456789abc',
          senderRole: 'student',
          recipientId: '456789ab-4567-4567-4567-123456789def',
          message: 'Hello advisor!'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await PostMessage(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toBeDefined();
      expect(result.data[0].sender_id).toBe('12345678-1234-1234-1234-123456789abc');
      expect(result.data[0].recipient_id).toBe('456789ab-4567-4567-4567-123456789def');
      expect(result.data[0].message).toBe('Hello advisor!');
      expect(result.data[0].sender_role).toBe('student');
    });

    it('should allow advisor to send message to student', async () => {
      // Mock successful session - make sure the session user ID matches the sender ID
      (createServerSupabaseClient as any).mockReturnValue({
        auth: {
          getSession: vi.fn(() => Promise.resolve({
            data: {
              session: {
                user: {
                  id: '456789ab-4567-4567-4567-123456789def' // This must match the senderId
                }
              }
            },
            error: null
          }))
        }
      });

      // Mock successful message insertion
      const mockSupabase = {
        from: vi.fn(() => ({
          insert: vi.fn(() => ({
            select: vi.fn(() => Promise.resolve({
              data: [{
                id: 'msg-2',
                sender_id: '456789ab-4567-4567-4567-123456789def',
                recipient_id: '12345678-1234-1234-1234-123456789abc',
                message: 'Hello student!',
                sender_role: 'advisor',
                created_at: new Date().toISOString()
              }],
              error: null
            }))
          }))
        }))
      };
      (createClient as any).mockReturnValue(mockSupabase);

      // Mock successful fetch for email notification
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const request = new NextRequest('http://localhost:3000/api/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          senderId: '456789ab-4567-4567-4567-123456789def',
          senderRole: 'advisor',
          recipientId: '12345678-1234-1234-1234-123456789abc',
          message: 'Hello student!'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await PostMessage(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toBeDefined();
      expect(result.data[0].sender_id).toBe('456789ab-4567-4567-4567-123456789def');
      expect(result.data[0].recipient_id).toBe('12345678-1234-1234-1234-123456789abc');
      expect(result.data[0].message).toBe('Hello student!');
      expect(result.data[0].sender_role).toBe('advisor');
    });

    it('should retrieve messages between student and advisor', async () => {
      // Mock messages data
      const mockMessages = [
        {
          id: 'msg-1',
          sender_id: '12345678-1234-1234-1234-123456789abc',
          recipient_id: '456789ab-4567-4567-4567-123456789def',
          message: 'Hello advisor!',
          sender_role: 'student',
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'msg-2',
          sender_id: '456789ab-4567-4567-4567-123456789def',
          recipient_id: '12345678-1234-1234-1234-123456789abc',
          message: 'Hello student!',
          sender_role: 'advisor',
          created_at: new Date(Date.now() - 1800000).toISOString()
        }
      ];

      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            or: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ 
                data: mockMessages, 
                error: null 
              }))
            }))
          }))
        }))
      };
      (createClient as any).mockReturnValue(mockSupabase);

      const request = new NextRequest('http://localhost:3000/api/messages/get?userId=12345678-1234-1234-1234-123456789abc', {
        method: 'GET'
      });

      const response = await GetMessage(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].sender_id).toBe('12345678-1234-1234-1234-123456789abc');
      expect(result.data[1].sender_id).toBe('456789ab-4567-4567-4567-123456789def');
    });
  });

  describe('Student-Critic Communication', () => {
    it('should allow student to send message to critic', async () => {
      // Mock successful session - make sure the session user ID matches the sender ID
      (createServerSupabaseClient as any).mockReturnValue({
        auth: {
          getSession: vi.fn(() => Promise.resolve({
            data: {
              session: {
                user: {
                  id: '12345678-1234-1234-1234-123456789abc' // This must match the senderId
                }
              }
            },
            error: null
          }))
        }
      });

      // Mock successful message insertion and profile lookup for email notifications
      const mockSupabase = {
        from: vi.fn((table) => {
          if (table === 'advisor_student_messages') {
            return {
              insert: vi.fn(() => ({
                select: vi.fn(() => Promise.resolve({
                  data: [{
                    id: 'msg-3',
                    sender_id: '12345678-1234-1234-1234-123456789abc',
                    recipient_id: '789def01-7890-7890-7890-123456789ghi',
                    message: 'Hello critic!',
                    sender_role: 'student',
                    created_at: new Date().toISOString()
                  }],
                  error: null
                }))
              }))
            };
          } else if (table === 'profiles') {
            return {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  single: vi.fn(() => Promise.resolve({
                    data: {
                      email: 'critic@example.com',
                      full_name: 'Critic User',
                      name: 'Critic User',
                      role: 'critic'
                    },
                    error: null
                  }))
                })),
                or: vi.fn(() => ({
                  order: vi.fn(() => Promise.resolve({ data: [], error: null }))
                }))
              }))
            };
          }
          // Default return for other tables
          return {
            select: vi.fn(() => ({
              or: vi.fn(() => ({
                order: vi.fn(() => Promise.resolve({ data: [], error: null }))
              })),
              in: vi.fn(() => ({
                in: vi.fn(() => ({
                  order: vi.fn(() => Promise.resolve({ data: [], error: null }))
                }))
              }))
            })),
            insert: vi.fn(() => ({
              select: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          };
        })
      };
      (createClient as any).mockReturnValue(mockSupabase);

      // Mock successful fetch for email notification
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const request = new NextRequest('http://localhost:3000/api/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          senderId: '12345678-1234-1234-1234-123456789abc',
          senderRole: 'student',
          recipientId: '789def01-7890-7890-7890-123456789ghi',
          message: 'Hello critic!'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await PostMessage(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toBeDefined();
      expect(result.data[0].sender_id).toBe('12345678-1234-1234-1234-123456789abc');
      expect(result.data[0].recipient_id).toBe('789def01-7890-7890-7890-123456789ghi');
      expect(result.data[0].message).toBe('Hello critic!');
      expect(result.data[0].sender_role).toBe('student');
    });

    it('should allow critic to send message to student', async () => {
      // Mock successful session - make sure the session user ID matches the sender ID
      (createServerSupabaseClient as any).mockReturnValue({
        auth: {
          getSession: vi.fn(() => Promise.resolve({
            data: {
              session: {
                user: {
                  id: '789def01-7890-7890-7890-123456789ghi' // This must match the senderId
                }
              }
            },
            error: null
          }))
        }
      });

      // Mock successful message insertion and profile lookup for email notifications
      const mockSupabase = {
        from: vi.fn((table) => {
          if (table === 'advisor_student_messages') {
            return {
              insert: vi.fn(() => ({
                select: vi.fn(() => Promise.resolve({
                  data: [{
                    id: 'msg-4',
                    sender_id: '789def01-7890-7890-7890-123456789ghi',
                    recipient_id: '12345678-1234-1234-1234-123456789abc',
                    message: 'Hello student!',
                    sender_role: 'critic',
                    created_at: new Date().toISOString()
                  }],
                  error: null
                }))
              }))
            };
          } else if (table === 'profiles') {
            return {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  single: vi.fn(() => Promise.resolve({
                    data: {
                      email: 'student@example.com',
                      full_name: 'Student User',
                      name: 'Student User',
                      role: 'student'
                    },
                    error: null
                  }))
                }))
              }))
            };
          }
          return {
            select: vi.fn(() => ({
              or: vi.fn(() => ({
                order: vi.fn(() => Promise.resolve({ data: [], error: null }))
              }))
            }))
          };
        })
      };
      (createClient as any).mockReturnValue(mockSupabase);

      // Mock successful fetch for email notification
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const request = new NextRequest('http://localhost:3000/api/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          senderId: '789def01-7890-7890-7890-123456789ghi',
          senderRole: 'critic',
          recipientId: '12345678-1234-1234-1234-123456789abc',
          message: 'Hello student!'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await PostMessage(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toBeDefined();
      expect(result.data[0].sender_id).toBe('789def01-7890-7890-7890-123456789ghi');
      expect(result.data[0].recipient_id).toBe('12345678-1234-1234-1234-123456789abc');
      expect(result.data[0].message).toBe('Hello student!');
      expect(result.data[0].sender_role).toBe('critic');
    });

    it('should retrieve messages between student and critic', async () => {
      // Mock messages data
      const mockMessages = [
        {
          id: 'msg-3',
          sender_id: '12345678-1234-1234-1234-123456789abc',
          recipient_id: '789def01-7890-7890-7890-123456789ghi',
          message: 'Hello critic!',
          sender_role: 'student',
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'msg-4',
          sender_id: '789def01-7890-7890-7890-123456789ghi',
          recipient_id: '12345678-1234-1234-1234-123456789abc',
          message: 'Hello student!',
          sender_role: 'critic',
          created_at: new Date(Date.now() - 1800000).toISOString()
        }
      ];

      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            or: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ 
                data: mockMessages, 
                error: null 
              }))
            }))
          }))
        }))
      };
      (createClient as any).mockReturnValue(mockSupabase);

      const request = new NextRequest('http://localhost:3000/api/messages/get?userId=12345678-1234-1234-1234-123456789abc', {
        method: 'GET'
      });

      const response = await GetMessage(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].sender_id).toBe('12345678-1234-1234-1234-123456789abc');
      expect(result.data[1].sender_id).toBe('789def01-7890-7890-7890-123456789ghi');
    });
  });

  describe('Security and Validation', () => {
    it('should reject message if senderId does not match authenticated user', async () => {
      // Mock session with different user ID
      (createServerSupabaseClient as any).mockReturnValue({
        auth: {
          getSession: vi.fn(() => Promise.resolve({
            data: {
              session: {
                user: {
                  id: 'different-user-999-1234-5678-9012-abcdef123456'
                }
              }
            },
            error: null
          }))
        }
      });

      const request = new NextRequest('http://localhost:3000/api/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          senderId: '12345678-1234-1234-1234-123456789abc', // Different from authenticated user
          senderRole: 'student',
          recipientId: '456789ab-4567-4567-4567-123456789def',
          message: 'Hello advisor!'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await PostMessage(request);
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.error).toContain('Forbidden');
    });

    it('should reject message with invalid UUIDs', async () => {
      // Mock valid session - use the same ID as the senderId in the request
      (createServerSupabaseClient as any).mockReturnValue({
        auth: {
          getSession: vi.fn(() => Promise.resolve({
            data: {
              session: {
                user: {
                  id: 'invalid-uuid' // This will match the senderId in the request
                }
              }
            },
            error: null
          }))
        }
      });

      const request = new NextRequest('http://localhost:3000/api/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          senderId: 'invalid-uuid', // Invalid UUID format - this matches the authenticated user
          senderRole: 'student',
          recipientId: '456789ab-4567-4567-4567-123456789def',
          message: 'Hello advisor!'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await PostMessage(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('Invalid senderId');
    });

    it('should reject message without required fields', async () => {
      // Mock valid session
      (createServerSupabaseClient as any).mockReturnValue({
        auth: {
          getSession: vi.fn(() => Promise.resolve({
            data: {
              session: {
                user: {
                  id: '12345678-1234-1234-1234-123456789abc'
                }
              }
            },
            error: null
          }))
        }
      });

      const request = new NextRequest('http://localhost:3000/api/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          // Missing required fields
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await PostMessage(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('Missing required fields');
    });

    it('should reject unauthorized requests', async () => {
      // Mock no session
      (createServerSupabaseClient as any).mockReturnValue({
        auth: {
          getSession: vi.fn(() => Promise.resolve({ 
            data: { 
              session: null 
            }, 
            error: null 
          }))
        }
      });

      const request = new NextRequest('http://localhost:3000/api/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          senderId: '12345678-1234-1234-1234-123456789abc',
          senderRole: 'student',
          recipientId: '456789ab-4567-4567-4567-123456789def',
          message: 'Hello advisor!'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await PostMessage(request);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.error).toContain('Unauthorized');
    });
  });

  describe('Email Notifications', () => {
    it('should send email notification when sending message from advisor to student', async () => {
      // Mock successful session - make sure the session user ID matches the sender ID
      (createServerSupabaseClient as any).mockReturnValue({
        auth: {
          getSession: vi.fn(() => Promise.resolve({
            data: {
              session: {
                user: {
                  id: '456789ab-4567-4567-4567-123456789def' // This must match the senderId
                }
              }
            },
            error: null
          }))
        }
      });

      // Mock message insertion
      const mockSupabase = {
        from: vi.fn(() => ({
          insert: vi.fn(() => ({
            select: vi.fn(() => Promise.resolve({
              data: [{
                id: 'msg-5',
                sender_id: '456789ab-4567-4567-4567-123456789def',
                recipient_id: '12345678-1234-1234-1234-123456789abc',
                message: 'Please review your thesis draft',
                sender_role: 'advisor',
                created_at: new Date().toISOString()
              }],
              error: null
            }))
          })),
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({
                data: {
                  email: 'student@example.com',
                  full_name: 'John Student',
                  role: 'student',
                  first_name: 'John',
                  last_name: 'Student'
                },
                error: null
              }))
            }))
          }))
        }))
      };
      (createClient as any).mockReturnValue(mockSupabase);

      // Mock successful fetch for email notification
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const request = new NextRequest('http://localhost:3000/api/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          senderId: '456789ab-4567-4567-4567-123456789def',
          senderRole: 'advisor',
          recipientId: '12345678-1234-1234-1234-123456789abc',
          message: 'Please review your thesis draft'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await PostMessage(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toBeDefined();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/notifications/send-advisor-email'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should send email notification when sending message from critic to student', async () => {
      // Mock successful session - make sure the session user ID matches the sender ID
      (createServerSupabaseClient as any).mockReturnValue({
        auth: {
          getSession: vi.fn(() => Promise.resolve({
            data: {
              session: {
                user: {
                  id: '789def01-7890-7890-7890-123456789ghi' // This must match the senderId
                }
              }
            },
            error: null
          }))
        }
      });

      // Mock message insertion and profile lookup for email notifications
      const mockSupabase = {
        from: vi.fn((table) => {
          if (table === 'advisor_student_messages') {
            return {
              insert: vi.fn(() => ({
                select: vi.fn(() => Promise.resolve({
                  data: [{
                    id: 'msg-6',
                    sender_id: '789def01-7890-7890-7890-123456789ghi',
                    recipient_id: '12345678-1234-1234-1234-123456789abc',
                    message: 'Your feedback is ready',
                    sender_role: 'critic',
                    created_at: new Date().toISOString()
                  }],
                  error: null
                }))
              }))
            };
          } else if (table === 'profiles') {
            return {
              select: vi.fn(() => ({
                eq: vi.fn(() => ({
                  single: vi.fn(() => Promise.resolve({
                    data: {
                      email: 'student@example.com',
                      full_name: 'Student User',
                      name: 'Student User',
                      role: 'student',
                      first_name: 'Student',
                      last_name: 'User'
                    },
                    error: null
                  }))
                }))
              }))
            };
          }
          return {
            select: vi.fn(() => ({
              or: vi.fn(() => ({
                order: vi.fn(() => Promise.resolve({ data: [], error: null }))
              }))
            }))
          };
        })
      };
      (createClient as any).mockReturnValue(mockSupabase);

      // Mock successful fetch for email notification
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const request = new NextRequest('http://localhost:3000/api/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          senderId: '789def01-7890-7890-7890-123456789ghi',
          senderRole: 'critic',
          recipientId: '12345678-1234-1234-1234-123456789abc',
          message: 'Your feedback is ready'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await PostMessage(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data).toBeDefined();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/notifications/send-advisor-email'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully when sending message', async () => {
      // Mock successful session - make sure the session user ID matches the sender ID
      (createServerSupabaseClient as any).mockReturnValue({
        auth: {
          getSession: vi.fn(() => Promise.resolve({
            data: {
              session: {
                user: {
                  id: '12345678-1234-1234-1234-123456789abc' // This must match the senderId
                }
              }
            },
            error: null
          }))
        }
      });

      // Mock database error
      const mockSupabase = {
        from: vi.fn(() => ({
          insert: vi.fn(() => ({
            select: vi.fn(() => Promise.resolve({ 
              data: null, 
              error: { message: 'Database error occurred' } 
            }))
          }))
        }))
      };
      (createClient as any).mockReturnValue(mockSupabase);

      const request = new NextRequest('http://localhost:3000/api/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          senderId: '12345678-1234-1234-1234-123456789abc',
          senderRole: 'student',
          recipientId: '456789ab-4567-4567-4567-123456789def',
          message: 'Hello advisor!'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await PostMessage(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toContain('Database error occurred');
    });

    it('should handle database errors gracefully when retrieving messages', async () => {
      // Mock database error
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            or: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ 
                data: null, 
                error: { message: 'Database error occurred' } 
              }))
            }))
          }))
        }))
      };
      (createClient as any).mockReturnValue(mockSupabase);

      const request = new NextRequest('http://localhost:3000/api/messages/get?userId=student-123', {
        method: 'GET'
      });

      const response = await GetMessage(request);
      const result = await response.json();

      expect(response.status).toBe(200); // Returns 200 with empty data instead of error
      expect(result.data).toHaveLength(0);
      expect(result.error).toContain('Database error occurred');
    });

    it('should handle missing environment variables', async () => {
      // Temporarily clear environment variables
      const originalEnv = process.env;
      process.env = { ...originalEnv };
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      const request = new NextRequest('http://localhost:3000/api/messages/get?userId=student-123', {
        method: 'GET'
      });

      const response = await GetMessage(request);
      const result = await response.json();

      expect(response.status).toBe(200); // Returns 200 with empty data instead of error
      expect(result.data).toHaveLength(0);
      expect(result.error).toBe('Supabase not configured');

      // Restore environment variables
      process.env = originalEnv;
    });
  });
});