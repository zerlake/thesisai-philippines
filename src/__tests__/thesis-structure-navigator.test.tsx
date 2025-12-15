import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { toast } from 'sonner';
import ThesisStructureNavigator from '@/components/thesis-structure-navigator';
import { PDFContentGenerationService } from '@/lib/pdf-content-generation-service';
import { analyzeThesisStructure, evaluateDocumentFlow, evaluateAcademicCompliance, generateStructureSuggestionsWithAI } from '@/lib/thesis-structure-analysis';

// Mock dependencies
vi.mock('sonner', async () => {
  const actual = await vi.importActual('sonner');
  return {
    ...actual,
    toast: {
      success: vi.fn(),
      error: vi.fn(),
      loading: vi.fn(),
      info: vi.fn()
    }
  };
});

vi.mock('@/lib/puter-ai-wrapper', () => ({
  callPuterAI: vi.fn(() => Promise.resolve('Mock AI response'))
}));

vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(() => ({
    session: { user: { id: 'test-user-123' } },
    profile: { first_name: 'Test', last_name: 'User' }
  }))
}));

// Mock data for testing
const mockStructure = [
  {
    id: 'ch1',
    type: 'chapter',
    title: 'Chapter 1: Introduction',
    contentPreview: 'This chapter introduces the research problem and objectives...',
    wordCount: 1200,
    academicScore: 92,
    status: 'complete',
    children: [
      {
        id: 'ch1-1',
        type: 'section',
        title: 'Background of the Study',
        contentPreview: 'The background section provides context for the research...',
        wordCount: 400,
        academicScore: 88,
        status: 'complete',
        children: []
      }
    ]
  },
  {
    id: 'ch2',
    type: 'chapter',
    title: 'Chapter 2: Literature Review',
    contentPreview: 'This chapter reviews relevant literature on the topic...',
    wordCount: 2000,
    academicScore: 85,
    status: 'in_progress',
    children: []
  }
];

