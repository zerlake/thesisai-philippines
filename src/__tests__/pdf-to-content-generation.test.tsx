import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { vi, Mock, beforeEach, describe, expect, it, afterEach } from 'vitest';
import PDFToContentGeneratorWithCitations from '@/components/pdf-to-content-generator-with-citations';
import { processMultiplePDFs, ExtractedPDFContent } from '@/lib/pdf-parser';
import { generateContentFromPDFs, GeneratedContentResult } from '@/lib/pdf-content-generation-service';
import { callPuterAI } from '@/lib/puter-ai-wrapper';

// Mock the PDF parsing and content generation functions
vi.mock('@/lib/pdf-parser', () => ({
  processMultiplePDFs: vi.fn(),
  extractTextFromPDF: vi.fn(),
  extractMetadataFromPDF: vi.fn(),
  identifySections: vi.fn(),
  extractKeywords: vi.fn(),
  generateSummary: vi.fn(),
  PDFMetadata: vi.fn(),
  ExtractedPDFContent: vi.fn(),
}));

vi.mock('@/lib/pdf-content-generation-service', () => ({
  generateContentFromPDFs: vi.fn(),
  ContentGenerationParams: vi.fn(),
  GeneratedContentResult: vi.fn(),
  Citation: vi.fn(),
  PDFContentGenerationService: vi.fn(),
  pdfContentGenerationService: vi.fn(),
}));

vi.mock('@/lib/puter-ai-wrapper', () => ({
  callPuterAI: vi.fn(),
}));

vi.mock('sonner', async () => {
  const actual = await vi.importActual('sonner');
  return {
    ...actual,
    toast: {
      success: vi.fn(),
      error: vi.fn(),
      loading: vi.fn(),
    },
  };
});

