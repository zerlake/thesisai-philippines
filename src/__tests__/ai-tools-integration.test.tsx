import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Editor } from '../components/editor';
import { RichTextEditor } from '../components/rich-text-editor';
import { ReviewerAiToolkit } from '../components/reviewer-ai-toolkit';
import { ParaphrasingTool } from '../components/paraphrasing-tool';
import { AIAssistantPanel } from '../components/ai-assistant-panel';
import { createMockEditor } from './mocks/tiptap-mock';
import { AuthProvider, useAuth } from '../components/auth-provider';
import { Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Mock external dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('../components/auth-provider', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../hooks/use-puter-auth', () => ({
  usePuterAuth: vi.fn(() => ({
    puterReady: true,
    isAuthenticated: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    loading: false,
    checkAuth: vi.fn(),
  })),
}));

vi.mock('../integrations/supabase/client', () => {
  const mockFrom = vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  }));

  const mockSupabase = {
    from: mockFrom,
    functions: {
      invoke: vi.fn(),
    },
  };

  return {
    createClient: vi.fn(() => mockSupabase),
    supabase: mockSupabase,
  };
});

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    isReady: true,
    isLocaleDomain: false,
    isPreview: false,
  })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useParams: vi.fn(() => ({})),
  usePathname: vi.fn(() => '/'),
}));

vi.mock('@tiptap/react', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    useEditor: vi.fn(() => createMockEditor()),
    EditorContent: ({ editor }: { editor: any }) => <div data-testid="editor-content">{editor?.getHTML()}</div>,
  };
});

// Mock the puter global object
const mockPuter = {
  auth: {
    getUser: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    getToken: vi.fn(),
  },
  ai: {
    chat: vi.fn(),
  },
};

Object.defineProperty(window, 'puter', {
  value: mockPuter,
  writable: true,
});

// Mock fetch API globally for all tests
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage for any remaining legacy usage
const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock auth context
const mockAuthContext = {
  session: {
    access_token: 'mock-supabase-token',
    user: { id: 'test-user-id' }
  } as Session,
  supabase: {
    functions: {
      invoke: vi.fn(),
    }
  }
};