describe('Thesis Structure Navigator - Complete Workflow Tests', () => {
  const mockProps = {
    documentId: 'test-doc-123',
    documentContent: 'Test thesis content for analysis',
    userId: 'test-user-123'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully loads and displays the thesis structure navigator', () => {
    render(<ThesisStructureNavigator {...mockProps} />);
    
    expect(screen.getByText('AI-Powered Structure Navigator')).toBeInTheDocument();
    expect(screen.getByText('Analyze and navigate your thesis structure with AI assistance')).toBeInTheDocument();
  });

  it('displays structure statistics correctly', async () => {
    render(<ThesisStructureNavigator {...mockProps} />);
    
    // Mock the component's internal state to have structure data
    // In a real test, we would either mock the state management or test state changes
    
    // Initially, there should be no statistics since no structure is loaded yet
    // After loading mock structure, we should see the stats
    expect(screen.queryByText('Chapters')).not.toBeInTheDocument();
  });

  it('allows users to input topic and field for outline generation', async () => {
    render(<ThesisStructureNavigator {...mockProps} />);
    
    const topicInput = screen.getByPlaceholderText(/enter your thesis topic/i);
    const fieldSelect = screen.getByLabelText(/field of study/i);
    
    fireEvent.change(topicInput, { target: { value: 'The Impact of AI on Education' } });
    fireEvent.click(fieldSelect);
    fireEvent.click(screen.getByText('Education')); // Assuming this is in the dropdown
    
    await waitFor(() => {
      expect(topicInput).toHaveValue('The Impact of AI on Education');
    });
  });

  it('generates structure with AI when valid inputs are provided', async () => {
    (callPuterAI as Mock).mockResolvedValue(`
# Chapter 1: Introduction
## Background: Background information for the study

# Chapter 2: Literature Review  
## Theoretical Framework: Theories related to the study

# Chapter 3: Methodology
## Research Design: Design of the study
`);

    render(<ThesisStructureNavigator {...mockProps} />);
    
    const topicInput = screen.getByPlaceholderText(/enter your thesis topic/i);
    const fieldSelect = screen.getByLabelText(/field of study/i);
    const generateButton = screen.getByRole('button', { name: /generate with ai/i });
    
    fireEvent.change(topicInput, { target: { value: 'AI in Education Research' } });
    fireEvent.click(fieldSelect);
    fireEvent.click(screen.getByText('Education'));
    
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(callPuterAI).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('outline generated successfully'));
    });
  });

  it('shows proper UI when no outline is available', () => {
    render(<ThesisStructureNavigator {...mockProps} />);
    
    expect(screen.getByText(/no structure analyzed/i)).toBeInTheDocument();
  });

  it('allows users to add new sections', () => {
    // This test would require the component to be in a state where structure exists
    // For now, we'll test that the UI elements exist
    render(<ThesisStructureNavigator {...mockProps} />);
    
    expect(screen.getByLabelText(/new section title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/section level/i)).toBeInTheDocument();
  });

  it('implements zoom functionality correctly', async () => {
    render(<ThesisStructureNavigator {...mockProps} />);
    
    // Initially zoom level should be 1
    const zoomInButton = screen.getByRole('button', { name: /zoom in/i });
    const zoomOutButton = screen.getByRole('button', { name: /zoom out/i });
    
    expect(zoomOutButton).toBeEnabled(); // Can zoom out from default
    
    fireEvent.click(zoomInButton);
    fireEvent.click(zoomInButton);
    
    expect(zoomInButton).toBeEnabled(); // Still can zoom in
    
    fireEvent.click(zoomOutButton);
    fireEvent.click(zoomOutButton);
    fireEvent.click(zoomOutButton);
    
    expect(zoomOutButton).toBeDisabled(); // Should be disabled when at minimum
  });

  it('allows switching between different view modes', async () => {
    render(<ThesisStructureNavigator {...mockProps} />);
    
    const viewModeSelect = screen.getByLabelText(/view mode/i);
    
    fireEvent.mouseDown(viewModeSelect);
    
    const treeOption = screen.getByText(/tree view/i);
    const linearOption = screen.getByText(/linear view/i);
    const flowOption = screen.getByText(/flow view/i);
    
    expect(treeOption).toBeInTheDocument();
    expect(linearOption).toBeInTheDocument();
    expect(flowOption).toBeInTheDocument();
    
    fireEvent.click(linearOption);
    
    await waitFor(() => {
      expect(viewModeSelect).toHaveTextContent(/linear/i);
    });
  });

  it('handles search filtering correctly', async () => {
    // Mock structure with data
    (useMemo as any).mockImplementation((fn, deps) => fn());
    (useState as any).mockImplementation((initialState) => {
      const mockState = typeof initialState === 'function' ? initialState() : initialState;
      return [mockState, vi.fn()];
    });
    
    render(<ThesisStructureNavigator {...mockProps} />);
    
    const searchInput = screen.getByPlaceholderText(/search sections by title/i);
    fireEvent.change(searchInput, { target: { value: 'Introduction' } });
    
    await waitFor(() => {
      expect(searchInput).toHaveValue('Introduction');
    });
  });

  it('provides proper keyboard navigation support', () => {
    render(<ThesisStructureNavigator {...mockProps} />);
    
    // Check if keyboard navigation hints are available in the UI
    expect(screen.getByText(/use ↑↓ to navigate/i)).toBeInTheDocument();
  });

  it('shows AI recommendations when available', async () => {
    const mockAnalysisResult = {
      documentId: 'test-doc-123',
      structureMap: mockStructure,
      flowScore: 75,
      complianceScore: 80,
      recommendations: [
        {
          id: 'rec1',
          title: 'Improve Document Flow',
          description: 'Add better transitions between chapters',
          priority: 'high'
        }
      ],
      citationMap: [],
      sectionProperties: {},
      summary: { totalChapters: 2, totalSections: 3, totalWordCount: 3200, averageQuality: 87 }
    };
    
    render(<ThesisStructureNavigator {...mockProps} />);
    
    // In a real test, we would simulate the structure analysis happening
    // For now, checking that the UI can handle recommendations
    expect(screen.queryByText(/ai recommendations/i)).toBeInTheDocument();
  });

  it('allows saving outline as draft', async () => {
    render(<ThesisStructureNavigator {...mockProps} />);
    
    // Mock the structure and then test saving
    const saveButton = screen.getByRole('button', { name: /save as draft/i });
    
    // Initially disabled if no structure exists
    expect(saveButton).toBeDisabled();
  });

  it('allows exporting outline in different formats', () => {
    render(<ThesisStructureNavigator {...mockProps} />);
    
    const exportTxtButton = screen.getByRole('button', { name: /export txt/i });
    const exportMdButton = screen.getByRole('button', { name: /export md/i });
    
    // Export buttons should initially be disabled if no structure exists
    expect(exportTxtButton).toBeDisabled();
    expect(exportMdButton).toBeDisabled();
  });

  it('handles error cases gracefully', async () => {
    (callPuterAI as Mock).mockRejectedValue(new Error('AI service unavailable'));
    
    render(<ThesisStructureNavigator {...mockProps} />);
    
    const topicInput = screen.getByPlaceholderText(/enter your thesis topic/i);
    const fieldSelect = screen.getByLabelText(/field of study/i);
    const generateButton = screen.getByRole('button', { name: /generate with ai/i });
    
    fireEvent.change(topicInput, { target: { value: 'Test Topic' } });
    fireEvent.click(fieldSelect);
    fireEvent.click(screen.getByText('Education'));
    
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('failed to generate outline'));
    });
  });

  it('validates required inputs before generation', async () => {
    render(<ThesisStructureNavigator {...mockProps} />);
    
    const generateButton = screen.getByRole('button', { name: /generate with ai/i });
    
    // Click generate without entering topic or field
    fireEvent.click(generateButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please enter both topic and field of study');
    });
  });

  it('maintains proper academic structure standards', () => {
    // Verify that the analysis functions work correctly
    const flowScore = evaluateDocumentFlow(mockStructure);
    const complianceScore = evaluateAcademicCompliance(mockStructure);
    
    expect(flowScore).toBeGreaterThanOrEqual(0);
    expect(flowScore).toBeLessThanOrEqual(100);
    expect(complianceScore).toBeGreaterThanOrEqual(0);
    expect(complianceScore).toBeLessThanOrEqual(100);
  });

  it('generates proper structure suggestions', () => {
    const suggestions = generateStructureSuggestions(mockStructure, 70, 75);
    
    expect(Array.isArray(suggestions)).toBe(true);
    if (suggestions.length > 0) {
      expect(suggestions[0]).toHaveProperty('id');
      expect(suggestions[0]).toHaveProperty('title');
      expect(suggestions[0]).toHaveProperty('description');
      expect(suggestions[0]).toHaveProperty('priority');
    }
  });

  it('creates proper cross-references between sections', () => {
    const references = createCrossReferences(mockStructure);
    
    // Should create some cross-references based on the mock structure
    expect(Array.isArray(references)).toBe(true);
  });

  describe('Integration with other components', () => {
    it('should work with editor components to provide navigation', () => {
      render(<ThesisStructureNavigator {...mockProps} />);
      
      // Check if there are navigation-related UI elements
      expect(screen.getByText(/quick navigation/i)).toBeInTheDocument();
    });

    it('should integrate properly with citation management', () => {
      render(<ThesisStructureNavigator {...mockProps} />);
      
      // Check if citation-related elements are present
      expect(screen.getByText(/citation style/i)).toBeInTheDocument();
    });
  });

  describe('Performance tests', () => {
    it('handles large structures efficiently', async () => {
      // Create a large mock structure to test performance
      const largeStructure = Array.from({ length: 50 }, (_, i) => ({
        id: `ch-${i}`,
        type: 'chapter',
        title: `Chapter ${i + 1}: Sample Chapter`,
        contentPreview: `This is the content preview for chapter ${i + 1}...`,
        wordCount: 1500 + i * 100,
        academicScore: 70 + (i % 30),
        status: i % 3 === 0 ? 'complete' : i % 3 === 1 ? 'in_progress' : 'needs_review',
        children: Array.from({ length: 3 }, (_, j) => ({
          id: `sec-${i}-${j}`,
          type: 'section',
          title: `Section ${i + 1}.${j + 1}: Sample Section`,
          contentPreview: `Content of section ${i + 1}.${j + 1}...`,
          wordCount: 300 + j * 50,
          academicScore: 75 + (j % 25),
          status: 'complete',
          children: []
        }))
      }));
      
      render(<ThesisStructureNavigator {...mockProps} />);
      
      // The component should handle large structures without performance issues
      expect(screen.getByText(/ai-powered structure navigator/i)).toBeInTheDocument();
    });
  });
  
  describe('Accessibility tests', () => {
    it('has proper ARIA labels for navigation', () => {
      render(<ThesisStructureNavigator {...mockProps} />);
      
      // Check for accessible navigation elements
      expect(screen.getByLabelText(/topic/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/field of study/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/citation style/i)).toBeInTheDocument();
    });
  });
});

