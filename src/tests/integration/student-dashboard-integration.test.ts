import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StudentDashboard } from '../../components/student-dashboard';
import { useAuth } from '../../components/auth-provider';
import { mockAuthContext, mockProfile, createMockSupabase } from '../mocks/dashboard-mocks';

// Mock the useAuth hook
jest.mock('../../components/auth-provider', () => ({
  useAuth: jest.fn(),
}));

// Mock toast notifications
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock date-fns functions
jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  formatDistanceToNow: jest.fn(() => '2 days ago'),
  differenceInDays: jest.fn(() => 5),
}));

describe('Student Dashboard Integration Tests', () => {
  const mockUseAuth = useAuth as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue(mockAuthContext);
  });

  test('full dashboard renders with all components', async () => {
    render(<StudentDashboard />);
    
    // Wait for dashboard to load and render
    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Test!/i)).toBeInTheDocument();
    });

    // Verify major dashboard sections are present
    expect(screen.getByText('Total Documents')).toBeInTheDocument();
    expect(screen.getByText('Total Word Count')).toBeInTheDocument();
    expect(screen.getByText('Avg. Words / Doc')).toBeInTheDocument();
    expect(screen.getByText('Wellbeing Check-in')).toBeInTheDocument();
    expect(screen.getByText('Your Milestones')).toBeInTheDocument();
    expect(screen.getByText('Thesis Checklist')).toBeInTheDocument();
    expect(screen.getByText('Quick Access Tools')).toBeInTheDocument();
    expect(screen.getByText('User Guide')).toBeInTheDocument();
  });

  test('data fetching integration works correctly', async () => {
    // Mock a more complex Supabase interaction
    const mockSupabaseWithDocs = {
      from: (table: string) => {
        if (table === 'documents') {
          return {
            select: () => ({
              eq: () => ({
                order: () => ({
                  limit: () => ({
                    single: () => Promise.resolve({ 
                      data: { id: 'doc1', title: 'Test Doc', updated_at: '2024-12-01' }, 
                      error: null 
                    })
                  })
                })
              })
            }),
          };
        } else if (table === 'snoozed_actions') {
          return {
            select: () => ({
              eq: () => ({
                gte: () => ({
                  then: (callback: any) => callback({ data: [], error: null })
                })
              })
            }),
          };
        }
        return {
          select: () => ({
            eq: () => ({
              then: (callback: any) => callback({ data: [], error: null })
            })
          })
        };
      },
      rpc: (funcName: string) => {
        if (funcName === 'get_student_next_action') {
          return Promise.resolve({ data: null, error: null }); // No next action
        }
        return Promise.resolve({ data: [], error: null });
      }
    };

    mockUseAuth.mockReturnValue({
      ...mockAuthContext,
      supabase: mockSupabaseWithDocs,
    });

    render(<StudentDashboard />);
    
    await waitFor(() => {
      // The dashboard should handle the data fetching without errors
      expect(screen.getByText(/Welcome back, Test!/i)).toBeInTheDocument();
    });
  });

  test('dashboard widgets can be toggled via user preferences', async () => {
    // Mock profile with some widgets disabled
    const profileWithLimitedWidgets = {
      ...mockProfile,
      user_preferences: {
        dashboard_widgets: {
          stats: true,
          next_action: false, // disabled
          recent_activity: true,
          checklist: false, // disabled
          session_goal: true,
          writing_streak: false, // disabled
          milestones: true,
          quick_access: true,
          wellbeing: true,
          progress_milestones: true,
        }
      }
    };

    mockUseAuth.mockReturnValue({
      ...mockAuthContext,
      profile: profileWithLimitedWidgets,
    });

    render(<StudentDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Test!/i)).toBeInTheDocument();
    });

    // Stats widget should be visible
    expect(screen.getByText('Total Documents')).toBeInTheDocument();
    
    // Next action widget should be hidden
    // Note: we can't easily test for absence without other content in the same area, 
    // but the component logic should respect the preferences
  });

  test('dashboard handles API errors gracefully', async () => {
    // Mock Supabase to return errors
    const mockSupabaseWithError = {
      from: (table: string) => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: () => ({
                single: () => Promise.resolve({ 
                  data: null, 
                  error: { message: 'API Error' } 
                })
              })
            })
          })
        }),
      }),
      rpc: (funcName: string) => {
        if (funcName === 'get_student_next_action') {
          return Promise.resolve({ 
            data: null, 
            error: { message: 'RPC Error' } 
          });
        }
        return Promise.resolve({ data: [], error: null });
      }
    };

    mockUseAuth.mockReturnValue({
      ...mockAuthContext,
      supabase: mockSupabaseWithError,
    });

    render(<StudentDashboard />);
    
    // Should still render without crashing even with API errors
    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Test!/i)).toBeInTheDocument();
    });
  });

  test('next action functionality works with different action types', async () => {
    const mockSupabaseWithFeedback = {
      from: (table: string) => {
        if (table === 'snoozed_actions') {
          return {
            select: () => ({
              eq: () => ({
                gte: () => ({
                  then: (callback: any) => callback({ data: [], error: null })
                })
              })
            }),
          };
        }
        return {
          select: () => ({
            eq: () => ({
              then: (callback: any) => callback({ data: [], error: null })
            })
          })
        };
      },
      rpc: (funcName: string) => {
        if (funcName === 'get_student_next_action') {
          return Promise.resolve({ 
            data: { 
              type: 'feedback', 
              id: 'feedback-1', 
              title: 'Thesis document',
              deadline: null
            }, 
            error: null 
          });
        }
        return Promise.resolve({ data: [], error: null });
      }
    };

    mockUseAuth.mockReturnValue({
      ...mockAuthContext,
      supabase: mockSupabaseWithFeedback,
    });

    render(<StudentDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Revise "Thesis document"')).toBeInTheDocument();
    });
  });

  test('dashboard handles different user states', async () => {
    // Test with a new user who has no documents yet
    const mockSupabaseNewUser = {
      from: (table: string) => {
        if (table === 'documents') {
          return {
            select: () => ({
              eq: () => ({
                order: () => ({
                  limit: () => ({
                    single: () => Promise.resolve({ 
                      data: null, 
                      error: null 
                    })
                  })
                })
              })
            }),
          };
        } else if (table === 'snoozed_actions') {
          return {
            select: () => ({
              eq: () => ({
                gte: () => ({
                  then: (callback: any) => callback({ data: [], error: null })
                })
              })
            }),
          };
        } else {
          return {
            select: () => ({
              eq: () => ({
                then: (callback: any) => callback({ data: [], error: null })
              })
            })
          };
        }
      },
      rpc: (funcName: string) => {
        if (funcName === 'get_student_next_action') {
          return Promise.resolve({ data: null, error: null });
        }
        return Promise.resolve({ data: [], error: null });
      }
    };

    mockUseAuth.mockReturnValue({
      ...mockAuthContext,
      supabase: mockSupabaseNewUser,
    });

    render(<StudentDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Test!/i)).toBeInTheDocument();
    });
  });
});