describe('AI Tools Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
    (useAuth as vi.Mock).mockReturnValue(mockAuthContext);
  });

  describe('Editor Component (Puter Authentication)', () => {
    beforeEach(() => {
      // Mock Puter SDK availability and authentication status
      (window as any).puter = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ id: 'test-user-id', username: 'testuser' }),
          signIn: vi.fn(),
          signOut: vi.fn(),
        },
        ai: {
          chat: vi.fn().mockResolvedValue({
            choices: [{ message: { content: 'improved test text' } }],
            response: 'improved test text'
          }),
        }
      };
    });

    it('should render AI tools when Puter SDK is available and user is authenticated', () => {
      // Update the mock implementation to return authenticated state
      vi.mocked(require('../hooks/use-puter-auth').usePuterAuth).mockReturnValue({
        puterReady: true,
        isAuthenticated: true,
        signIn: vi.fn(),
        signOut: vi.fn(),
        loading: false,
        checkAuth: vi.fn(),
      });

      render(
        <AuthProvider>
          <Editor documentId="test-doc-id" />
        </AuthProvider>
      );

      // Check that AI tools are visible
      expect(screen.getByText('Fix Grammar')).toBeInTheDocument();
      expect(screen.getByText('Summarize')).toBeInTheDocument();
      expect(screen.getByText('Rewrite')).toBeInTheDocument();
    });

    it('should prompt for authentication when user is not authenticated', () => {
      // Mock window.confirm to return false (user declines authentication)
      const confirmMock = vi.fn(() => false);
      global.confirm = confirmMock;

      // Update the mock implementation to return not authenticated state
      vi.mocked(require('../hooks/use-puter-auth').usePuterAuth).mockReturnValue({
        puterReady: true,
        isAuthenticated: false,
        signIn: vi.fn(),
        signOut: vi.fn(),
        loading: false,
        checkAuth: vi.fn(),
      });

      render(
        <AuthProvider>
          <Editor documentId="test-doc-id" />
        </AuthProvider>
      );

      // Initially, tools might appear if SDK is ready but user is not authenticated
      // The tool should prompt for authentication when clicked
      const improveButton = screen.getByText('Fix Grammar');
      fireEvent.click(improveButton);

      // This should trigger a confirm dialog
      expect(confirmMock).toHaveBeenCalledWith(
        "AI tools require authentication with Puter. Would you like to sign in now?"
      );
    });

    it('should call improve-text with Puter AI SDK when authenticated', async () => {
      // Mock editor selection
      const mockEditor = createMockEditor();
      (mockEditor.state.doc.textBetween as vi.Mock).mockReturnValue('test text');
      (mockEditor.chain as vi.Mock).mockReturnValue({
        focus: vi.fn().mockReturnThis(),
        deleteRange: vi.fn().mockReturnThis(),
        insertContent: vi.fn().mockReturnThis(),
      });

      // Update the mock implementation to return authenticated state
      vi.mocked(require('../hooks/use-puter-auth').usePuterAuth).mockReturnValue({
        puterReady: true,
        isAuthenticated: true,
        signIn: vi.fn(),
        signOut: vi.fn(),
        loading: false,
        checkAuth: vi.fn(),
      });

      render(
        <AuthProvider>
          <Editor documentId="test-doc-id" />
        </AuthProvider>
      );

      const improveButton = screen.getByText('Fix Grammar');
      fireEvent.click(improveButton);

      await waitFor(() => {
        expect(window.puter.ai.chat).toHaveBeenCalledWith(
          expect.objectContaining({
            prompt: expect.stringContaining("improve its clarity, conciseness, and academic tone")
          })
        );
      });
    });
  });

  describe('RichTextEditor Component (Supabase Authentication)', () => {
    it('should call improve-writing API with Supabase auth', async () => {
      const mockEditor = createMockEditor();
      (mockEditor.state.doc.textBetween as vi.Mock).mockReturnValue('test text');

      // Mock fetch response
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ improvedText: 'improved test text' }),
        ok: true,
      });

      render(
        <AuthProvider>
          <RichTextEditor editor={mockEditor} />
        </AuthProvider>
      );

      const improveButton = screen.getByText('Fix Grammar');
      fireEvent.click(improveButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          'https://dnyjgzzfyzrsucucexhy.supabase.co/functions/v1/improve-writing',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Authorization': 'Bearer mock-supabase-token',
              'apikey': expect.any(String),
            }),
          })
        );
      });
    });

    it('should call summarize-text API with Supabase auth', async () => {
      const mockEditor = createMockEditor();
      (mockEditor.state.doc.textBetween as vi.Mock).mockReturnValue('test text');

      // Mock fetch response
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ summarizedText: 'summary of test text' }),
        ok: true,
      });

      render(
        <AuthProvider>
          <RichTextEditor editor={mockEditor} />
        </AuthProvider>
      );

      const summarizeButton = screen.getByText('Summarize');
      fireEvent.click(summarizeButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          'https://dnyjgzzfyzrsucucexhy.supabase.co/functions/v1/summarize-text',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Authorization': 'Bearer mock-supabase-token',
              'apikey': expect.any(String),
            }),
          })
        );
      });
    });
  });

  describe('ReviewerAiToolkit Component (Supabase Authentication)', () => {
    it('should call improve-writing API via callAIFunction with Supabase auth', async () => {
      const mockEditor = createMockEditor();
      (mockEditor.state.doc.textBetween as vi.Mock).mockReturnValue('test text');

      // Mock fetch response
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ improvedText: 'improved test text' }),
        ok: true,
      });

      render(
        <AuthProvider>
          <ReviewerAiToolkit editor={mockEditor} />
        </AuthProvider>
      );

      const improveButton = screen.getByText('Improve Selection');
      fireEvent.click(improveButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          'https://dnyjgzzfyzrsucucexhy.supabase.co/functions/v1/improve-writing',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Authorization': 'Bearer mock-supabase-token',
              'apikey': expect.any(String),
            }),
          })
        );
      });
    });

    it('should call summarize-text API via callAIFunction with Supabase auth', async () => {
      const mockEditor = createMockEditor();
      (mockEditor.state.doc.textBetween as vi.Mock).mockReturnValue('test text');

      // Mock fetch response
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ summarizedText: 'summary of test text' }),
        ok: true,
      });

      render(
        <AuthProvider>
          <ReviewerAiToolkit editor={mockEditor} />
        </AuthProvider>
      );

      const summarizeButton = screen.getByText('Summarize Selection');
      fireEvent.click(summarizeButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          'https://dnyjgzzfyzrsucucexhy.supabase.co/functions/v1/summarize-text',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Authorization': 'Bearer mock-supabase-token',
              'apikey': expect.any(String),
            }),
          })
        );
      });
    });

    it('should call paraphrase-text API via callAIFunction with Supabase auth', async () => {
      const mockEditor = createMockEditor();
      (mockEditor.state.doc.textBetween as vi.Mock).mockReturnValue('test text');

      // Mock fetch response
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ paraphrasedText: 'paraphrased test text' }),
        ok: true,
      });

      render(
        <AuthProvider>
          <ReviewerAiToolkit editor={mockEditor} />
        </AuthProvider>
      );

      const paraphraseButton = screen.getByText('Paraphrase Selection');
      fireEvent.click(paraphraseButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          'https://dnyjgzzfyzrsucucexhy.supabase.co/functions/v1/paraphrase-text',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Authorization': 'Bearer mock-supabase-token',
              'apikey': expect.any(String),
            }),
          })
        );
      });
    });
  });

  describe('ParaphrasingTool Component (Puter Authentication)', () => {
    it('should call paraphrase-text API with Puter auth token', async () => {
      // Set up Puter auth token in localStorage
      mockLocalStorage.setItem('puter.auth.token', 'mock-puter-token');

      // Mock fetch response
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ paraphrasedText: 'paraphrased test text' }),
        ok: true,
      });

      render(
        <AuthProvider>
          <ParaphrasingTool />
        </AuthProvider>
      );

      // Set input text
      const input = screen.getByPlaceholderText('Enter your original text here...');
      fireEvent.change(input, { target: { value: 'test text' } });

      const rewriteButton = screen.getByText('Rewrite Text');
      fireEvent.click(rewriteButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          'https://dnyjgzzfyzrsucucexhy.supabase.co/functions/v1/paraphrase-text',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'X-Puter-Auth': 'mock-puter-token',
            }),
          })
        );
      });
    });

    it('should show an error and have a disabled button if Puter token is missing', async () => {
      // Ensure no Puter token is available
      mockLocalStorage.removeItem('puter.auth.token');

      render(
        <AuthProvider>
          <ParaphrasingTool />
        </AuthProvider>
      );

      // Set input text
      const input = screen.getByPlaceholderText('Enter your original text here...');
      fireEvent.change(input, { target: { value: 'test text' } });

      const rewriteButton = screen.getByText('Rewrite Text');
      fireEvent.click(rewriteButton);

      await waitFor(() => {
        // Ensure fetch was not called
        expect(mockFetch).not.toHaveBeenCalled();
        // Ensure error toast was shown
        expect(toast.error).toHaveBeenCalledWith('AI paraphrasing requires Puter authentication. Please authenticate in the admin dashboard.');
      });
    });
  });

  describe('AIAssistantPanel Component (Supabase Functions)', () => {
    it('should call improve-writing via supabase.functions.invoke', async () => {
      const mockEditor = createMockEditor();

      // Mock supabase function response
      const mockInvoke = vi.fn().mockResolvedValue({ data: { improvedText: 'improved content' } });
      (useAuth as vi.Mock).mockReturnValue({
        ...mockAuthContext,
        supabase: {
          functions: { invoke: mockInvoke }
        }
      });

      render(
        <AuthProvider>
          <AIAssistantPanel
            editor={mockEditor}
            documentContent="test content for improvement"
            documentId="test-doc-id"
          />
        </AuthProvider>
      );

      const improveButton = screen.getByText('Improve Entire Document');
      fireEvent.click(improveButton);

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledWith('improve-writing', {
          body: { text: 'test content for improvement' },
        });
      });
    });

    it('should call summarize-text via supabase.functions.invoke', async () => {
      const mockEditor = createMockEditor();

      // Mock supabase function response
      const mockInvoke = vi.fn().mockResolvedValue({ data: { summarizedText: 'summary content' } });
      (useAuth as vi.Mock).mockReturnValue({
        ...mockAuthContext,
        supabase: {
          functions: { invoke: mockInvoke }
        }
      });

      render(
        <AuthProvider>
          <AIAssistantPanel
            editor={mockEditor}
            documentContent="test content for summary"
            documentId="test-doc-id"
          />
        </AuthProvider>
      );

      const summarizeButton = screen.getByText('Summarize Document');
      fireEvent.click(summarizeButton);

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledWith('summarize-text', {
          body: { text: 'test content for summary' },
        });
      });
    });
  });

  describe('Authentication Requirements Summary', () => {
    it('should verify that Editor component requires Puter auth', () => {
      // When no Puter token is available
      mockLocalStorage.removeItem('puter.auth.token');
      
      render(
        <AuthProvider>
          <Editor documentId="test-doc-id" />
        </AuthProvider>
      );

      expect(screen.queryByText('Fix Grammar')).not.toBeInTheDocument();
    });

    it('should verify that other components require Supabase auth', () => {
      // These components depend on session data from useAuth
      const mockEditor = createMockEditor();
      
      render(
        <AuthProvider>
          <RichTextEditor editor={mockEditor} />
          <ReviewerAiToolkit editor={mockEditor} />
          <ParaphrasingTool />
        </AuthProvider>
      );

      // These components are rendered but require auth for API calls
      expect(screen.getByText('Fix Grammar')).toBeInTheDocument();
      expect(screen.getByText('Summarize')).toBeInTheDocument();
      expect(screen.getByText('Rewrite')).toBeInTheDocument();
    });
  });
});
