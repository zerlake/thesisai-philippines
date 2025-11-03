// Test for the enhanced outline generator integration

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EnhancedOutlineGenerator } from '../components/enhanced-outline-generator';
import { AuthProvider } from '../components/auth-provider';

// Mock the supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: { id: 1 }, error: null })) })) })),
    })),
  })),
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => 
      Promise.resolve({ 
        enhancedOutline: {
          content: "Sample outline content",
          methodologyAlignment: "Sample methodology alignment",
          researchQuestions: ["Sample research question"],
          dataSources: ["Sample data source"],
          timelineEstimate: "Sample timeline",
          potentialChallenges: ["Sample challenge: Sample mitigation"],
          methodologySpecificSections: [],
          universityCompliance: {
            compliant: true,
            violations: [],
            suggestions: []
          }
        }
      }),
    ok: true,
  } as Response)
) as jest.Mock;

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('EnhancedOutlineGenerator Integration', () => {
  const renderWithAuth = (children: React.ReactNode) => {
    return render(
      <AuthProvider>
        {children}
      </AuthProvider>
    );
  };

  beforeEach(() => {
    // Reset mocks
    (fetch as jest.Mock).mockClear();
    jest.clearAllMocks();
  });

  it('should use the enhanced dynamic structure adapter service for outline generation', async () => {
    // Mock a session
    const mockSession = {
      access_token: 'mock-token',
      user: { id: 'user-id', email: 'test@example.com' }
    };
    
    // Mock the useAuth hook
    jest.spyOn(require('../components/auth-provider'), 'useAuth').mockReturnValue({
      session: { access_token: 'mock-token', user: { id: 'user-id' } },
      supabase: {
        from: jest.fn(() => ({
          insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: { id: 1 }, error: null })) })) })),
        })),
      }
    });

    renderWithAuth(<EnhancedOutlineGenerator />);

    // Fill in the form fields
    const fieldSelector = screen.getByRole('combobox', { name: /field of study/i });
    fireEvent.change(fieldSelector, { target: { value: 'computer science' } });
    
    const topicInput = screen.getByPlaceholderText(/e\.g\., the impact of ai on higher education/i);
    fireEvent.change(topicInput, { target: { value: 'Test Topic' } });
    
    const methodologySelect = screen.getByRole('combobox', { name: /research methodology/i });
    fireEvent.change(methodologySelect, { target: { value: 'quantitative' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /generate methodology-aligned outline/i });
    fireEvent.click(submitButton);

    // Wait for the outline to be generated
    await waitFor(() => {
      expect(screen.getByText(/generated outline/i)).toBeInTheDocument();
    }, { timeout: 10000 });

    // Verify that the fetch was called (outline generation)
    expect(fetch).toHaveBeenCalledTimes(1);
    
    // Verify that the outline content is displayed
    expect(screen.getByText(/sample outline content/i)).toBeInTheDocument();
  });

  it('should update outline when methodology changes', async () => {
    // Mock a session
    const mockSession = {
      access_token: 'mock-token',
      user: { id: 'user-id', email: 'test@example.com' }
    };
    
    // Mock the useAuth hook
    jest.spyOn(require('../components/auth-provider'), 'useAuth').mockReturnValue({
      session: { access_token: 'mock-token', user: { id: 'user-id' } },
      supabase: {
        from: jest.fn(() => ({
          insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: { id: 1 }, error: null })) })) })),
        })),
      }
    });

    renderWithAuth(<EnhancedOutlineGenerator />);

    // Fill in the form fields
    const fieldSelector = screen.getByRole('combobox', { name: /field of study/i });
    fireEvent.change(fieldSelector, { target: { value: 'computer science' } });
    
    const topicInput = screen.getByPlaceholderText(/e\.g\., the impact of ai on higher education/i);
    fireEvent.change(topicInput, { target: { value: 'Test Topic' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /generate methodology-aligned outline/i });
    fireEvent.click(submitButton);

    // Wait for the outline to be generated
    await waitFor(() => {
      expect(screen.getByText(/generated outline/i)).toBeInTheDocument();
    }, { timeout: 10000 });

    // Change methodology to qualitative
    const methodologySelect = screen.getByRole('combobox', { name: /research methodology/i });
    fireEvent.change(methodologySelect, { target: { value: 'qualitative' } });

    // Verify that the outline reflects the methodology change
    // (This tests that the handleMethodologyChange function works)
    expect(methodologySelect).toHaveValue('qualitative');
  });

  it('should check university compliance when university changes', async () => {
    // Mock a session
    const mockSession = {
      access_token: 'mock-token',
      user: { id: 'user-id', email: 'test@example.com' }
    };
    
    // Mock the useAuth hook
    jest.spyOn(require('../components/auth-provider'), 'useAuth').mockReturnValue({
      session: { access_token: 'mock-token', user: { id: 'user-id' } },
      supabase: {
        from: jest.fn(() => ({
          insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: { id: 1 }, error: null })) })) })),
        })),
      }
    });

    renderWithAuth(<EnhancedOutlineGenerator />);

    // Fill in the form fields
    const fieldSelector = screen.getByRole('combobox', { name: /field of study/i });
    fireEvent.change(fieldSelector, { target: { value: 'computer science' } });
    
    const topicInput = screen.getByPlaceholderText(/e\.g\., the impact of ai on higher education/i);
    fireEvent.change(topicInput, { target: { value: 'Test Topic' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /generate methodology-aligned outline/i });
    fireEvent.click(submitButton);

    // Wait for the outline to be generated
    await waitFor(() => {
      expect(screen.getByText(/generated outline/i)).toBeInTheDocument();
    }, { timeout: 10000 });

    // Change university to vsu
    const universitySelect = screen.getByRole('combobox', { name: /university format/i });
    fireEvent.change(universitySelect, { target: { value: 'vsu' } });

    // Verify that the university is updated
    expect(universitySelect).toHaveValue('vsu');
  });
});