// Create a mock file for testing
const createMockFile = (name: string, size: number, type: string = 'application/pdf'): File => {
  const file = new File([''], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

// Mock PDF content for testing
const mockExtractedContent: ExtractedPDFContent[] = [
  {
    id: 'mock-paper-1',
    metadata: {
      title: 'Machine Learning in Education',
      author: 'Smith, J.',
      year: 2023,
      creationDate: '2023-05-15',
      modificationDate: '2023-05-15',
      pageCount: 10,
      fileSize: 1234567
    },
    textContent: 'This is the text content of the first research paper. It contains important findings about machine learning applications in educational settings...',
    sections: [
      {
        title: 'Introduction',
        content: 'The introduction section describes the research problem and objectives...',
        pageNumber: 1
      },
      {
        title: 'Methodology',
        content: 'The methodology section details the research approach and data collection methods...',
        pageNumber: 4
      }
    ],
    keywords: ['machine learning', 'education', 'AI', 'learning analytics'],
    summary: 'This paper explores the application of machine learning techniques in educational environments...'
  }
];

// Mock generated content
const mockGeneratedContent: GeneratedContentResult = {
  content: 'This is the generated literature review content based on the selected papers...',
  citations: [
    {
      id: 'cit-1',
      title: 'Machine Learning in Education',
      authors: ['Smith, J.'],
      year: 2023,
      citationText: 'Smith, J. (2023). Machine Learning in Education.',
      sourcePaperId: 'mock-paper-1'
    }
  ],
  sourcesUsed: ['mock-paper-1'],
  qualityScore: 85,
  generationParams: {
    contentType: 'literature_review',
    length: 'medium',
    citationStyle: 'apa'
  }
};

describe('PDFToContentGeneratorWithCitations', () => {
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
    (processMultiplePDFs as Mock).mockResolvedValue(mockExtractedContent);
    (generateContentFromPDFs as Mock).mockResolvedValue(mockGeneratedContent);
    (callPuterAI as Mock).mockResolvedValue(mockGeneratedContent.content);
  });

  it('renders the main components correctly', () => {
    render(<PDFToContentGeneratorWithCitations userId={mockUserId} />);

    // Check for main headings
    expect(screen.getByText('PDF-to-Content Generation')).toBeInTheDocument();
    expect(screen.getByText('Upload Research Papers')).toBeInTheDocument();
    expect(screen.getByText('Research Paper Collections')).toBeInTheDocument();
    expect(screen.getByText('Generate Content from Papers')).toBeInTheDocument();
  });

  it('allows PDF upload and processes the files', async () => {
    render(<PDFToContentGeneratorWithCitations userId={mockUserId} />);

    // Find the file input
    const fileInput = screen.getByLabelText(/browse files/i) as HTMLInputElement;
    
    // Create a mock PDF file
    const mockFile = createMockFile('test-paper.pdf', 1234567);
    
    // Simulate file selection
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    // Wait for processing
    await waitFor(() => {
      expect(processMultiplePDFs).toHaveBeenCalledWith([mockFile]);
    });

    // Verify that the PDF was processed
    expect(screen.getByText(/test-paper.pdf/i)).toBeInTheDocument();
  });

  it('allows collection creation', async () => {
    render(<PDFToContentGeneratorWithCitations userId={mockUserId} />);

    // Click the "New Collection" button
    const newCollectionBtn = screen.getByRole('button', { name: /new collection/i });
    fireEvent.click(newCollectionBtn);

    // Find and fill the collection name input
    const collectionNameInput = screen.getByLabelText(/collection name/i);
    fireEvent.change(collectionNameInput, { target: { value: 'Test Collection' } });

    // Find and fill the description input
    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } });

    // Click the create button
    const createBtn = screen.getByRole('button', { name: /create collection/i });
    fireEvent.click(createBtn);

    // Verify the collection was created
    await waitFor(() => {
      expect(screen.getByText('Test Collection')).toBeInTheDocument();
    });
  });

  it('allows paper selection for content generation', async () => {
    render(<PDFToContentGeneratorWithCitations userId={mockUserId} />);

    // Mock the PDF upload to populate the library
    const fileInput = screen.getByLabelText(/browse files/i) as HTMLInputElement;
    const mockFile = createMockFile('test-paper.pdf', 1234567);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText('Machine Learning in Education')).toBeInTheDocument();
    });

    // Find and click the checkbox to select the paper
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // Verify the paper is selected
    expect(checkbox).toBeChecked();
  });

  it('generates content when generate button is clicked', async () => {
    render(<PDFToContentGeneratorWithCitations userId={mockUserId} />);

    // Mock the PDF upload
    const fileInput = screen.getByLabelText(/browse files/i) as HTMLInputElement;
    const mockFile = createMockFile('test-paper.pdf', 1234567);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText('Machine Learning in Education')).toBeInTheDocument();
    });

    // Select the paper
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // Click the generate button
    const generateBtn = screen.getByRole('button', { name: /generate content/i });
    fireEvent.click(generateBtn);

    // Wait for content generation
    await waitFor(() => {
      expect(generateContentFromPDFs).toHaveBeenCalled();
    });

    // Verify the generated content is displayed
    expect(screen.getByText('Generated Content')).toBeInTheDocument();
    expect(screen.getByText(mockGeneratedContent.content)).toBeInTheDocument();
  });

  it('allows content regeneration', async () => {
    render(<PDFToContentGeneratorWithCitations userId={mockUserId} />);

    // Mock the PDF upload
    const fileInput = screen.getByLabelText(/browse files/i) as HTMLInputElement;
    const mockFile = createMockFile('test-paper.pdf', 1234567);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText('Machine Learning in Education')).toBeInTheDocument();
    });

    // Select the paper and generate content
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /generate content/i }));

    await waitFor(() => {
      expect(screen.getByText('Generated Content')).toBeInTheDocument();
    });

    // Click the regenerate button
    const regenerateBtn = screen.getByRole('button', { name: /regenerate/i });
    fireEvent.click(regenerateBtn);

    // Verify that generateContentFromPDFs was called again
    await waitFor(() => {
      expect(generateContentFromPDFs).toHaveBeenCalledTimes(2);
    });
  });

  it('displays citations in the specified style', async () => {
    render(<PDFToContentGeneratorWithCitations userId={mockUserId} />);

    // Mock the PDF upload
    const fileInput = screen.getByLabelText(/browse files/i) as HTMLInputElement;
    const mockFile = createMockFile('test-paper.pdf', 1234567);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText('Machine Learning in Education')).toBeInTheDocument();
    });

    // Select the paper and generate content
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /generate content/i }));

    await waitFor(() => {
      expect(screen.getByText('Generated Content')).toBeInTheDocument();
    });

    // Verify citations are displayed
    expect(screen.getByText('References')).toBeInTheDocument();
    expect(screen.getByText('Machine Learning in Education')).toBeInTheDocument();
  });

  it('allows changing content type and length', async () => {
    render(<PDFToContentGeneratorWithCitations userId={mockUserId} />);

    // Select content type
    const literatureReviewRadio = screen.getByLabelText(/lit\. review/i);
    fireEvent.click(literatureReviewRadio);
    expect(literatureReviewRadio).toBeChecked();

    // Select content length
    const mediumRadio = screen.getByLabelText(/medium/i);
    fireEvent.click(mediumRadio);
    expect(mediumRadio).toBeChecked();

    // Select citation style
    const citationStyleSelect = screen.getByRole('combobox');
    fireEvent.mouseDown(citationStyleSelect);
    
    const apaOption = await screen.findByText('APA');
    fireEvent.click(apaOption);

    // Verify selections
    expect(screen.getByText('APA')).toBeInTheDocument();
  });

  it('shows error when no papers are selected for generation', async () => {
    render(<PDFToContentGeneratorWithCitations userId={mockUserId} />);

    // Click the generate button without selecting papers
    const generateBtn = screen.getByRole('button', { name: /generate content/i });
    fireEvent.click(generateBtn);

    // Verify error handling
    await waitFor(() => {
      expect(screen.getByText(/please select at least one paper/i)).toBeInTheDocument();
    });
  });

  it('handles PDF processing errors gracefully', async () => {
    // Mock an error during PDF processing
    (processMultiplePDFs as Mock).mockRejectedValue(new Error('Failed to process PDF'));

    render(<PDFToContentGeneratorWithCitations userId={mockUserId} />);

    // Simulate file upload that will fail
    const fileInput = screen.getByLabelText(/browse files/i) as HTMLInputElement;
    const mockFile = createMockFile('test-paper.pdf', 1234567);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    // Wait for error handling
    await waitFor(() => {
      expect(screen.getByText(/failed to process pdfs/i)).toBeInTheDocument();
    });
  });

  it('handles content generation errors gracefully', async () => {
    // Mock an error during content generation
    (generateContentFromPDFs as Mock).mockRejectedValue(new Error('Failed to generate content'));

    render(<PDFToContentGeneratorWithCitations userId={mockUserId} />);

    // Mock the PDF upload first
    const fileInput = screen.getByLabelText(/browse files/i) as HTMLInputElement;
    const mockFile = createMockFile('test-paper.pdf', 1234567);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText('Machine Learning in Education')).toBeInTheDocument();
    });

    // Select the paper
    fireEvent.click(screen.getByRole('checkbox'));

    // Click the generate button - this should fail
    const generateBtn = screen.getByRole('button', { name: /generate content/i });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByText(/failed to generate content/i)).toBeInTheDocument();
    });
  });

  it('allows copying generated content to clipboard', async () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      }
    });

    render(<PDFToContentGeneratorWithCitations userId={mockUserId} />);

    // Mock the PDF upload
    const fileInput = screen.getByLabelText(/browse files/i) as HTMLInputElement;
    const mockFile = createMockFile('test-paper.pdf', 1234567);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText('Machine Learning in Education')).toBeInTheDocument();
    });

    // Select the paper and generate content
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /generate content/i }));

    await waitFor(() => {
      expect(screen.getByText('Generated Content')).toBeInTheDocument();
    });

    // Click the copy button
    const copyBtn = screen.getByRole('button', { name: /copy/i });
    fireEvent.click(copyBtn);

    // Verify clipboard API was called
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockGeneratedContent.content);
  });
});

