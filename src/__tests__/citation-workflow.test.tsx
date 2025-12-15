import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { toast } from 'sonner';
import { AcademicDatabaseService } from '@/lib/academic-database-service';

// Mock the toast library
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  }
}));

// Mock the Puter AI wrapper
vi.mock('@/lib/puter-ai-wrapper', () => ({
  callPuterAI: vi.fn(() => Promise.resolve('Mock AI response')),
}));

// Mock the Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: {}, error: null })),
          eq: vi.fn(() => ({
            single: vi.fn(() => ({ data: {}, error: null }))
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({ data: { id: 'mock-id' }, error: null }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({ data: {}, error: null }))
          }))
        }))
      }))
    })),
    auth: {
      getUser: vi.fn(() => ({ data: { user: { id: 'mock-user-id' } }, error: null }))
    }
  }))
}));

// Mock the auth provider
vi.mock('@/components/auth-provider', () => ({
  useAuth: vi.fn(() => ({
    session: { user: { id: 'mock-user-id' } },
    supabase: {}
  }))
}));

import CitationManager from '@/components/citation-manager';

// Define types for testing
interface MockCitation {
  id: string;
  title: string;
  authors: string[];
  year: number;
  source: string;
  doi?: string;
  isbn?: string;
  sourceType: string;
  style: string;
  content: string;
  tags: string[];
}

// Mock data for tests
const mockCitations: MockCitation[] = [
  {
    id: '1',
    title: 'Sample Research Paper',
    authors: ['Doe, J.', 'Smith, A.'],
    year: 2023,
    source: 'Journal of Academic Research',
    doi: '10.1000/sample.doi',
    sourceType: 'journalArticle',
    style: 'APA 7th',
    content: 'Doe, J., & Smith, A. (2023). Sample Research Paper. Journal of Academic Research.',
    tags: ['research', 'study']
  },
  {
    id: '2',
    title: 'Another Academic Article',
    authors: ['Johnson, B.'],
    year: 2022,
    source: 'Academic Review Quarterly',
    sourceType: 'journalArticle',
    style: 'MLA 9th',
    content: 'Johnson, B. "Another Academic Article." Academic Review Quarterly, 2022.',
    tags: ['review', 'article']
  }
];

const mockCollections = [
  { id: 'col1', name: 'Primary Sources', description: 'Main sources for thesis' },
  { id: 'col2', name: 'Secondary Sources', description: 'Supporting sources' }
];