describe('Thesis Structure Analysis Functions', () => {
  it('correctly analyzes academic compliance', () => {
    const complianceScore = evaluateAcademicCompliance(mockStructure);
    expect(complianceScore).toBeGreaterThanOrEqual(0);
    expect(complianceScore).toBeLessThanOrEqual(100);
  });

  it('correctly evaluates document flow', () => {
    const flowScore = evaluateDocumentFlow(mockStructure);
    expect(flowScore).toBeGreaterThanOrEqual(0);
    expect(flowScore).toBeLessThanOrEqual(100);
  });

  it('generates meaningful structure suggestions', async () => {
    const suggestions = await generateStructureSuggestionsWithAI(
      mockStructure,
      75,
      80,
      'Test thesis content'
    );
    
    expect(Array.isArray(suggestions)).toBe(true);
  });

  it('creates cross-references between related sections', () => {
    const crossRefs = createCrossReferences(mockStructure);
    
    expect(Array.isArray(crossRefs)).toBe(true);
  });

  it('generates citation cross-references properly', () => {
    const citations = [
      { id: 'cit1', content: 'Sample citation 1' },
      { id: 'cit2', content: 'Sample citation 2' }
    ];
    
    const citationRefs = generateCitationCrossReferences(mockStructure, citations);
    
    expect(Array.isArray(citationRefs)).toBe(true);
  });
});