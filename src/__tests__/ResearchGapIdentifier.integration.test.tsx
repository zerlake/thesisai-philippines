import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ResearchGapIdentifier } from '@/components/ResearchGapIdentifier';

import { toast } from 'sonner';

// Mock the dependencies
vi.mock('@/components/auth-provider', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Mock the supabase client and other imports
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

describe('ResearchGapIdentifier Integration Test', () => {
  const mockProfile = {
    id: 'user-123',
    first_name: 'John',
    last_name: 'Doe',
    role: 'user',
  };

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      profile: mockProfile,
      session: { user: { id: 'user-123', email: 'john@example.com' } },
      supabase: {},
    });
    
    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the main components correctly', () => {
    render(<ResearchGapIdentifier />);
    
    // Check for main header
    expect(screen.getByText('Research Gap Identifier')).toBeInTheDocument();
    expect(screen.getByText('Identify novel research opportunities by analyzing existing literature gaps')).toBeInTheDocument();
    
    // Check for input fields
    expect(screen.getByLabelText('Research Topic')).toBeInTheDocument();
    expect(screen.getByLabelText('Keywords')).toBeInTheDocument();
    expect(screen.getByLabelText('Field of Study')).toBeInTheDocument();
    expect(screen.getByLabelText('Research Focus')).toBeInTheDocument();
    
    // Check for buttons
    expect(screen.getByRole('button', { name: /Add Sample Analysis/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Identify Research Gaps/i })).toBeInTheDocument();
  });

  it('allows user to input research parameters', async () => {
    render(<ResearchGapIdentifier />);
    
    // Fill in research topic
    const topicInput = screen.getByLabelText('Research Topic');
    fireEvent.change(topicInput, { target: { value: 'Artificial Intelligence in Philippine Education' } });
    expect(topicInput).toHaveValue('Artificial Intelligence in Philippine Education');
    
    // Fill in keywords
    const keywordsInput = screen.getByLabelText('Keywords');
    fireEvent.change(keywordsInput, { target: { value: 'AI, education, philippines, technology' } });
    expect(keywordsInput).toHaveValue('AI, education, philippines, technology');
    
    // Select field of study
    const fieldSelect = screen.getByRole('combobox', { name: 'Select field of study' });
    fireEvent.mouseDown(fieldSelect);

    // Wait for the options to appear and click on "Education"
    await waitFor(() => {
      expect(screen.getByText('Education')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Education'));
    
    // Select research focus
    const focusSelect = screen.getAllByRole('combobox')[1]; // Second combobox
    fireEvent.mouseDown(focusSelect);
    fireEvent.click(screen.getByText('Quantitative'));
  });

  it('shows sample analysis when "Add Sample Analysis" button is clicked', async () => {
    render(<ResearchGapIdentifier />);
    
    // Click the sample analysis button
    const sampleButton = screen.getByRole('button', { name: /Add Sample Analysis/i });
    fireEvent.click(sampleButton);
    
    // Check for success toast
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Sample gap analysis loaded'));
    });
    
    // Wait for the analysis results to appear
    await waitFor(() => {
      expect(screen.getByText('Longitudinal Impact of Digital Learning Tools on Critical Thinking in Philippine Higher Education')).toBeInTheDocument();
    });
    
    // Check that analysis results are displayed
    expect(screen.getByText('Identified Research Gaps')).toBeInTheDocument();
    expect(screen.getByText('Confidence: 88%')).toBeInTheDocument();
    expect(screen.getByText('3 gaps found')).toBeInTheDocument();
  });

  it('handles literature import functionality', async () => {
    render(<ResearchGapIdentifier />);
    
    // Find the import button
    const importButton = screen.getByRole('button', { name: 'Import literature references' }); // The icon button
    
    // Initially there should be no imported references
    expect(screen.queryByText('Imported References:')).not.toBeInTheDocument();
    
    // Click the import button
    fireEvent.click(importButton);
    
    // Wait for the toast notification
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Sample references imported successfully!');
    });
    
    // Now check that imported references appear
    await waitFor(() => {
      expect(screen.getByText('Imported References:')).toBeInTheDocument();
      expect(screen.getByText('Digital Learning and Academic Performance')).toBeInTheDocument();
    });
  });

  it('allows user to navigate through analysis tabs', async () => {
    render(<ResearchGapIdentifier />);
    
    // Add sample analysis first
    fireEvent.click(screen.getByRole('button', { name: /Add Sample Analysis/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Longitudinal Impact of Digital Learning Tools on Critical Thinking in Philippine Higher Education')).toBeInTheDocument();
    });
    
    // Test tab navigation
    const gapListTab = screen.getByRole('tab', { name: /Gap List/ });
    const gapAnalysisTab = screen.getByRole('tab', { name: /Gap Analysis/ });
    const opportunitiesTab = screen.getByRole('tab', { name: /Opportunities/ });
    const exportTab = screen.getByRole('tab', { name: /Export Findings/ });
    
    expect(gapListTab).toBeInTheDocument();
    expect(gapAnalysisTab).toBeInTheDocument();
    expect(opportunitiesTab).toBeInTheDocument();
    expect(exportTab).toBeInTheDocument();
    
    // Click on different tabs to test functionality
    fireEvent.click(gapAnalysisTab);
    await waitFor(() => {
      expect(screen.getByText('Detailed analysis of the identified research gap')).toBeInTheDocument();
    });
    
    fireEvent.click(opportunitiesTab);
    await waitFor(() => {
      expect(screen.getByText('Related Conferences')).toBeInTheDocument();
    });
    
    fireEvent.click(exportTab);
    await waitFor(() => {
      expect(screen.getByText('Gap Statement Export')).toBeInTheDocument();
    });
  });

  it('allows gap selection and detail view', async () => {
    render(<ResearchGapIdentifier />);
    
    // Add sample analysis
    fireEvent.click(screen.getByRole('button', { name: /Add Sample Analysis/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Longitudinal Impact of Digital Learning Tools on Critical Thinking in Philippine Higher Education')).toBeInTheDocument();
    });
    
    // Find and click on a specific gap card
    const gapCard = screen.getByText(/Longitudinal Impact of Digital Learning Tools/).closest('[role="button"]');
    if (gapCard) {
      fireEvent.click(gapCard);
    } else {
      throw new Error('Gap card not found');
    }
    
    // Verify the gap is selected (should have ring-2 ring-primary class)
    expect(gapCard).toHaveClass('ring-2');
  });

  it('handles export functionality', async () => {
    render(<ResearchGapIdentifier />);
    
    // Add sample analysis
    fireEvent.click(screen.getByRole('button', { name: /Add Sample Analysis/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Longitudinal Impact of Digital Learning Tools on Critical Thinking in Philippine Higher Education')).toBeInTheDocument();
    });
    
    // Click on a gap to select it
    const gapCard = screen.getByText(/Longitudinal Impact of Digital Learning Tools/).closest('[role="button"]');
    if (gapCard) {
      fireEvent.click(gapCard);
    } else {
      throw new Error('Gap card not found');
    }
    
    // Click the export tab
    fireEvent.click(screen.getByRole('tab', { name: /Export Findings/ }));
    
    await waitFor(() => {
      expect(screen.getByText('Gap Statement Export')).toBeInTheDocument();
    });
    
    // Check for export buttons
    const copyButton = screen.getByRole('button', { name: /Copy to Clipboard/i });
    const downloadButton = screen.getByRole('button', { name: /Download as Text/i });
    
    expect(copyButton).toBeInTheDocument();
    expect(downloadButton).toBeInTheDocument();
  });
});