describe('Citation Manager Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('renders the citation manager interface correctly', () => {
    render(<CitationManager />);
    
    expect(screen.getByText('AI-Powered Citation Manager')).toBeInTheDocument();
    expect(screen.getByText('Generate academic citations with AI assistance')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate with AI/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save as Draft/i })).toBeInTheDocument();
  });

  it('allows users to enter topic and field for AI citation generation', async () => {
    render(<CitationManager />);
    
    // Find the main input fields for citation generation
    const topicInput = screen.getByPlaceholderText('e.g., The Impact of Social Media on Education');
    const fieldSelect = screen.getByTestId('field-of-study-selector'); // Assuming a testid was added
    
    // Interact with the inputs
    fireEvent.change(topicInput, { target: { value: 'AI in Education Research' } });
    fireEvent.click(fieldSelect);
    
    // Wait for potential updates
    await waitFor(() => {
      expect(topicInput).toHaveValue('AI in Education Research');
    });
  });

  it('generates citations using AI when inputs are provided', async () => {
    const mockAIResponse = 'Doe, J., & Smith, A. (2023). AI in Education Research. Journal of Educational Technology, 15(3), 123-145. https://doi.org/10.1000/edu.tech.2023';
    
    (callPuterAI as Mock).mockResolvedValue(mockAIResponse);
    
    render(<CitationManager />);
    
    const topicInput = screen.getByPlaceholderText('e.g., The Impact of Social Media on Education');
    const fieldSelect = screen.getByTestId('field-of-study-selector');
    
    fireEvent.change(topicInput, { target: { value: 'AI in Education Research' } });
    fireEvent.click(fieldSelect);
    fireEvent.click(within(fieldSelect).getByText('Computer Science')); // Assuming this option exists
    
    const generateButton = screen.getByRole('button', { name: /Generate with AI/i });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(callPuterAI).toHaveBeenCalledWith(
        expect.stringContaining('AI in Education Research'),
        expect.any(Object)
      );
      expect(toast.success).toHaveBeenCalledWith('Citation generated and saved!');
    });
  });

  it('displays existing citations from user library', async () => {
    render(<CitationManager />);
    
    // Simulate that there are existing citations in the database
    (supabase.from as Mock).mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: mockCitations,
            error: null
          }))
        }))
      }))
    });
    
    // Wait for the citations to load
    await waitFor(() => {
      expect(screen.getByText('My Citations')).toBeInTheDocument();
    });
    
    // Verify that citations are displayed
    expect(screen.getByText('Sample Research Paper')).toBeInTheDocument();
    expect(screen.getByText('Another Academic Article')).toBeInTheDocument();
  });

  it('allows users to delete a citation', async () => {
    render(<CitationManager />);
    
    // Mock that citations exist
    (supabase.from as Mock).mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: mockCitations,
            error: null
          }))
        }))
      }))
    });
    
    // Wait for the citations to load
    await waitFor(() => {
      expect(screen.getByText('My Citations')).toBeInTheDocument();
    });
    
    // Find the delete button for the first citation
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    const firstDeleteButton = deleteButtons[0];
    
    fireEvent.click(firstDeleteButton);
    
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('citations');
      expect(toast.success).toHaveBeenCalledWith('Citation deleted.');
    });
  });

  it('allows users to copy a citation to clipboard', async () => {
    render(<CitationManager />);
    
    // Mock that citations exist
    (supabase.from as Mock).mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [mockCitations[0]], // Show just the first citation
            error: null
          }))
        }))
      }))
    });
    
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });
    
    // Wait for the citations to load
    await waitFor(() => {
      expect(screen.getByText('My Citations')).toBeInTheDocument();
    });
    
    // Find the copy button for the citation
    const copyButton = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        mockCitations[0].content
      );
      expect(toast.success).toHaveBeenCalledWith('Citation copied to clipboard!');
    });
  });

  it('validates required fields before generating citation', async () => {
    render(<CitationManager />);
    
    const generateButton = screen.getByRole('button', { name: /Generate with AI/i });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please enter a topic for citation generation');
    });
  });

  it('properly handles citation generation errors', async () => {
    (callPuterAI as Mock).mockRejectedValue(new Error('API Error'));
    
    render(<CitationManager />);
    
    const topicInput = screen.getByPlaceholderText('e.g., The Impact of Social Media on Education');
    fireEvent.change(topicInput, { target: { value: 'Test Topic' } });
    
    const fieldSelect = screen.getByTestId('field-of-study-selector');
    fireEvent.click(fieldSelect);
    fireEvent.click(within(fieldSelect).getByText('Computer Science'));
    
    const generateButton = screen.getByRole('button', { name: /Generate with AI/i });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to generate citation: API Error');
    });
  });

  it('loads and displays citations from database', async () => {
    render(<CitationManager />);
    
    // Mock the database response
    const mockCitationsFromDB = [
      {
        id: 'db1',
        content: 'Sample citation from DB',
        style: 'APA 7th',
        imported_from: 'manual',
        original_id: 'db1',
        metadata: {}
      }
    ];
    
    (supabase.from as Mock).mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: mockCitationsFromDB,
            error: null
          }))
        }))
      }))
    });
    
    await waitFor(() => {
      expect(screen.getByText('My Citations')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Sample citation from DB')).toBeInTheDocument();
  });

  it('handles database errors gracefully', async () => {
    render(<CitationManager />);
    
    // Mock an error when fetching citations
    (supabase.from as Mock).mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: null,
            error: { message: 'Database error' }
          }))
        }))
      }))
    });
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to fetch citations.');
    });
  });
});

