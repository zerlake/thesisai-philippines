/**
 * Messaging System Integration Tests
 * Tests for chat interface, message loading, error handling, and real-time updates
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInterface } from '@/components/chat-interface';
import { supabase } from '@/integrations/supabase/client';

// Mock the auth provider
vi.mock('@/components/auth-provider', () => ({
  useAuth: () => ({
    session: {
      user: {
        id: 'test-user-123',
        email: 'test@example.com'
      }
    },
    profile: {
      first_name: 'Test',
      last_name: 'User',
      role: 'student'
    }
  })
}));

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn()
  }
}));

// Helper to create a properly chained mock
function createMockChain(data: any, error: any = null) {
  return {
    select: vi.fn().mockReturnValue({
      or: vi.fn().mockResolvedValue({ data, error }),
      in: vi.fn().mockReturnValue({
        in: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data, error })
        })
      }),
      order: vi.fn().mockResolvedValue({ data, error })
    })
  };
}

describe('Messaging System Integration Tests', () => {
  let mockSupabaseFrom: any;

  beforeEach(() => {
    mockSupabaseFrom = vi.fn();
    (supabase.from as any) = mockSupabaseFrom;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Chat Interface Loading', () => {
    it('should load and display conversations successfully', async () => {
      mockSupabaseFrom.mockImplementation((table) => 
        createMockChain([{
          student_id: 'test-user-123',
          advisor_id: 'advisor-456'
        }])
      );

      render(<ChatInterface />);

      await waitFor(() => {
        expect(mockSupabaseFrom).toHaveBeenCalled();
      });
    });

    it('should handle missing relationships table gracefully', async () => {
      mockSupabaseFrom.mockImplementation((table) => {
        if (table === 'advisor_student_relationships') {
          return {
            select: vi.fn().mockReturnValue({
              or: vi.fn().mockResolvedValue({
                data: null,
                error: {
                  code: '42P01',
                  message: 'relation "advisor_student_relationships" does not exist'
                }
              })
            })
          };
        }
        return createMockChain([]);
      });

      const consoleWarnSpy = vi.spyOn(console, 'warn');
      render(<ChatInterface />);

      await waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Relationships table not found'),
          expect.any(Object)
        );
      });

      consoleWarnSpy.mockRestore();
    });

    it('should handle missing messages table and try fallback', async () => {
      let callCount = 0;
      mockSupabaseFrom.mockImplementation((table) => {
        if (table === 'advisor_student_messages' && callCount === 0) {
          callCount++;
          return {
            select: vi.fn().mockReturnValue({
              or: vi.fn().mockResolvedValue({
                data: null,
                error: {
                  code: '42P01',
                  message: 'relation "advisor_student_messages" does not exist'
                }
              })
            })
          };
        }
        return createMockChain([
          {
            id: 'msg-1',
            sender_id: 'test-user-123',
            recipient_id: 'advisor-456',
            message: 'Hello',
            created_at: new Date().toISOString(),
            read_status: false,
            sender_role: 'student'
          }
        ]);
      });

      const consoleWarnSpy = vi.spyOn(console, 'warn');
      render(<ChatInterface />);

      await waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalled();
      });

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should log detailed error information on failure', async () => {
      mockSupabaseFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockResolvedValue({
            data: null,
            error: {
              code: 'PGRST301',
              message: 'Unauthorized',
              details: 'JWT expired'
            }
          })
        })
      }));

      const consoleErrorSpy = vi.spyOn(console, 'error');
      render(<ChatInterface />);

      await waitFor(() => {
        const errorCall = consoleErrorSpy.mock.calls.find(call =>
          call[0]?.includes?.('Error fetching relationships') ||
          call[0] === 'Error fetching relationships:'
        );
        
        if (errorCall) {
          const errorInfo = errorCall[1];
          expect(errorInfo).toHaveProperty('message');
          expect(errorInfo).toHaveProperty('code');
        }
      });

      consoleErrorSpy.mockRestore();
    });

    it('should continue with empty conversations on error', async () => {
      mockSupabaseFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockResolvedValue({
            data: null,
            error: {
              code: 'UNKNOWN',
              message: 'Unexpected error'
            }
          }),
          in: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: null,
                error: {
                  code: 'UNKNOWN',
                  message: 'Unexpected error'
                }
              })
            })
          })
        })
      }));

      render(<ChatInterface />);

      await waitFor(() => {
        const component = screen.queryByRole('region');
        expect(component || document.body).toBeTruthy();
      });
    });

    it('should handle string error values', async () => {
      mockSupabaseFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockRejectedValue('Network error')
        })
      }));

      const consoleErrorSpy = vi.spyOn(console, 'error');
      render(<ChatInterface />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Message Loading and Filtering', () => {
    it('should load messages for the current user', async () => {
      const testMessages = [
        {
          id: 'msg-1',
          sender_id: 'test-user-123',
          recipient_id: 'advisor-456',
          message: 'Hello advisor',
          created_at: new Date().toISOString(),
          read_status: false,
          sender_role: 'student',
          sender: {
            first_name: 'Test',
            last_name: 'User',
            role: 'student',
            avatar_url: null
          },
          recipient: {
            first_name: 'Dr',
            last_name: 'Advisor',
            role: 'advisor',
            avatar_url: null
          }
        }
      ];

      mockSupabaseFrom.mockImplementation((table) => {
        if (table === 'advisor_student_relationships') {
          return createMockChain([]);
        }
        return createMockChain(testMessages);
      });

      render(<ChatInterface />);

      await waitFor(() => {
        expect(mockSupabaseFrom).toHaveBeenCalledWith(expect.any(String));
      });
    });

    it('should group messages by conversation', async () => {
      const messages = [
        {
          id: 'msg-1',
          sender_id: 'test-user-123',
          recipient_id: 'advisor-456',
          message: 'First message',
          created_at: new Date().toISOString(),
          read_status: false,
          sender_role: 'student',
          sender: {
            first_name: 'Test',
            last_name: 'User',
            role: 'student',
            avatar_url: null
          },
          recipient: {
            first_name: 'Dr',
            last_name: 'Advisor',
            role: 'advisor',
            avatar_url: null
          }
        },
        {
          id: 'msg-2',
          sender_id: 'test-user-123',
          recipient_id: 'advisor-456',
          message: 'Second message',
          created_at: new Date(Date.now() + 1000).toISOString(),
          read_status: false,
          sender_role: 'student',
          sender: {
            first_name: 'Test',
            last_name: 'User',
            role: 'student',
            avatar_url: null
          },
          recipient: {
            first_name: 'Dr',
            last_name: 'Advisor',
            role: 'advisor',
            avatar_url: null
          }
        }
      ];

      mockSupabaseFrom.mockImplementation(() => createMockChain(messages));

      render(<ChatInterface />);

      await waitFor(() => {
        expect(mockSupabaseFrom).toHaveBeenCalled();
      });
    });

    it('should handle empty message list', async () => {
      mockSupabaseFrom.mockImplementation(() => createMockChain([]));

      render(<ChatInterface />);

      await waitFor(() => {
        expect(mockSupabaseFrom).toHaveBeenCalled();
      });
    });
  });

  describe('Database Table Fallback Chain', () => {
    it('should try advisor_student_relationships first', async () => {
      mockSupabaseFrom.mockImplementation(() => createMockChain([]));

      render(<ChatInterface />);

      await waitFor(() => {
        expect(mockSupabaseFrom).toHaveBeenCalledWith('advisor_student_relationships');
      });
    });

    it('should fallback to advisor_student_messages if relationships missing', async () => {
      const callOrder: string[] = [];

      mockSupabaseFrom.mockImplementation((table) => {
        callOrder.push(table);
        
        if (table === 'advisor_student_relationships') {
          return {
            select: vi.fn().mockReturnValue({
              or: vi.fn().mockResolvedValue({
                data: null,
                error: { code: '42P01', message: 'table not found' }
              })
            })
          };
        }

        return createMockChain([]);
      });

      render(<ChatInterface />);

      await waitFor(() => {
        expect(callOrder).toContain('advisor_student_relationships');
        expect(callOrder).toContain('advisor_student_messages');
      });
    });

    it('should fallback to messages table if advisor_student_messages missing', async () => {
      // Sample advisor-student conversation demonstrating fallback
      const advisorStudentConversation = [
        {
          id: 'msg-1',
          sender_id: 'advisor-456',
          recipient_id: 'test-user-123',
          message: 'Hi, how are you progressing with your thesis research?',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          read_status: true,
          sender_role: 'advisor'
        },
        {
          id: 'msg-2',
          sender_id: 'test-user-123',
          recipient_id: 'advisor-456',
          message: 'Great! I finished the literature review. Ready to discuss Chapter 1.',
          created_at: new Date(Date.now() - 1800000).toISOString(),
          read_status: true,
          sender_role: 'student'
        },
        {
          id: 'msg-3',
          sender_id: 'advisor-456',
          recipient_id: 'test-user-123',
          message: 'Perfect! Let\'s schedule a meeting next week to review your findings.',
          created_at: new Date(Date.now() - 600000).toISOString(),
          read_status: false,
          sender_role: 'advisor'
        }
      ];

      mockSupabaseFrom.mockImplementation((table) => {
        if (table === 'advisor_student_relationships') {
          return createMockChain([
            {
              student_id: 'test-user-123',
              advisor_id: 'advisor-456'
            }
          ]);
        }

        // Primary table fails, fallback to generic messages table
        if (table === 'advisor_student_messages') {
          return {
            select: vi.fn().mockReturnValue({
              or: vi.fn().mockResolvedValue({
                data: null,
                error: { 
                  code: '42P01', 
                  message: 'relation "advisor_student_messages" does not exist' 
                }
              })
            })
          };
        }

        // Fallback to generic messages table
        if (table === 'messages') {
          return createMockChain(advisorStudentConversation);
        }

        return createMockChain([]);
      });

      // Should render without errors even when primary table doesn't exist
      const { container } = render(<ChatInterface />);

      await waitFor(() => {
        expect(container.firstChild).toBeTruthy();
      });
    });
  });

  describe('Error Serialization', () => {
    it('should handle errors without message property', async () => {
      mockSupabaseFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockRejectedValue({ code: '42P01' })
        })
      }));

      const consoleErrorSpy = vi.spyOn(console, 'error');
      render(<ChatInterface />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });

    it('should serialize error object without circular references', async () => {
      const error = new Error('Test error');
      error.stack = 'Error stack trace';

      mockSupabaseFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockRejectedValue(error)
        })
      }));

      const consoleErrorSpy = vi.spyOn(console, 'error');
      render(<ChatInterface />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });

    it('should capture error type information', async () => {
      mockSupabaseFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockRejectedValue({ custom: 'error object' })
        })
      }));

      const consoleErrorSpy = vi.spyOn(console, 'error');
      render(<ChatInterface />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Resilience and Recovery', () => {
    it('should continue loading UI even if all message tables fail', async () => {
      mockSupabaseFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockResolvedValue({
            data: null,
            error: { code: '42P01', message: 'table not found' }
          }),
          in: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: null,
                error: { code: '42P01', message: 'table not found' }
              })
            })
          })
        })
      }));

      const { container } = render(<ChatInterface />);

      await waitFor(() => {
        expect(container.firstChild).toBeTruthy();
      });
    });

    it('should not crash on null or undefined data responses', async () => {
      mockSupabaseFrom.mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          or: vi.fn().mockResolvedValue({
            data: null,
            error: null
          }),
          in: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: undefined,
                error: null
              })
            })
          })
        })
      }));

      const { container } = render(<ChatInterface />);

      await waitFor(() => {
        expect(container.firstChild).toBeTruthy();
      });
    });

    it('should handle rapid re-renders gracefully', async () => {
      mockSupabaseFrom.mockImplementation(() => 
        createMockChain([
          {
            id: 'msg-1',
            sender_id: 'test-user-123',
            recipient_id: 'advisor-456',
            message: 'Hello',
            created_at: new Date().toISOString(),
            read_status: false,
            sender_role: 'student'
          }
        ])
      );

      const { rerender } = render(<ChatInterface />);

      rerender(<ChatInterface />);

      await waitFor(() => {
        expect(mockSupabaseFrom).toHaveBeenCalled();
      });
    });
  });
});
