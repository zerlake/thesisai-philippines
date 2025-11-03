import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WellbeingWidget, ProgressMilestones } from '../../components/student-dashboard-enhancements';
import { useAuth } from '../../components/auth-provider';
import { toast } from 'sonner';
import { mockAuthContext } from '../mocks/dashboard-mocks';

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

describe('WellbeingWidget Component', () => {
  const mockUseAuth = useAuth as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue(mockAuthContext);
  });

  test('renders wellbeing widget with mood options', () => {
    render(<WellbeingWidget />);
    
    expect(screen.getByText('Wellbeing Check-in')).toBeInTheDocument();
    expect(screen.getByText('😊')).toBeInTheDocument(); // Feeling Good
    expect(screen.getByText('😐')).toBeInTheDocument(); // Neutral
    expect(screen.getByText('😔')).toBeInTheDocument(); // Needing Support
  });

  test('allows user to select a mood', async () => {
    render(<WellbeingWidget />);
    
    // Find the "Feeling Good" button
    const feelingGoodButton = screen.getByText('Feeling Good').closest('button');
    fireEvent.click(feelingGoodButton!);
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Your wellbeing check-in has been recorded!');
    });
  });

  test('shows error when saving mood fails', async () => {
    // Mock Supabase to return an error
    const mockSupabaseWithError = {
      from: () => ({
        insert: () => Promise.resolve({ error: { message: 'Database error' } }),
      }),
    };
    
    mockUseAuth.mockReturnValue({
      ...mockAuthContext,
      supabase: mockSupabaseWithError,
    });
    
    render(<WellbeingWidget />);
    
    const neutralButton = screen.getByText('Neutral').closest('button');
    fireEvent.click(neutralButton!);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to record wellbeing. Please try again.');
    });
  });

  test('renders thank you message after mood selection', async () => {
    render(<WellbeingWidget />);
    
    const feelingGoodButton = screen.getByText('Feeling Good').closest('button');
    fireEvent.click(feelingGoodButton!);
    
    await waitFor(() => {
      expect(screen.getByText(/Thank you for checking in!/i)).toBeInTheDocument();
    });
  });
});

describe('ProgressMilestones Component', () => {
  const mockUseAuth = useAuth as jest.Mock;

  // Mock Supabase for milestones
  const createMockSupabaseWithMilestones = (milestones: any[] = []) => ({
    from: (table: string) => {
      if (table === 'student_milestones') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                then: (callback: any) => callback({ data: milestones, error: null })
              })
            })
          }),
          insert: (data: any) => ({
            select: () => ({
              then: (callback: any) => callback({ data: [
                { id: 'm1', milestone_name: 'Proposal Defense', completed: false },
                { id: 'm2', milestone_name: 'Chapter I Draft', completed: false },
              ], error: null })
            })
          }),
          update: (data: any) => ({
            eq: () => ({
              then: (callback: any) => callback({ error: null })
            })
          })
        };
      }
      return {
        select: () => ({
          eq: () => ({
            then: (callback: any) => callback({ data: [], error: null })
          })
        })
      };
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue(mockAuthContext);
  });

  test('renders progress milestones component', () => {
    render(<ProgressMilestones />);
    
    expect(screen.getByText('Your Milestones')).toBeInTheDocument();
  });

  test('fetches and displays milestones', async () => {
    const mockMilestones = [
      { id: 'm1', user_id: 'test-user-id', milestone_name: 'Proposal Defense', completed: true },
      { id: 'm2', user_id: 'test-user-id', milestone_name: 'Chapter I Draft', completed: false },
    ];
    
    mockUseAuth.mockReturnValue({
      ...mockAuthContext,
      supabase: createMockSupabaseWithMilestones(mockMilestones),
    });
    
    render(<ProgressMilestones />);
    
    await waitFor(() => {
      expect(screen.getByText('1. Proposal Defense')).toBeInTheDocument();
      expect(screen.getByText('2. Chapter I Draft')).toBeInTheDocument();
    });
  });

  test('allows toggling milestone completion', async () => {
    const mockMilestones = [
      { id: 'm1', user_id: 'test-user-id', milestone_name: 'Proposal Defense', completed: false },
    ];
    
    mockUseAuth.mockReturnValue({
      ...mockAuthContext,
      supabase: createMockSupabaseWithMilestones(mockMilestones),
    });
    
    render(<ProgressMilestones />);
    
    // Wait for milestones to load
    await waitFor(() => {
      expect(screen.getByText('1. Proposal Defense')).toBeInTheDocument();
    });
    
    // Find the checkbox for the milestone
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    
    fireEvent.click(checkbox);
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Milestone marked as complete!');
    });
  });

  test('initializes default milestones when none exist', async () => {
    // Mock empty milestone response to trigger default initialization
    mockUseAuth.mockReturnValue({
      ...mockAuthContext,
      supabase: createMockSupabaseWithMilestones([]), // Empty array to trigger default initialization
    });
    
    render(<ProgressMilestones />);
    
    await waitFor(() => {
      // Default milestones should be rendered
      expect(screen.getByText('1. Proposal Defense')).toBeInTheDocument();
      expect(screen.getByText('2. Chapter I Draft')).toBeInTheDocument();
    });
  });

  test('shows error when milestone update fails', async () => {
    const mockMilestones = [
      { id: 'm1', user_id: 'test-user-id', milestone_name: 'Proposal Defense', completed: false },
    ];
    
    const mockSupabaseWithError = {
      from: (table: string) => {
        if (table === 'student_milestones') {
          return {
            select: () => ({
              eq: () => ({
                order: () => ({
                  then: (callback: any) => callback({ data: mockMilestones, error: null })
                })
              })
            }),
            update: () => ({
              eq: () => ({
                then: (callback: any) => callback({ error: { message: 'Update failed' } })
              })
            })
          };
        }
        return {
          select: () => ({
            eq: () => ({
              then: (callback: any) => callback({ data: [], error: null })
            })
          })
        };
      }
    };
    
    mockUseAuth.mockReturnValue({
      ...mockAuthContext,
      supabase: mockSupabaseWithError,
    });
    
    render(<ProgressMilestones />);
    
    await waitFor(() => {
      expect(screen.getByText('1. Proposal Defense')).toBeInTheDocument();
    });
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to update milestone. Please try again.');
    });
  });
});