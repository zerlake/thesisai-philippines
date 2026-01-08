/**
 * Integration test for ThesisFinalizer component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ThesisFinalizer from '@/components/ThesisFinalizer';

// Mock the Puter AI wrapper
vi.mock('@/lib/puter-ai-wrapper', () => ({
  callPuterAI: vi.fn(),
  callPuterAIWithSDKCheck: vi.fn(),
}));

// Mock the Puter SDK loader
vi.mock('@/lib/puter-sdk-loader', async () => {
  const actual = await vi.importActual('@/lib/puter-sdk-loader');
  return {
    ...actual,
    callPuterAIWithSDKCheck: vi.fn(),
  };
});

// Mock the global window.puter object
const mockPuter = {
  ai: {
    chat: vi.fn(),
  },
  auth: {
    signIn: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
  },
};

// Mock useAuth
vi.mock('@/components/auth-provider', () => ({
  useAuth: vi.fn(() => ({
    profile: {
      id: 'test-user-id',
      plan_type: 'premium',
      subscription_status: 'active',
      role: 'student'
    },
    isLoading: false,
    supabase: {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() => ({ data: { id: 'thesis-123' } }))
          }))
        }))
      }))
    }
  }))
}));

// Mock file creation
const createMockFile = (name: string, content: string, type: string = 'text/plain') => {
  const file = new File([content], name, { type });
  return file;
};

describe('ThesisFinalizer Component', () => {
  beforeEach(() => {
    // Set up the mock window.puter
    Object.defineProperty(window, 'puter', {
      value: mockPuter,
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with initial state', () => {
    render(<ThesisFinalizer />);

    expect(screen.getByText('Thesis Finalizer Pro')).toBeInTheDocument();
    expect(screen.getByText('Select Chapter Files')).toBeInTheDocument();
    expect(screen.getByText('Upload your thesis chapters and let our multi-agent AI system polish them into a cohesive final draft.')).toBeInTheDocument();
  });

  it('allows file selection', async () => {
    render(<ThesisFinalizer />);

    // Find the button instead of the label since the input is hidden
    const selectButton = screen.getByText('Select Chapter Files');
    const mockFile = createMockFile('chapter1.txt', 'This is chapter 1 content');

    // Create a mock event with files
    const mockEvent = {
      target: {
        files: [mockFile]
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    // Get the hidden input element by its ID
    const fileInput = screen.getByTestId('chapter-files-upload') as HTMLInputElement;

    // Fire the change event
    fireEvent.change(fileInput, mockEvent);

    await waitFor(() => {
      expect(screen.getByText('1 files selected')).toBeInTheDocument();
    });
  });

  it('shows error when less than 3 files are uploaded', () => {
    render(<ThesisFinalizer />);

    // Mock window.alert to capture the alert
    const alertSpy = vi.fn();
    window.alert = alertSpy;

    // Get the hidden input element by its ID
    const fileInput = screen.getByTestId('chapter-files-upload') as HTMLInputElement;
    const mockFile1 = createMockFile('chapter1.txt', 'This is chapter 1 content');
    const mockFile2 = createMockFile('chapter2.txt', 'This is chapter 2 content');

    // Create a mock event with files
    const mockEvent = {
      target: {
        files: [mockFile1, mockFile2]
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    fireEvent.change(fileInput, mockEvent);

    // Check that the button is disabled when less than 3 files are selected
    const finalizeButton = screen.getByText('Finalize 2 Chapters with Multi-Agent AI');
    expect(finalizeButton).toBeDisabled();
  });

  it('processes files when 3 or more are uploaded', async () => {
    const { callPuterAI } = await import('@/lib/puter-ai-wrapper');

    // Mock the AI responses
    vi.mocked(callPuterAI)
      .mockResolvedValueOnce('{"agents": [{"name": "CoherenceAgent", "prompt": "Check logical flow", "context": "chapter1+chapter2"}, {"name": "StyleAgent", "prompt": "Harmonize voice, tense, formatting (APA/MLA)", "context": "chapter1+chapter2"}, {"name": "CitationAgent", "prompt": "Fix/validate all citations, add missing ones", "context": "chapter1+chapter2"}, {"name": "StrengthAgent", "prompt": "Identify weak sections, suggest improvements", "context": "chapter1+chapter2"}, {"name": "PolishAgent", "prompt": "Final grammar, clarity, academic tone pass", "context": "chapter1+chapter2"}, {"name": "SummaryAgent", "prompt": "Generate abstract, keywords, conclusion synthesis", "context": "chapter1+chapter2"}]}') // Orchestrator response
      .mockResolvedValueOnce('Coherence analysis result') // Coherence agent
      .mockResolvedValueOnce('Style harmonization result') // Style agent
      .mockResolvedValueOnce('Citation validation result') // Citation agent
      .mockResolvedValueOnce('Strength analysis result') // Strength agent
      .mockResolvedValueOnce('Polish result') // Polish agent
      .mockResolvedValueOnce('Summary result') // Summary agent
      .mockResolvedValueOnce('Final integrated thesis draft'); // Final integrator

    render(<ThesisFinalizer />);

    // Get the hidden input element by its ID
    const fileInput = screen.getByTestId('chapter-files-upload') as HTMLInputElement;
    const mockFile1 = createMockFile('chapter1.txt', 'This is chapter 1 content');
    const mockFile2 = createMockFile('chapter2.txt', 'This is chapter 2 content');
    const mockFile3 = createMockFile('chapter3.txt', 'This is chapter 3 content');

    // Create a mock event with files
    const mockEvent = {
      target: {
        files: [mockFile1, mockFile2, mockFile3]
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    fireEvent.change(fileInput, mockEvent);

    const finalizeButton = screen.getByText('Finalize 3 Chapters with Multi-Agent AI');
    fireEvent.click(finalizeButton);

    // Wait for the process to complete
    await waitFor(() => {
      expect(screen.getByText('Final Draft Preview:')).toBeInTheDocument();
    });

    // Check that the final draft is displayed (the actual result may vary based on the mock)
    expect(screen.getByText('Final integrated thesis draft')).toBeInTheDocument();
  });

  it('handles errors gracefully', async () => {
    const { callPuterAI } = await import('@/lib/puter-ai-wrapper');

    // Mock the orchestrator response and then an error in the final integrator call
    vi.mocked(callPuterAI)
      .mockResolvedValueOnce('{"agents": [{"name": "CoherenceAgent", "prompt": "Check logical flow", "context": "chapter1+chapter2"}, {"name": "StyleAgent", "prompt": "Harmonize voice, tense, formatting (APA/MLA)", "context": "chapter1+chapter2"}, {"name": "CitationAgent", "prompt": "Fix/validate all citations, add missing ones", "context": "chapter1+chapter2"}, {"name": "StrengthAgent", "prompt": "Identify weak sections, suggest improvements", "context": "chapter1+chapter2"}, {"name": "PolishAgent", "prompt": "Final grammar, clarity, academic tone pass", "context": "chapter1+chapter2"}, {"name": "SummaryAgent", "prompt": "Generate abstract, keywords, conclusion synthesis", "context": "chapter1+chapter2"}]}') // Orchestrator response
      .mockResolvedValueOnce('Coherence analysis result') // Coherence agent
      .mockResolvedValueOnce('Style harmonization result') // Style agent
      .mockResolvedValueOnce('Citation validation result') // Citation agent
      .mockResolvedValueOnce('Strength analysis result') // Strength agent
      .mockResolvedValueOnce('Polish result') // Polish agent
      .mockResolvedValueOnce('Summary result') // Summary agent
      .mockRejectedValueOnce(new Error('AI service unavailable')); // Final integrator error

    render(<ThesisFinalizer />);

    // Get the hidden input element by its ID
    const fileInput = screen.getByTestId('chapter-files-upload') as HTMLInputElement;
    const mockFile1 = createMockFile('chapter1.txt', 'This is chapter 1 content');
    const mockFile2 = createMockFile('chapter2.txt', 'This is chapter 2 content');
    const mockFile3 = createMockFile('chapter3.txt', 'This is chapter 3 content');

    // Create a mock event with files
    const mockEvent = {
      target: {
        files: [mockFile1, mockFile2, mockFile3]
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    fireEvent.change(fileInput, mockEvent);

    const finalizeButton = screen.getByText('Finalize 3 Chapters with Multi-Agent AI');
    fireEvent.click(finalizeButton);

    // Wait for the error to be displayed
    await waitFor(() => {
      // Logic: partial match for "Error occurred"
      const errorElement = screen.getByText(/Error occurred/i);
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent('AI service unavailable');
    });
  });

  it('allows downloading the final draft', async () => {
    const { callPuterAI } = await import('@/lib/puter-ai-wrapper');

    // Mock successful responses
    vi.mocked(callPuterAI)
      .mockResolvedValueOnce('{"agents": [{"name": "CoherenceAgent", "prompt": "Check logical flow", "context": "chapter1+chapter2"}]}')
      .mockResolvedValueOnce('Coherence analysis result')
      .mockResolvedValueOnce('Style harmonization result')
      .mockResolvedValueOnce('Citation validation result')
      .mockResolvedValueOnce('Strength analysis result')
      .mockResolvedValueOnce('Polish result')
      .mockResolvedValueOnce('Summary result')
      .mockResolvedValueOnce('Final integrated thesis draft');

    render(<ThesisFinalizer />);

    // Get the hidden input element by its ID
    const fileInput = screen.getByTestId('chapter-files-upload') as HTMLInputElement;
    const mockFile1 = createMockFile('chapter1.txt', 'This is chapter 1 content');
    const mockFile2 = createMockFile('chapter2.txt', 'This is chapter 2 content');
    const mockFile3 = createMockFile('chapter3.txt', 'This is chapter 3 content');

    // Create a mock event with files
    const mockEvent = {
      target: {
        files: [mockFile1, mockFile2, mockFile3]
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    fireEvent.change(fileInput, mockEvent);

    const finalizeButton = screen.getByText('Finalize 3 Chapters with Multi-Agent AI');
    fireEvent.click(finalizeButton);

    // Wait for the final draft to be generated
    await waitFor(() => {
      expect(screen.getByText('Final Draft Preview:')).toBeInTheDocument();
    });

    // Check that download button is available
    const downloadButton = screen.getByText('Download Draft');
    expect(downloadButton).toBeInTheDocument();

    // Mock URL.createObjectURL and document.body.appendChild
    const originalCreateObjectURL = URL.createObjectURL;
    const originalAppendChild = document.body.appendChild;

    const createObjectURLMock = vi.fn(() => 'mock-url');
    const appendChildMock = vi.fn();

    URL.createObjectURL = createObjectURLMock;
    document.body.appendChild = appendChildMock;

    fireEvent.click(downloadButton);

    // Restore original functions
    URL.createObjectURL = originalCreateObjectURL;
    document.body.appendChild = originalAppendChild;
  });

  it('allows copying the final draft to clipboard', async () => {
    const { callPuterAI } = await import('@/lib/puter-ai-wrapper');

    // Mock successful responses
    vi.mocked(callPuterAI)
      .mockResolvedValueOnce('{"agents": [{"name": "CoherenceAgent", "prompt": "Check logical flow", "context": "chapter1+chapter2"}]}')
      .mockResolvedValueOnce('Coherence analysis result')
      .mockResolvedValueOnce('Style harmonization result')
      .mockResolvedValueOnce('Citation validation result')
      .mockResolvedValueOnce('Strength analysis result')
      .mockResolvedValueOnce('Polish result')
      .mockResolvedValueOnce('Summary result')
      .mockResolvedValueOnce('Final integrated thesis draft');

    render(<ThesisFinalizer />);

    // Get the hidden input element by its ID
    const fileInput = screen.getByTestId('chapter-files-upload') as HTMLInputElement;
    const mockFile1 = createMockFile('chapter1.txt', 'This is chapter 1 content');
    const mockFile2 = createMockFile('chapter2.txt', 'This is chapter 2 content');
    const mockFile3 = createMockFile('chapter3.txt', 'This is chapter 3 content');

    // Create a mock event with files
    const mockEvent = {
      target: {
        files: [mockFile1, mockFile2, mockFile3]
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    fireEvent.change(fileInput, mockEvent);

    const finalizeButton = screen.getByText('Finalize 3 Chapters with Multi-Agent AI');
    fireEvent.click(finalizeButton);

    // Wait for the final draft to be generated
    await waitFor(() => {
      expect(screen.getByText('Final Draft Preview:')).toBeInTheDocument();
    });

    // Check that copy button is available
    const copyButton = screen.getByText('Copy to Clipboard');
    expect(copyButton).toBeInTheDocument();

    // Mock clipboard API
    const writeTextMock = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    fireEvent.click(copyButton);

    expect(writeTextMock).toHaveBeenCalledWith('Final integrated thesis draft');
  });
});