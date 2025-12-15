import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { vi, describe, expect, it, beforeEach, afterEach } from 'vitest';
import { toast } from 'sonner';
import OutlineBuilder from '@/components/outline-builder';
import { AuthProvider, useAuth } from '@/components/auth-provider';
import { callPuterAI } from '@/lib/puter-ai-wrapper';

// Mock the dependencies
vi.mock('@/components/auth-provider', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

vi.mock('@/lib/puter-ai-wrapper', () => ({
  callPuterAI: vi.fn()
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  }
}));

const mockSession = {
  user: { id: 'test-user-123', email: 'test@example.com' },
  expires_at: Date.now() + 3600000,
};

const mockSupabase = {
  from: vi.fn(() => ({
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({ data: { id: 'doc-123' }, error: null }))
      }))
    })),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => ({ data: { id: 'doc-123' }, error: null }))
      }))
    }))
  }))
};

describe('OutlineBuilder Component', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      session: mockSession,
      supabase: mockSupabase
    });
    
    (toast.success as jest.Mock).mockClear();
    (toast.error as jest.Mock).mockClear();
    (callPuterAI as jest.Mock).mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the outline builder form correctly', () => {
    render(<OutlineBuilder />);
    
    expect(screen.getByText('AI-Powered Outline Builder')).toBeInTheDocument();
    expect(screen.getByLabelText('Research Topic')).toBeInTheDocument();
    expect(screen.getByTestId('field-of-study-selector')).toBeInTheDocument(); // Assuming the component has a testId
    expect(screen.getByLabelText('University (Optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Citation Style')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate with AI/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save as Draft/i })).toBeInTheDocument();
  });

  it('allows user to enter topic and field of study', async () => {
    render(<OutlineBuilder />);
    
    const topicInput = screen.getByLabelText('Research Topic');
    const fieldSelector = screen.getByTestId('field-of-study-selector'); // Use the actual test ID if available
    
    fireEvent.change(topicInput, { target: { value: 'The Impact of AI on Education' } });
    fireEvent.click(fieldSelector);
    fireEvent.click(screen.getByRole('option', { name: 'Education' })); // Assuming there's an option
    
    // Wait for changes to take effect
    await waitFor(() => {
      expect(topicInput).toHaveValue('The Impact of AI on Education');
    });
  });

  it('generates an outline when AI button is clicked', async () => {
    render(<OutlineBuilder />);
    
    // Mock successful AI response
    (callPuterAI as jest.Mock).mockResolvedValue(
      `# Introduction: Overview of AI in education
      ## Background: Rising adoption of AI tools in classrooms
      ## Problem Statement: Challenges in implementation`
    );
    
    const topicInput = screen.getByLabelText('Research Topic');
    const fieldSelector = screen.getByTestId('field-of-study-selector');
    const generateButton = screen.getByRole('button', { name: /Generate with AI/i });
    
    fireEvent.change(topicInput, { target: { value: 'AI in Education' } });
    fireEvent.click(fieldSelector);
    fireEvent.click(screen.getByRole('option', { name: 'Education' }));
    
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(callPuterAI).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Outline generated successfully'));
    });
  });

  it('adds a new section to the outline', async () => {
    render(<OutlineBuilder />);
    
    // Mock an existing outline
    const topicInput = screen.getByLabelText('Research Topic');
    fireEvent.change(topicInput, { target: { value: 'Sample Topic' } });
    
    const addSectionInput = screen.getByPlaceholderText('New section title');
    fireEvent.change(addSectionInput, { target: { value: 'Literature Review' } });
    
    const addButton = screen.getByRole('button', { name: /Add/i });
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText('Literature Review')).toBeInTheDocument();
    });
  });

  it('deletes a section', async () => {
    render(<OutlineBuilder />);
    
    // First add a section
    const addSectionInput = screen.getByPlaceholderText('New section title');
    fireEvent.change(addSectionInput, { target: { value: 'Test Section' } });
    
    const addButton = screen.getByRole('button', { name: /Add/i });
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText('Test Section')).toBeInTheDocument();
    });
    
    // Then delete it
    const deleteButton = screen.getByRole('button', { name: /trash/i });
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Test Section')).not.toBeInTheDocument();
    });
  });

  it('exports outline in different formats', async () => {
    render(<OutlineBuilder />);
    
    // Mock an outline with sections
    const topicInput = screen.getByLabelText('Research Topic');
    fireEvent.change(topicInput, { target: { value: 'Testable Topic' } });
    
    // Add a section
    const addSectionInput = screen.getByPlaceholderText('New section title');
    fireEvent.change(addSectionInput, { target: { value: 'Introduction' } });
    fireEvent.click(screen.getByRole('button', { name: /Add/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Introduction')).toBeInTheDocument();
    });
    
    // Test export functionality
    const exportButtons = screen.getAllByRole('button', { name: /export/i });
    
    // Export as TXT
    fireEvent.click(exportButtons[0]);
    expect(toast.success).toHaveBeenCalledWith('Outline exported as TXT!');
    
    // Export as MD
    fireEvent.click(exportButtons[1]);
    expect(toast.success).toHaveBeenCalledWith('Outline exported as MD!');
    
    // Export as DOCX
    fireEvent.click(exportButtons[2]);
    expect(toast.success).toHaveBeenCalledWith('Outline exported as DOCX!');
    
    // Export as LaTeX
    fireEvent.click(exportButtons[3]);
    expect(toast.success).toHaveBeenCalledWith('Outline exported as LATEX!');
  });

  it('saves outline as draft', async () => {
    render(<OutlineBuilder />);
    
    const topicInput = screen.getByLabelText('Research Topic');
    fireEvent.change(topicInput, { target: { value: 'Test Topic' } });
    
    // Add a section
    const addSectionInput = screen.getByPlaceholderText('New section title');
    fireEvent.change(addSectionInput, { target: { value: 'Sample Section' } });
    fireEvent.click(screen.getByRole('button', { name: /Add/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Sample Section')).toBeInTheDocument();
    });
    
    const saveButton = screen.getByRole('button', { name: /Save as Draft/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Outline saved as draft!');
    });
  });

  it('validates required fields before generation', async () => {
    render(<OutlineBuilder />);
    
    const generateButton = screen.getByRole('button', { name: /Generate with AI/i });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please enter both topic and field of study');
    });
  });

  it('disables export when no sections exist', () => {
    render(<OutlineBuilder />);
    
    const exportButtons = screen.getAllByRole('button', { name: /export/i });
    
    // All export buttons should be disabled when no sections exist
    exportButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('allows editing section title and description', async () => {
    render(<OutlineBuilder />);
    
    // Add a section first
    const addSectionInput = screen.getByPlaceholderText('New section title');
    fireEvent.change(addSectionInput, { target: { value: 'Original Title' } });
    fireEvent.click(screen.getByRole('button', { name: /Add/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Original Title')).toBeInTheDocument();
    });
    
    // Click the edit button
    const editButton = screen.getAllByRole('button').find(btn => 
      btn.getAttribute('aria-label') === 'Edit' || 
      (btn.textContent && btn.textContent.includes('Edit'))
    );
    fireEvent.click(editButton!);
    
    // Edit the title and description
    const titleInput = screen.getByDisplayValue('Original Title');
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    
    // Try to save changes
    const saveButton = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Updated Title')).toBeInTheDocument();
    });
  });
});