// Additional integration tests
describe('PDF-to-Content Generation Workflow Integration', () => {
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
    (processMultiplePDFs as Mock).mockResolvedValue(mockExtractedContent);
    (generateContentFromPDFs as Mock).mockResolvedValue(mockGeneratedContent);
    (callPuterAI as Mock).mockResolvedValue(mockGeneratedContent.content);
  });

  it('completes the full workflow: upload -> organize -> generate -> cite', async () => {
    render(<PDFToContentGeneratorWithCitations userId={mockUserId} />);

    // Step 1: Upload PDF
    const fileInput = screen.getByLabelText(/browse files/i) as HTMLInputElement;
    const mockFile = createMockFile('research-paper.pdf', 2000000);
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText('Machine Learning in Education')).toBeInTheDocument();
    });

    // Step 2: Create a collection and add paper to it
    const newCollectionBtn = screen.getByRole('button', { name: /new collection/i });
    fireEvent.click(newCollectionBtn);

    const collectionNameInput = screen.getByLabelText(/collection name/i);
    fireEvent.change(collectionNameInput, { target: { value: 'My Research' } });

    const createBtn = screen.getByRole('button', { name: /create collection/i });
    fireEvent.click(createBtn);

    // Add paper to collection using the select element
    const addToCollectionSelect = screen.getByRole('combobox', { name: /add to collection/i });
    fireEvent.mouseDown(addToCollectionSelect);

    const myResearchOption = await screen.findByText('My Research');
    fireEvent.click(myResearchOption);

    // Step 3: Select the paper for generation
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // Step 4: Configure generation parameters
    const summaryRadio = screen.getByLabelText(/summary/i);
    fireEvent.click(summaryRadio);

    const shortRadio = screen.getByLabelText(/short/i);
    fireEvent.click(shortRadio);

    const citationStyleSelect = screen.getByRole('combobox', { name: /citation style/i });
    fireEvent.mouseDown(citationStyleSelect);
    
    const mlaOption = await screen.findByText('MLA');
    fireEvent.click(mlaOption);

    // Step 5: Generate content
    const generateBtn = screen.getByRole('button', { name: /generate content/i });
    fireEvent.click(generateBtn);

    // Step 6: Verify complete workflow
    await waitFor(() => {
      expect(screen.getByText('Generated Content')).toBeInTheDocument();
      expect(screen.getByText(mockGeneratedContent.content)).toBeInTheDocument();
      expect(screen.getByText('References')).toBeInTheDocument();
      expect(screen.getByText('My Research')).toBeInTheDocument(); // Collection name should be visible
    });
  });

  it('handles multiple PDFs in the generation process', async () => {
    const multipleMockContent: ExtractedPDFContent[] = [
      ...mockExtractedContent,
      {
        id: 'mock-paper-2',
        metadata: {
          title: 'AI in Healthcare',
          author: 'Johnson, A.',
          year: 2024,
          creationDate: '2024-02-10',
          modificationDate: '2024-02-10',
          pageCount: 8,
          fileSize: 987654
        },
        textContent: 'This is the text content of the second research paper about AI in healthcare...',
        sections: [
          {
            title: 'Introduction',
            content: 'Healthcare AI introduction content...',
            pageNumber: 1
          }
        ],
        keywords: ['AI', 'healthcare', 'machine learning', 'medical'],
        summary: 'This paper examines AI applications in healthcare settings...'
      }
    ];

    (processMultiplePDFs as Mock).mockResolvedValue(multipleMockContent);

    render(<PDFToContentGeneratorWithCitations userId={mockUserId} />);

    // Upload multiple files
    const fileInput = screen.getByLabelText(/browse files/i) as HTMLInputElement;
    const mockFile1 = createMockFile('paper1.pdf', 1500000);
    const mockFile2 = createMockFile('paper2.pdf', 1200000);
    fireEvent.change(fileInput, { target: { files: [mockFile1, mockFile2] } });

    await waitFor(() => {
      expect(screen.getByText('Machine Learning in Education')).toBeInTheDocument();
      expect(screen.getByText('AI in Healthcare')).toBeInTheDocument();
    });

    // Select both papers
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach(checkbox => fireEvent.click(checkbox));

    // Generate content
    const generateBtn = screen.getByRole('button', { name: /generate content/i });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(generateContentFromPDFs).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ metadata: expect.objectContaining({ title: 'Machine Learning in Education' }) }),
          expect.objectContaining({ metadata: expect.objectContaining({ title: 'AI in Healthcare' }) })
        ]),
        expect.any(Object)
      );
    });

    // Verify both papers were used in generation
    expect(screen.getByText('Generated Content')).toBeInTheDocument();
  });
});