describe('AcademicDatabaseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock fetch globally for API calls
    global.fetch = vi.fn((url: string) => {
      if (url.includes('crossref.org')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            message: {
              title: ['Sample Paper Title'],
              author: [{ family: 'Doe', given: 'John', sequence: 'first', affiliation: [] }],
              DOI: '10.1000/sample.doi',
              type: 'journal-article',
              issued: { 'date-parts': [[2023]] },
              container_title: ['Journal of Testing'],
              volume: '10',
              issue: '2',
              page: '123-145',
              ISBN: ['978-1234567890'],
              publisher: 'Test Publisher',
              abstract: 'This is a test abstract.'
            }
          })
        } as Response);
      } else if (url.includes('semanticscholar.org')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            data: [
              {
                paperId: 'test-paper-id',
                title: 'Test Paper Title',
                authors: [{ name: 'Test Author' }],
                year: 2023,
                venue: 'Test Venue',
                abstract: 'Test abstract',
                doi: '10.1000/test.doi',
                url: 'https://example.com/test-paper',
                pdf: { url: 'https://example.com/test-paper.pdf' }
              }
            ]
          })
        } as Response);
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({})
      } as Response);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('successfully fetches paper details by DOI', async () => {
    const doi = '10.1000/sample.doi';
    const result = await AcademicDatabaseService.fetchPaperByDOI(doi);
    
    expect(result).toBeDefined();
    expect(result?.title).toBe('Sample Paper Title');
    expect(result?.doi).toBe('10.1000/sample.doi');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(`https://api.crossref.org/works/${encodeURIComponent(doi)}`)
    );
  });

  it('handles DOI not found error', async () => {
    // Mock a 404 response for a non-existent DOI
    (global.fetch as Mock).mockImplementation((url: string) => {
      if (url.includes('crossref.org')) {
        return Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found'
        } as Response);
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    await expect(
      AcademicDatabaseService.fetchPaperByDOI('10.1000/nonexistent.doi')
    ).rejects.toThrow('DOI 10.1000/nonexistent.doi not found in CrossRef database');
  });

  it('searches Semantic Scholar successfully', async () => {
    const query = 'test query';
    const results = await AcademicDatabaseService.searchSemanticScholar(query, 5);
    
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Test Paper Title');
    expect(results[0].doi).toBe('10.1000/test.doi');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('semanticscholar.org')
    );
  });

  it('validates DOI format correctly', () => {
    // Valid DOIs
    expect(AcademicDatabaseService.validateDOI('10.1000/test.doi')).toBe(true);
    expect(AcademicDatabaseService.validateDOI('10.1234/abc.def')).toBe(true);
    expect(AcademicDatabaseService.validateDOI('https://doi.org/10.1000/test.doi')).toBe(true);
    
    // Invalid DOIs
    expect(AcademicDatabaseService.validateDOI('invalid-doi')).toBe(false);
    expect(AcademicDatabaseService.validateDOI('10.test/invalid')).toBe(false);
    expect(AcademicDatabaseService.validateDOI('not a doi')).toBe(false);
  });

  it('normalizes DOI by removing prefixes', () => {
    expect(AcademicDatabaseService.normalizeDOI('https://doi.org/10.1000/test.doi')).toBe('10.1000/test.doi');
    expect(AcademicDatabaseService.normalizeDOI('doi:10.1000/test.doi')).toBe('10.1000/test.doi');
    expect(AcademicDatabaseService.normalizeDOI('10.1000/test.doi')).toBe('10.1000/test.doi');
  });

  it('validates ISBN format correctly', () => {
    // Valid ISBN-10
    expect(AcademicDatabaseService.validateISBN('0-123456-78-9')).toBe(true); // Hyphenated
    expect(AcademicDatabaseService.validateISBN('0123456789')).toBe(true); // Without hyphens
    
    // Valid ISBN-13
    expect(AcademicDatabaseService.validateISBN('978-0-123456-78-9')).toBe(true); // Hyphenated
    expect(AcademicDatabaseService.validateISBN('9780123456789')).toBe(true); // Without hyphens
    
    // Invalid ISBNs
    expect(AcademicDatabaseService.validateISBN('0-123456-78-X')).toBe(false); // Wrong check digit
    expect(AcademicDatabaseService.validateISBN('123456789')).toBe(false); // Too short
    expect(AcademicDatabaseService.validateISBN('1234567890123')).toBe(false); // Too long
    expect(AcademicDatabaseService.validateISBN('invalid-isbn')).toBe(false); // Not numeric
  });
});