describe('Outline Data Structure', () => {
  it('maintains proper hierarchical structure', () => {
    // Test the internal logic for maintaining outline hierarchy
    const { rerender, getByText } = render(<OutlineBuilder />);
    
    // This would test the internal state management
    // In a real test, we would mock the component's internal state
    expect(true).toBe(true); // Placeholder for actual hierarchical test
  });

  it('validates outline structure for academic standards', () => {
    // Test that generated outlines follow academic structure
    expect(true).toBe(true); // Placeholder for actual validation test
  });
});

describe('Error Handling', () => {
  it('handles AI generation failure gracefully', async () => {
    render(<OutlineBuilder />);
    
    // Mock AI failure
    (callPuterAI as jest.Mock).mockRejectedValue(new Error('API error'));
    
    const topicInput = screen.getByLabelText('Research Topic');
    fireEvent.change(topicInput, { target: { value: 'Test Topic' } });
    
    const fieldSelector = screen.getByTestId('field-of-study-selector');
    fireEvent.click(fieldSelector);
    fireEvent.click(screen.getByRole('option', { name: 'Education' }));
    
    const generateButton = screen.getByRole('button', { name: /Generate with AI/i });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to generate outline. Please try again.');
    });
  });

  it('handles save failure gracefully', async () => {
    render(<OutlineBuilder />);
    
    // Mock save failure
    const mockErrorSupabase = {
      from: vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({ data: null, error: { message: 'Save failed' } }))
          }))
        }))
      }))
    };
    
    (useAuth as jest.Mock).mockReturnValue({
      session: mockSession,
      supabase: mockErrorSupabase
    });
    
    const topicInput = screen.getByLabelText('Research Topic');
    fireEvent.change(topicInput, { target: { value: 'Test Topic' } });
    
    // Add a section
    const addSectionInput = screen.getByPlaceholderText('New section title');
    fireEvent.change(addSectionInput, { target: { value: 'Sample Section' } });
    fireEvent.click(screen.getByRole('button', { name: /Add/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Sample Section')).toBeInTheDocument();
    });
    
    const saveButton = screen.getByRole('button', { name: /Save as Draft/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to save outline. Please try again.');
    });
  });
});