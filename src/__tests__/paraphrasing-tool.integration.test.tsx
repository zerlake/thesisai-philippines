import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ParaphrasingTool } from '@/components/paraphrasing-tool';
import { useAuth } from '@/components/auth-provider';
import { usePuterAuth } from '@/hooks/use-puter-auth';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/components/auth-provider', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/use-puter-auth', () => ({
  usePuterAuth: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

// Mock the global Puter object
const mockPuterAiChat = vi.fn();
global.window = {
    ...global.window,
    puter: {
        ai: {
            chat: mockPuterAiChat,
        },
    },
    confirm: vi.fn(),
} as any;

// Mock @/components/ui/select
vi.mock('@/components/ui/select', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Select: vi.fn(({ children, value, onValueChange }) => (
      <select data-testid="mock-select" value={value} onChange={(e) => onValueChange(e.target.value)}>
        {children}
      </select>
    )),
    SelectTrigger: vi.fn(({ children }) => <button data-testid="mock-select-trigger">{children}</button>),
    SelectContent: vi.fn(({ children }) => <div data-testid="mock-select-content">{children}</div>),
    SelectItem: vi.fn(({ children, value }) => <option value={value}>{children}</option>),
    SelectValue: vi.fn(({ children }) => <span data-testid="mock-select-value">{children}</span>),
  };
});


describe('ParaphrasingTool Integration Test', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockSession = { user: mockUser };
  const mockSupabase = {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Mock implementations
    (useAuth as jest.Mock).mockReturnValue({
      session: mockSession,
      supabase: mockSupabase,
    });

    (usePuterAuth as jest.Mock).mockReturnValue({
      puterReady: true,
      isAuthenticated: true,
      signIn: vi.fn().mockResolvedValue(undefined),
      checkAuth: vi.fn().mockResolvedValue({ id: 'puter-user-123' }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the component correctly', () => {
    render(<ParaphrasingTool />);
    
    expect(screen.getByText('Paraphrasing Tool')).toBeInTheDocument();
    expect(screen.getByText('Rewrite sentences and paragraphs to improve clarity, vary your language, and avoid plagiarism.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your original text here...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your rewritten text will appear here...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rewrite Text/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Sample/i })).toBeInTheDocument();
  });

  it('allows user to input text', () => {
    render(<ParaphrasingTool />);
    const inputArea = screen.getByPlaceholderText('Enter your original text here...');
    
    fireEvent.change(inputArea, { target: { value: 'This is a test sentence.' } });
    
    expect(inputArea).toHaveValue('This is a test sentence.');
  });

  it('shows a toast error if paraphrasing is attempted with no text', async () => {
    render(<ParaphrasingTool />);
    const rewriteButton = screen.getByRole('button', { name: /Rewrite Text/i });

    fireEvent.click(rewriteButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please enter some text to paraphrase.');
    });
    expect(mockPuterAiChat).not.toHaveBeenCalled();
  });

  it('successfully paraphrases text and displays the result', async () => {
    const inputText = 'This is the original text.';
    const paraphrasedText = 'This text is the original.';
    mockPuterAiChat.mockResolvedValue({ response: paraphrasedText });

    render(<ParaphrasingTool />);

    const inputArea = screen.getByPlaceholderText('Enter your original text here...');
    fireEvent.change(inputArea, { target: { value: inputText } });

    const rewriteButton = screen.getByRole('button', { name: /Rewrite Text/i });
    fireEvent.click(rewriteButton);

    // Check for loading state
    expect(screen.getByRole('button', { name: /Rewrite Text/i })).toBeDisabled();
    // Assuming the loader has a test-id or accessible role
    // For now, we'll just check the button is disabled.
    // If there's a specific loader element, we'd check for it here.

    await waitFor(() => {
      expect(mockPuterAiChat).toHaveBeenCalled();
      expect(screen.getByPlaceholderText('Your rewritten text will appear here...')).toHaveValue(paraphrasedText);
    });

    expect(toast.success).toHaveBeenCalledWith('Text paraphrased successfully!');
    expect(screen.getByRole('button', { name: /Rewrite Text/i })).not.toBeDisabled();
  });

  it('handles AI service error during paraphrasing', async () => {
    const inputText = 'This text will cause an error.';
    const errorMessage = 'AI service failed';
    mockPuterAiChat.mockRejectedValue(new Error(errorMessage));

    render(<ParaphrasingTool />);

    const inputArea = screen.getByPlaceholderText('Enter your original text here...');
    fireEvent.change(inputArea, { target: { value: inputText } });

    const rewriteButton = screen.getByRole('button', { name: /Rewrite Text/i });
    fireEvent.click(rewriteButton);

    await waitFor(() => {
      expect(mockPuterAiChat).toHaveBeenCalled();
    });

    expect(toast.error).toHaveBeenCalledWith(errorMessage);
    expect(screen.getByPlaceholderText('Your rewritten text will appear here...')).toHaveValue('');
  });

  it('handles empty object error from AI service', async () => {
    const inputText = 'This text will cause an empty object error.';
    mockPuterAiChat.mockRejectedValue({});

    render(<ParaphrasingTool />);

    const inputArea = screen.getByPlaceholderText('Enter your original text here...');
    fireEvent.change(inputArea, { target: { value: inputText } });

    const rewriteButton = screen.getByRole('button', { name: /Rewrite Text/i });
    fireEvent.click(rewriteButton);

    await waitFor(() => {
      expect(mockPuterAiChat).toHaveBeenCalled();
    });

    expect(toast.error).toHaveBeenCalledWith('AI service error: Empty response received. Please try again.');
  });

  it('constructs the correct prompt for "formal" mode', async () => {
    const inputText = 'This is some text.';
    mockPuterAiChat.mockResolvedValue({ response: 'Formal version' });

    render(<ParaphrasingTool />);

    const inputArea = screen.getByPlaceholderText('Enter your original text here...');
    fireEvent.change(inputArea, { target: { value: inputText } });

    // Change mode to "formal"
    const modeSelect = screen.getByRole('combobox');
    fireEvent.mouseDown(modeSelect);
    await waitFor(() => screen.getByText('Make More Formal'));
    fireEvent.click(screen.getByText('Make More Formal'));

    const rewriteButton = screen.getByRole('button', { name: /Rewrite Text/i });
    fireEvent.click(rewriteButton);

    await waitFor(() => {
      expect(mockPuterAiChat).toHaveBeenCalledWith(expect.objectContaining({
        prompt: expect.stringContaining('make it more formal')
      }));
    });
  });

  it('copies output text to clipboard', async () => {
    const paraphrasedText = 'This is the output.';
    mockPuterAiChat.mockResolvedValue({ response: paraphrasedText });
    Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
    });

    render(<ParaphrasingTool />);

    // First, generate some output
    const inputArea = screen.getByPlaceholderText('Enter your original text here...');
    fireEvent.change(inputArea, { target: { value: 'some input' } });
    const rewriteButton = screen.getByRole('button', { name: /Rewrite Text/i });
    fireEvent.click(rewriteButton);

    // Wait for output and copy button
    await waitFor(() => {
        expect(screen.getByPlaceholderText('Your rewritten text will appear here...')).toHaveValue(paraphrasedText);
    });
    const copyButton = screen.getByRole('button', { name: /Copy/i });
    fireEvent.click(copyButton);

    await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(paraphrasedText);
        expect(toast.success).toHaveBeenCalledWith('Copied to clipboard!');
    });
  });
});
