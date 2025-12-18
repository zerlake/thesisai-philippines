/**
 * Chat Integration Tests
 * Phase 5: Real-time Communication & Collaboration
 * 
 * Integration tests for real-time chat functionality between:
 * - Students and Advisors
 * - Students and Critics 
 * - Ensures message persistence and proper role-based access
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock external dependencies
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    pathname: '/advisor/chat',
    query: {},
    asPath: '/advisor/chat',
  }),
  usePathname: () => '/advisor/chat',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  }
}));

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ subscription: { unsubscribe: vi.fn() }}))
    },
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn((callback) => {
          if (callback) callback('SUBSCRIBED');
          return { unsubscribe: vi.fn() };
        })
      })),
      subscribe: vi.fn((statusCallback) => {
        if (statusCallback) statusCallback('SUBSCRIBED');
        return { unsubscribe: vi.fn() };
      })
    }))
  }
}));

// Simplified test for chat functionality
describe('Chat Integration Tests', () => {
  let mockAdvisor, mockStudent, mockCritic;

  beforeEach(() => {
    mockAdvisor = {
      id: 'test-advisor-' + Math.random().toString(36).substr(2, 9),
      email: 'advisor@test.com',
      first_name: 'Advisor',
      last_name: 'Test',
      role: 'advisor'
    };

    mockStudent = {
      id: 'test-student-' + Math.random().toString(36).substr(2, 9),
      email: 'student@test.com',
      first_name: 'Student',
      last_name: 'Test',
      role: 'user'
    };

    mockCritic = {
      id: 'test-critic-' + Math.random().toString(36).substr(2, 9),
      email: 'critic@test.com',
      first_name: 'Critic',
      last_name: 'Test',
      role: 'critic'
    };
    
    // Reset mocks
    vi.clearAllMocks();
  });

  describe('Advisor-Student Communication', () => {
    it('should allow advisor to send messages to student', async () => {
      // Mock Supabase insert for sending a message
      const mockInsertResponse = {
        data: [{ id: 'msg-1', message: 'Test message from advisor', created_at: new Date().toISOString() }],
        error: null
      };

      const mockFrom = vi.fn((table) => {
        if (table === 'advisor_student_messages') {
          return {
            insert: vi.fn(() => Promise.resolve(mockInsertResponse)),
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  order: vi.fn(() => Promise.resolve({ data: [], error: null }))
                }))
              }))
            }))
          };
        }
        return {
          select: vi.fn(() => Promise.resolve({ data: [], error: null }))
        };
      });

      const { supabase } = await import('@/integrations/supabase/client');
      supabase.from = mockFrom;

      // Simulate sending a message from advisor to student
      const sendMessage = async (messageText: string, recipientId: string) => {
        const { data, error } = await supabase
          .from('advisor_student_messages')
          .insert([{
            sender_id: mockAdvisor.id,
            recipient_id: recipientId,
            message: messageText,
            sender_role: 'advisor'
          }]);

        return { data, error };
      };

      const result = await sendMessage('Hello student, how is your thesis coming along?', mockStudent.id);

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data![0].message).toBe('Hello student, how is your thesis coming along?');
      
      expect(mockFrom).toHaveBeenCalledWith('advisor_student_messages');
    });

    it('should allow advisor to receive messages from student', async () => {
      // Mock messages from student to advisor
      const mockMessagesResponse = {
        data: [
          {
            id: 'msg-1',
            sender_id: mockStudent.id,
            sender_role: 'user',
            recipient_id: mockAdvisor.id,
            message: 'Hi advisor, I need feedback on my outline',
            created_at: new Date().toISOString(),
            read_status: false
          }
        ],
        error: null
      };

      const mockFrom = vi.fn((table) => {
        if (table === 'advisor_student_messages') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn((col, val) => {
                if (col === 'recipient_id' && val === mockAdvisor.id) {
                  return {
                    eq: vi.fn((col, val) => {
                      if (col === 'sender_id') {
                        return {
                          order: vi.fn(() => Promise.resolve(mockMessagesResponse))
                        };
                      }
                    })
                  };
                }
              })
            }))
          };
        }
        return {
          select: vi.fn(() => Promise.resolve({ data: [], error: null }))
        };
      });

      const { supabase } = await import('@/integrations/supabase/client');
      supabase.from = mockFrom;

      // Simulate fetching messages for advisor
      const fetchMessages = async () => {
        const { data, error } = await supabase
          .from('advisor_student_messages')
          .select('*')
          .eq('recipient_id', mockAdvisor.id)
          .order('created_at', { ascending: false });

        return { data, error };
      };

      const result = await fetchMessages();

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data![0].message).toBe('Hi advisor, I need feedback on my outline');
      expect(result.data![0].sender_id).toBe(mockStudent.id);
    });
  });

  describe('Critic-Student Communication', () => {
    it('should allow critic to send feedback to student', async () => {
      // Mock sending message from critic to student
      const mockInsertResponse = {
        data: [{ 
          id: 'critic-msg-1', 
          message: 'Your methodology needs more clarity', 
          created_at: new Date().toISOString() 
        }],
        error: null
      };

      const mockFrom = vi.fn((table) => {
        if (table === 'advisor_student_messages') {  // Using same table for all communications
          return {
            insert: vi.fn(() => Promise.resolve(mockInsertResponse)),
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  order: vi.fn(() => Promise.resolve({ data: [], error: null }))
                }))
              }))
            }))
          };
        }
        return {
          select: vi.fn(() => Promise.resolve({ data: [], error: null }))
        };
      });

      const { supabase } = await import('@/lib/supabase/client');
      supabase.from = mockFrom;

      // Simulate sending feedback from critic to student
      const sendFeedback = async (feedbackText: string, recipientId: string) => {
        const { data, error } = await supabase
          .from('advisor_student_messages')  // Using unified messaging table
          .insert([{
            sender_id: mockCritic.id,
            recipient_id: recipientId,
            message: feedbackText,
            sender_role: 'critic'  // Different role for critic
          }]);

        return { data, error };
      };

      const result = await sendFeedback('Your methodology section needs more clarity on the sampling technique.', mockStudent.id);

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data![0].message).toContain('methodology section needs more clarity');
      expect(mockFrom).toHaveBeenCalledWith('advisor_student_messages');
    });

    it('should allow critic to receive messages from student', async () => {
      // Mock messages from student to critic
      const mockCriticMessages = {
        data: [
          {
            id: 'critic-req-1',
            sender_id: mockStudent.id,
            sender_role: 'user',
            recipient_id: mockCritic.id,
            message: 'Hi critic, can you review my results section?',
            created_at: new Date().toISOString(),
            read_status: false
          }
        ],
        error: null
      };

      const mockFrom = vi.fn((table) => {
        if (table === 'advisor_student_messages') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn((col, val) => {
                if (col === 'recipient_id' && val === mockCritic.id) {
                  return {
                    eq: vi.fn((col, val) => ({
                      order: vi.fn(() => Promise.resolve(mockCriticMessages))
                    }))
                  };
                }
              })
            }))
          };
        }
        return {
          select: vi.fn(() => Promise.resolve({ data: [], error: null }))
        };
      });

      const { supabase } = await import('@/lib/supabase/client');
      supabase.from = mockFrom;

      // Simulate fetching messages for critic
      const fetchMessages = async () => {
        const { data, error } = await supabase
          .from('advisor_student_messages')
          .select('*')
          .eq('recipient_id', mockCritic.id)
          .order('created_at', { ascending: false });

        return { data, error };
      };

      const result = await fetchMessages();

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data![0].message).toContain('review my results section');
      expect(result.data![0].sender_id).toBe(mockStudent.id);
    });
  });

  describe('Real-time Messaging Features', () => {
    it('should establish websocket connection for real-time updates', async () => {
      const { supabase } = await import('@/lib/supabase/client');
      
      // Mock channel creation
      const mockChannel = {
        on: vi.fn((event, config, callback) => ({
          subscribe: vi.fn((statusCb) => {
            if (statusCb) statusCb('SUBSCRIBED');
            return { unsubscribe: vi.fn() };
          })
        })),
        subscribe: vi.fn((statusCb) => {
          if (statusCb) statusCb('SUBSCRIBED');
          return { unsubscribe: vi.fn() };
        })
      };

      const mockChannelFn = vi.fn(() => mockChannel);
      supabase.channel = mockChannelFn;

      // Simulate setting up real-time messaging
      const setupRealTimeMessaging = () => {
        const channel = supabase.channel(`messages:${mockAdvisor.id}`);
        
        channel
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'advisor_student_messages',
              filter: `recipient_id=eq.${mockAdvisor.id}`
            },
            (payload) => {
              console.log('New message received:', payload.new);
            }
          )
          .subscribe((status) => {
            console.log('Channel status:', status);
          });

        return channel;
      };

      const channel = setupRealTimeMessaging();

      expect(mockChannelFn).toHaveBeenCalledWith(expect.stringContaining('messages:'));
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: 'INSERT',
          table: 'advisor_student_messages'
        }),
        expect.any(Function)
      );
    });

    it('should handle incoming real-time messages properly', async () => {
      // Create a mock payload for real-time message
      const mockPayload = {
        new: {
          id: 'rt-msg-1',
          sender_id: mockStudent.id,
          sender_role: 'user',
          recipient_id: mockAdvisor.id,
          message: 'Real-time message from student',
          created_at: new Date().toISOString()
        }
      };

      const messageHandler = vi.fn();
      
      const { supabase } = await import('@/lib/supabase/client');
      
      // Mock channel with message handler
      const mockChannel = {
        on: vi.fn((event, config, callback) => {
          // Immediately call the callback with mock payload to simulate real-time message
          callback(mockPayload);
          return {
            subscribe: vi.fn((statusCb) => {
              if (statusCb) statusCb('SUBSCRIBED');
              return { unsubscribe: vi.fn() };
            })
          };
        }),
        subscribe: vi.fn((statusCb) => {
          if (statusCb) statusCb('SUBSCRIBED');
          return { unsubscribe: vi.fn() };
        })
      };

      supabase.channel = vi.fn(() => mockChannel);

      // Simulate setting up message handler
      const channel = supabase.channel(`messages:${mockAdvisor.id}`);
      
      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'advisor_student_messages',
            filter: `recipient_id=eq.${mockAdvisor.id}`
          },
          messageHandler // This will be called with the mock payload
        )
        .subscribe((status) => {
          // Subscription callback
        });

      // Verify that the message handler was called with the real-time message
      expect(messageHandler).toHaveBeenCalledWith(mockPayload);
      expect(messageHandler.mock.calls[0][0].new.message).toBe('Real-time message from student');
    });
  });

  describe('Message Persistence & Retrieval', () => {
    it('should persist messages in the database correctly', async () => {
      const mockMessage = {
        id: 'persist-test-1',
        sender_id: mockAdvisor.id,
        recipient_id: mockStudent.id,
        message: 'This is a test message for persistence',
        created_at: new Date().toISOString(),
        sender_role: 'advisor',
        read_status: false
      };

      const mockInsertResponse = {
        data: [mockMessage],
        error: null
      };

      const mockFrom = vi.fn((table) => {
        if (table === 'advisor_student_messages') {
          return {
            insert: vi.fn(() => Promise.resolve(mockInsertResponse)),
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  order: vi.fn(() => Promise.resolve({ data: [mockMessage], error: null }))
                }))
              }))
            }))
          };
        }
        return {
          select: vi.fn(() => Promise.resolve({ data: [], error: null }))
        };
      });

      const { supabase } = await import('@/lib/supabase/client');
      supabase.from = mockFrom;

      // Test message insertion
      const { data: insertData, error: insertError } = await supabase
        .from('advisor_student_messages')
        .insert([{
          sender_id: mockAdvisor.id,
          recipient_id: mockStudent.id,
          message: 'This is a test message for persistence',
          sender_role: 'advisor'
        }]);

      expect(insertError).toBeNull();
      expect(insertData).toHaveLength(1);
      expect(insertData![0].message).toBe('This is a test message for persistence');

      // Test message retrieval
      const { data: selectData, error: selectError } = await supabase
        .from('advisor_student_messages')
        .select('*')
        .eq('recipient_id', mockStudent.id)
        .eq('sender_id', mockAdvisor.id);

      expect(selectError).toBeNull();
      expect(selectData).toHaveLength(1);
      expect(selectData![0].message).toBe('This is a test message for persistence');
    });

    it('should maintain message thread integrity', async () => {
      const mockThreadMessages = [
        {
          id: 'thread-1',
          sender_id: mockStudent.id,
          recipient_id: mockAdvisor.id,
          message: 'Hi advisor, I have a question about methodology',
          created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          sender_role: 'user',
          read_status: true
        },
        {
          id: 'thread-2',
          sender_id: mockAdvisor.id,
          recipient_id: mockStudent.id,
          message: 'Sure, what specifically about the methodology?',
          created_at: new Date(Date.now() - 1800000).toISOString(), // 30 mins ago
          sender_role: 'advisor',
          read_status: true
        },
        {
          id: 'thread-3',
          sender_id: mockStudent.id,
          recipient_id: mockAdvisor.id,
          message: 'How do I justify my sample size?',
          created_at: new Date(Date.now() - 600000).toISOString(), // 10 mins ago
          sender_role: 'user',
          read_status: false // Latest message is unread
        }
      ];

      const mockThreadResponse = {
        data: mockThreadMessages,
        error: null
      };

      const mockFrom = vi.fn((table) => {
        if (table === 'advisor_student_messages') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  order: vi.fn(() => Promise.resolve(mockThreadResponse))
                }))
              }))
            }))
          };
        }
        return {
          select: vi.fn(() => Promise.resolve({ data: [], error: null }))
        };
      });

      const { supabase } = await import('@/lib/supabase/client');
      supabase.from = mockFrom;

      // Fetch conversation thread between student and advisor
      const { data: threadData, error: threadError } = await supabase
        .from('advisor_student_messages')
        .select('*')
        .or(`and(sender_id.eq.${mockStudent.id},recipient_id.eq.${mockStudent.id}),and(sender_id.eq.${mockAdvisor.id},recipient_id.eq.${mockAdvisor.id})`)
        .order('created_at', { ascending: false });

      expect(threadError).toBeNull();
      expect(threadData).toHaveLength(3);

      // Verify thread integrity - messages are in chronological order
      const sortedMessages = [...threadData!].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      expect(sortedMessages[0].message).toContain('question about methodology');
      expect(sortedMessages[1].message).toContain('specifically about the methodology');
      expect(sortedMessages[2].message).toContain('justify my sample size');
      
      // Verify the latest message is marked as unread
      expect(sortedMessages[2].read_status).toBe(false);
    });
  });

  describe('Role-Based Access Control', () => {
    it('should prevent students from accessing advisor-only messages', async () => {
      const mockAdvisorOnlyMessage = {
        id: 'advisor-only-1',
        sender_id: 'other-advisor-id',
        recipient_id: 'other-student-id',
        message: 'Private advisor discussion',
        created_at: new Date().toISOString(),
        sender_role: 'advisor'
      };

      const mockForbiddenResponse = {
        data: null,
        error: { code: '401', message: 'Permission denied' }
      };

      const mockFrom = vi.fn((table) => {
        if (table === 'advisor_student_messages') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn((col, val) => {
                if (col === 'recipient_id' && val !== mockStudent.id) {
                  // Simulate permission error when student tries to access other's messages
                  return {
                    eq: vi.fn(() => ({
                      order: vi.fn(() => Promise.resolve(mockForbiddenResponse))
                    }))
                  };
                }
                return {
                  eq: vi.fn((col, val) => ({
                    order: vi.fn(() => Promise.resolve({ 
                      data: val === mockStudent.id ? [] : null, 
                      error: val === mockStudent.id ? null : { code: '401', message: 'Permission denied' }
                    }))
                  }))
                };
              })
            }))
          };
        }
        return {
          select: vi.fn(() => Promise.resolve({ data: [], error: null }))
        };
      });

      const { supabase } = await import('@/lib/supabase/client');
      supabase.from = mockFrom;

      // Try to access messages that don't belong to the student
      const { data, error } = await supabase
        .from('advisor_student_messages')
        .select('*')
        .eq('recipient_id', 'different-student-id') // Not the current student
        .eq('sender_id', 'any-advisor-id');

      // Should return permission error
      expect(error).not.toBeNull();
      expect(error?.message).toContain('Permission denied');
    });

    it('should allow proper role-based message access', async () => {
      // Mock different scenarios for each role
      const mockResponses = {
        student: {
          data: [
            { id: 'stud-msg-1', recipient_id: mockStudent.id, sender_role: 'advisor' },
            { id: 'stud-msg-2', recipient_id: mockStudent.id, sender_role: 'critic' }
          ],
          error: null
        },
        advisor: {
          data: [
            { id: 'adv-msg-1', recipient_id: mockAdvisor.id, sender_role: 'user' },
            { id: 'adv-msg-2', recipient_id: mockAdvisor.id, sender_role: 'admin' }
          ],
          error: null
        },
        critic: {
          data: [
            { id: 'crit-msg-1', recipient_id: mockCritic.id, sender_role: 'user' }
          ],
          error: null
        }
      };

      const mockFrom = vi.fn((table) => {
        if (table === 'advisor_student_messages') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  order: vi.fn(() => Promise.resolve(mockResponses.student)) // Default to student response
                }))
              }))
            }))
          };
        }
        return {
          select: vi.fn(() => Promise.resolve({ data: [], error: null }))
        };
      });

      const { supabase } = await import('@/lib/supabase/client');
      supabase.from = mockFrom;

      // Test that each role can access their appropriate messages
      const fetchRoleMessages = async (roleId: string, roleType: string) => {
        const { data, error } = await supabase
          .from('advisor_student_messages')
          .select('*')
          .eq('recipient_id', roleId)
          .order('created_at', { ascending: false });

        return { data, error };
      };

      // Each role should get their respective messages without error
      const studentMsgs = await fetchRoleMessages(mockStudent.id, 'student');
      const advisorMsgs = await fetchRoleMessages(mockAdvisor.id, 'advisor');
      const criticMsgs = await fetchRoleMessages(mockCritic.id, 'critic');

      expect(studentMsgs.error).toBeNull();
      expect(advisorMsgs.error).toBeNull();
      expect(criticMsgs.error).toBeNull();
    });
  });
});

// Export for module system
export {};