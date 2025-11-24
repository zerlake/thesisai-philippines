import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ResearchGapIdentifier } from '@/components/ResearchGapIdentifier';
import { AuthProvider } from '@/components/auth-provider';
import { toast } from 'sonner';

// Mock the auth provider
vi.mock('@/components/auth-provider', async () => {
  const actual = await vi.importActual('@/components/auth-provider');
  return {
    ...actual,
    useAuth: () => ({
      profile: { id: 'user-123', first_name: 'John', last_name: 'Doe' },
      session: { user: { id: 'user-123' } },
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// Mock the toast library
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })),
  })),
}));

// Mock the fetch API for the actual API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock the types
vi.mock('@/types/researchGap', () => ({
  ResearchGap: {},
  GapAnalysisRequest: {},
  GapAnalysisResponse: {},
}));

describe('ResearchGapIdentifier Integration Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Setup default successful API response
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        identifiedGaps: [
          {
            id: "gap-1",
            title: "Longitudinal Impact of Digital Learning Tools on Critical Thinking",
            description: "Gap in understanding long-term impact of digital tools on critical thinking.",
            gapType: "empirical",
            noveltyScore: 88,
            feasibilityScore: 75,
            significanceScore: 92,
            potentialContribution: "This research would provide crucial longitudinal data.",
            relatedFields: ["Education", "Technology"],
            requiredResources: ["Study participants", "Assessment tools"],
            timelineEstimate: "12-18 months",
            supportingLiterature: [
              {
                id: "lit-1",
                title: "Digital Learning and Academic Performance",
                authors: "Santos, M. & Dela Cruz, J.",
                year: 2022,
                type: "study",
                findings: "Positive correlation between tools and scores",
                limitations: ["Short-term study"],
                relevanceScore: 80,
                contribution: "major",
                gapConnection: "Provides evidence but lacks long-term perspective"
              }
            ],
            keyCitations: ["Santos & Dela Cruz (2022)"],
            researchMethodology: "Mixed-methods longitudinal study",
            potentialChallenges: ["Participant retention"],
            solutionApproach: "Use validated assessments"
          }
        ],
        recommendations: [
          {
            gapId: "gap-1",
            priority: "high",
            rationale: "High significance and feasibility",
            nextSteps: ["Develop protocol"],
            estimatedEffort: "high",
            timelineEstimate: "6 months",
            resourceRequirements: ["Team", "Tools"]
          }
        ],
        relatedConferences: [
          {
            id: "conf-1",
            name: "International Conference on Educational Technology",
            topic: "Technology in Education",
            deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
            location: "Singapore",
            acceptanceRate: 25,
            relevanceToGap: 90,
            url: "https://icet.edu"
          }
        ],
        fundingOpportunities: [
          {
            id: "fund-1",
            title: "DOST-SEI Research Grant",
            organization: "DOST-SEI",
            deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            amount: "PHP 200,000 - 1,000,000",
            description: "Support for research addressing PH development needs",
            eligibility: "Filipino researchers",
            relevanceToGaps: ["gap-1"],
            url: "https://dost.gov.ph"
          }
        ],
        confidenceScore: 85,
        methodology: "Literature synthesis and gap analysis",
        dataSources: ["PubMed", "Google Scholar"]
      })
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render the main component with all input fields', () => {
    render(
      <AuthProvider>
        <ResearchGapIdentifier />
      </AuthProvider>
    );

    // Check for main header
    expect(screen.getByText('Research Gap Identifier')).toBeInTheDocument();
    expect(screen.getByText('Identify novel research opportunities by analyzing existing literature gaps')).toBeInTheDocument();

    // Check for all input fields
    expect(screen.getByLabelText('Research Topic')).toBeInTheDocument();
    expect(screen.getByLabelText('Keywords')).toBeInTheDocument();
    expect(screen.getByLabelText('Field of Study')).toBeInTheDocument();
    expect(screen.getByLabelText('Research Focus')).toBeInTheDocument();
    expect(screen.getByLabelText('Geographic Scope')).toBeInTheDocument();
    expect(screen.getByLabelText('Existing Literature')).toBeInTheDocument();

    // Check for buttons
    expect(screen.getByRole('button', { name: /Add Sample Analysis/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Identify Research Gaps/i })).toBeInTheDocument();
  });

  it('should allow users to fill in research parameters', async () => {
    render(
      <AuthProvider>
        <ResearchGapIdentifier />
      </AuthProvider>
    );

    // Fill in research topic
    const topicInput = screen.getByLabelText('Research Topic');
    fireEvent.change(topicInput, { target: { value: 'AI in Philippine Education' } });
    expect(topicInput).toHaveValue('AI in Philippine Education');

    // Fill in keywords
    const keywordsInput = screen.getByLabelText('Keywords');
    fireEvent.change(keywordsInput, { target: { value: 'artificial intelligence, education, philippines' } });
    expect(keywordsInput).toHaveValue('artificial intelligence, education, philippines');

    // Select field of study
    const fieldSelect = screen.getByRole('combobox', { name: 'Select field of study' });
    fireEvent.mouseDown(fieldSelect);
    
    // Wait for options to appear and click on Education
    await waitFor(() => {
      const educationOption = screen.getByText('Education');
      fireEvent.click(educationOption);
    });

    // Select research focus
    const focusSelect = screen.getAllByRole('combobox')[1]; // Second combobox
    fireEvent.mouseDown(focusSelect);
    
    // Wait for options to appear and click on Quantitative
    await waitFor(() => {
      const quantitativeOption = screen.getByText('Quantitative');
      fireEvent.click(quantitativeOption);
    });

    // Select geographic scope
    const geoSelect = screen.getAllByRole('combobox')[2]; // Third combobox 
    fireEvent.mouseDown(geoSelect);
    
    // Wait for options to appear and click on Philippines
    await waitFor(() => {
      const philippinesOption = screen.getByText('Philippines (National)');
      fireEvent.click(philippinesOption);
    });
  });

  it('should call the backend API when "Identify Research Gaps" is clicked', async () => {
    render(
      <AuthProvider>
        <ResearchGapIdentifier />
      </AuthProvider>
    );

    // Fill in required fields
    fireEvent.change(screen.getByLabelText('Research Topic'), { 
      target: { value: 'Digital Learning in Philippine Universities' } 
    });
    fireEvent.change(screen.getByLabelText('Keywords'), { 
      target: { value: 'digital learning, higher education, philippines' } 
    });

    // Select field of study
    const fieldSelect = screen.getByRole('combobox', { name: 'Select field of study' });
    fireEvent.mouseDown(fieldSelect);
    await waitFor(() => {
      fireEvent.click(screen.getByText('Education'));
    });

    // Click the analyze button
    const analyzeButton = screen.getByRole('button', { name: /Identify Research Gaps/i });
    fireEvent.click(analyzeButton);

    // Wait for the API call to be made
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/analyze-research-gaps',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: expect.stringContaining('Digital Learning in Philippine Universities')
        })
      );
    });
  });

  it('should display analysis results after successful API call', async () => {
    render(
      <AuthProvider>
        <ResearchGapIdentifier />
      </AuthProvider>
    );

    // Fill in required fields
    fireEvent.change(screen.getByLabelText('Research Topic'), { 
      target: { value: 'AI in Education' } 
    });
    fireEvent.change(screen.getByLabelText('Keywords'), { 
      target: { value: 'AI, education' } 
    });

    // Select field of study
    const fieldSelect = screen.getByRole('combobox', { name: 'Select field of study' });
    fireEvent.mouseDown(fieldSelect);
    await waitFor(() => {
      fireEvent.click(screen.getByText('Education'));
    });

    // Click the analyze button
    fireEvent.click(screen.getByRole('button', { name: /Identify Research Gaps/i }));

    // Wait for the results to be displayed
    await waitFor(() => {
      expect(screen.getByText('Longitudinal Impact of Digital Learning Tools on Critical Thinking')).toBeInTheDocument();
    });

    // Verify that the results are displayed correctly
    expect(screen.getByText('Identified Research Gaps')).toBeInTheDocument();
    expect(screen.getByText('Confidence: 85%')).toBeInTheDocument();
    expect(screen.getByText('1 gaps found')).toBeInTheDocument();

    // Check that gap details are visible
    expect(screen.getByText('Gap Type: Empirical')).toBeInTheDocument();
    expect(screen.getByText('Novelty: 88')).toBeInTheDocument();
    expect(screen.getByText('Significance: 92')).toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    // Mock an API failure
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Internal Server Error' })
    });

    render(
      <AuthProvider>
        <ResearchGapIdentifier />
      </AuthProvider>
    );

    // Fill in required fields
    fireEvent.change(screen.getByLabelText('Research Topic'), { 
      target: { value: 'Test Topic' } 
    });
    fireEvent.change(screen.getByLabelText('Keywords'), { 
      target: { value: 'test' } 
    });

    // Select field of study
    const fieldSelect = screen.getByRole('combobox', { name: 'Select field of study' });
    fireEvent.mouseDown(fieldSelect);
    await waitFor(() => {
      fireEvent.click(screen.getByText('Education'));
    });

    // Click the analyze button
    fireEvent.click(screen.getByRole('button', { name: /Identify Research Gaps/i }));

    // Wait for the error handling
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to analyze research gaps. Please try again.');
    });
  });

  it('should allow importing literature references', async () => {
    render(
      <AuthProvider>
        <ResearchGapIdentifier />
      </AuthProvider>
    );

    // Find and click the import button (the FileText icon)
    const importButtons = screen.getAllByRole('button');
    const importButton = importButtons.find(btn => 
      btn.innerHTML.includes('FileText') || 
      btn.getAttribute('aria-label')?.includes('FileText') ||
      btn.querySelector('svg')?.innerHTML.includes('FileText')
    );

    if (importButton) {
      fireEvent.click(importButton);
    } else {
      // If we can't find the icon button, look for a button with specific text
      const textButton = screen.getByRole('button', { name: /FileText/ });
      fireEvent.click(textButton);
    }

    // Verify that import functionality was triggered
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Sample references imported successfully!');
    });

    // Check that imported references are displayed
    await waitFor(() => {
      expect(screen.getByText('Imported References:')).toBeInTheDocument();
    });
  });

  it('should navigate between analysis tabs correctly', async () => {
    render(
      <AuthProvider>
        <ResearchGapIdentifier />
      </AuthProvider>
    );

    // Add sample analysis to populate tabs
    fireEvent.click(screen.getByRole('button', { name: /Add Sample Analysis/i }));

    await waitFor(() => {
      expect(screen.getByText('Longitudinal Impact of Digital Learning Tools on Critical Thinking')).toBeInTheDocument();
    });

    // Test tab navigation
    const gapListTab = screen.getByRole('tab', { name: /Gap List/ });
    const gapAnalysisTab = screen.getByRole('tab', { name: /Gap Analysis/ });
    const opportunitiesTab = screen.getByRole('tab', { name: /Opportunities/ });
    const exportTab = screen.getByRole('tab', { name: /Export Findings/ });

    // Click on Gap Analysis tab
    fireEvent.click(gapAnalysisTab);
    await waitFor(() => {
      expect(screen.getByText('Detailed analysis of the identified research gap')).toBeInTheDocument();
    });

    // Click on Opportunities tab
    fireEvent.click(opportunitiesTab);
    await waitFor(() => {
      expect(screen.getByText('Related Conferences')).toBeInTheDocument();
    });

    // Click on Export tab
    fireEvent.click(exportTab);
    await waitFor(() => {
      expect(screen.getByText('Gap Statement Export')).toBeInTheDocument();
    });

    // Go back to Gap List
    fireEvent.click(gapListTab);
    await waitFor(() => {
      expect(screen.getByText('Identified Research Gaps')).toBeInTheDocument();
    });
  });

  it('should allow selecting and viewing detailed gap information', async () => {
    render(
      <AuthProvider>
        <ResearchGapIdentifier />
      </AuthProvider>
    );

    // Add sample analysis
    fireEvent.click(screen.getByRole('button', { name: /Add Sample Analysis/i }));

    await waitFor(() => {
      expect(screen.getByText('Longitudinal Impact of Digital Learning Tools on Critical Thinking')).toBeInTheDocument();
    });

    // Click on a specific gap to select it
    const gapCard = screen.getByText('Longitudinal Impact of Digital Learning Tools on Critical Thinking').closest('[role="button"]');
    fireEvent.click(gapCard);

    // Navigate to Gap Analysis tab to see detailed information
    const gapAnalysisTab = screen.getByRole('tab', { name: /Gap Analysis/ });
    fireEvent.click(gapAnalysisTab);

    await waitFor(() => {
      // Verify detailed information is displayed
      expect(screen.getByText('Gap Analysis:')).toBeInTheDocument();
      expect(screen.getByText('Gap Description')).toBeInTheDocument();
      expect(screen.getByText('Gap Type')).toBeInTheDocument();
      expect(screen.getByText('Supporting Literature')).toBeInTheDocument();
    });

    // Check that specific gap details are shown
    expect(screen.getByText('Empirical')).toBeInTheDocument();
    expect(screen.getByText('This research would provide crucial longitudinal data.')).toBeInTheDocument();
  });

  it('should handle the sample analysis feature correctly', async () => {
    render(
      <AuthProvider>
        <ResearchGapIdentifier />
      </AuthProvider>
    );

    // Click the sample analysis button
    const sampleButton = screen.getByRole('button', { name: /Add Sample Analysis/i });
    fireEvent.click(sampleButton);

    // Wait for the toast notification
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Sample gap analysis loaded! This demonstrates the tool\'s capabilities with realistic examples.');
    });

    // Check that sample analysis results are displayed
    await waitFor(() => {
      expect(screen.getByText('Longitudinal Impact of Digital Learning Tools on Critical Thinking')).toBeInTheDocument();
      expect(screen.getByText('Identified Research Gaps')).toBeInTheDocument();
    });

    // Verify the sample data characteristics
    expect(screen.getByText('Confidence: 88%')).toBeInTheDocument();
    expect(screen.getByText('3 gaps found')).toBeInTheDocument();
  });

  it('should show progress indicator during analysis', async () => {
    // Mock a delayed response to test progress indicator
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve({
              identifiedGaps: [{ 
                id: "test", 
                title: "Test Gap", 
                description: "Test", 
                gapType: "empirical", 
                noveltyScore: 80, 
                feasibilityScore: 70, 
                significanceScore: 90,
                potentialContribution: "Test contribution",
                relatedFields: ["Test"],
                requiredResources: ["Test"],
                timelineEstimate: "Test",
                supportingLiterature: [],
                keyCitations: [],
                researchMethodology: "Test",
                potentialChallenges: [],
                solutionApproach: "Test"
              }],
              recommendations: [],
              relatedConferences: [],
              fundingOpportunities: [],
              confidenceScore: 85,
              methodology: "Test",
              dataSources: ["Test"]
            })
          });
        }, 100)
      )
    );

    render(
      <AuthProvider>
        <ResearchGapIdentifier />
      </AuthProvider>
    );

    // Fill in required fields
    fireEvent.change(screen.getByLabelText('Research Topic'), { 
      target: { value: 'Progress Test' } 
    });
    fireEvent.change(screen.getByLabelText('Keywords'), { 
      target: { value: 'test' } 
    });

    // Select field of study
    const fieldSelect = screen.getByRole('combobox', { name: 'Select field of study' });
    fireEvent.mouseDown(fieldSelect);
    await waitFor(() => {
      fireEvent.click(screen.getByText('Education'));
    });

    // Click the analyze button
    fireEvent.click(screen.getByRole('button', { name: /Identify Research Gaps/i }));

    // Verify that progress starts
    expect(screen.getByText('Analyzing Gaps...')).toBeInTheDocument();

    // Wait for results to appear after API call completes
    await waitFor(() => {
      expect(screen.getByText('Test Gap')).toBeInTheDocument();
    });
  });
});