describe('Complete Citation Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up basic mocks
    (toast.success as Mock).mockImplementation(() => {});
    (toast.error as Mock).mockImplementation(() => {});
    
    // Mock fetch for database service
    global.fetch = vi.fn((url: string) => {
      if (url.includes('crossref.org')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            message: {
              title: ['Complete Workflow Test'],
              author: [{ family: 'Test', given: 'Workflow', sequence: 'first', affiliation: [] }],
              DOI: '10.1000/workflow.test',
              type: 'journal-article',
              issued: { 'date-parts': [[2023]] },
              container_title: ['Journal of Complete Tests'],
              volume: '1',
              issue: '1',
              page: '1-10',
              ISBN: [],
              publisher: 'Test Publisher',
              abstract: 'Testing the complete workflow.'
            }
          })
        } as Response);
      }
      return Promise.resolve({
        ok: false,
        status: 404
      } as Response);
    });
    
    // Mock Puter AI
    (callPuterAI as Mock).mockResolvedValue('Mock AI generated citation');
    
    // Mock Supabase
    (supabase.from as Mock).mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: 'new-citation-id' },
            error: null
          }))
        }))
      }))
    });
  });

  it('executes complete workflow: fetch DOI -> generate citation -> save', async () => {
    // Step 1: Fetch paper by DOI
    const doi = '10.1000/workflow.test';
    const paperData = await AcademicDatabaseService.fetchPaperByDOI(doi);
    
    expect(paperData).toBeDefined();
    expect(paperData?.title).toBe('Complete Workflow Test');
    
    // Step 2: Generate citation in APA format
    const citationText = await AcademicDatabaseService.getCitationFromDOI(doi, 'apa');
    expect(citationText).toContain('Test, W.');
    
    // Step 3: Simulate the full workflow in the component
    render(<CitationManager />);
    
    const topicInput = screen.getByPlaceholderText('e.g., The Impact of Social Media on Education');
    fireEvent.change(topicInput, { target: { value: 'Complete workflow test' } });
    
    const fieldSelect = screen.getByTestId('field-of-study-selector');
    fireEvent.click(fieldSelect);
    fireEvent.click(within(fieldSelect).getByText('General/Academic'));
    
    const generateButton = screen.getByRole('button', { name: /Generate with AI/i });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(callPuterAI).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('citations');
      expect(toast.success).toHaveBeenCalledWith('Citation generated and saved!');
    });
  });

  it('handles errors gracefully throughout the workflow', async () => {
    // Mock error in Puter AI call
    (callPuterAI as Mock).mockRejectedValue(new Error('AI Service Error'));
    
    render(<CitationManager />);
    
    const topicInput = screen.getByPlaceholderText('e.g., The Impact of Social Media on Education');
    fireEvent.change(topicInput, { target: { value: 'Error test' } });
    
    const fieldSelect = screen.getByTestId('field-of-study-selector');
    fireEvent.click(fieldSelect);
    fireEvent.click(within(fieldSelect).getByText('General/Academic'));
    
    const generateButton = screen.getByRole('button', { name: /Generate with AI/i });
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to generate citation: AI Service Error');
    });
  });
});