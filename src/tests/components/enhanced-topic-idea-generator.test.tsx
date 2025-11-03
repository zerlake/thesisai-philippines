import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EnhancedTopicIdeaGenerator } from './enhanced-topic-idea-generator';

// Mock the useAuth hook
jest.mock('./auth-provider', () => ({
  useAuth: () => ({
    session: {
      user: { id: 'test-user-id' },
      access_token: 'test-access-token'
    },
    supabase: {
      from: () => ({
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: { id: 'test-doc-id' }, error: null })
          })
        })
      })
    }
  })
}));

// Mock the FieldOfStudySelector component
jest.mock('./field-of-study-selector', () => ({
  FieldOfStudySelector: ({ value, onValueChange }: any) => (
    <select 
      data-testid="field-selector"
      value={value} 
      onChange={(e) => onValueChange(e.target.value)}
    >
      <option value="">Select a field</option>
      <option value="computer science">Computer Science</option>
      <option value="education">Education</option>
    </select>
  )
}));

// Mock the research trends hook
jest.mock('../hooks/use-research-trends', () => ({
  useResearchTrends: () => ({
    trends: {
      trends: [
        { title: "AI in Education", year: 2023, citations: 45, venue: "Educational Tech Journal", isOpenAccess: true, influentialCitations: 12 },
        { title: "Machine Learning Applications", year: 2024, citations: 32, venue: "AI Review", isOpenAccess: false, influentialCitations: 8 }
      ],
      yearlyTrends: {
        2023: [{ title: "AI in Education", year: 2023, citations: 45, venue: "Educational Tech Journal", isOpenAccess: true, influentialCitations: 12 }],
        2024: [{ title: "Machine Learning Applications", year: 2024, citations: 32, venue: "AI Review", isOpenAccess: false, influentialCitations: 8 }]
      },
      totalPapers: 2,
      mostCited: { title: "AI in Education", year: 2023, citations: 45, venue: "Educational Tech Journal", isOpenAccess: true, influentialCitations: 12 },
      averageCitations: 38.5,
      hottestTopics: [{ title: "AI in Education", year: 2023, citations: 45, venue: "Educational Tech Journal", isOpenAccess: true, influentialCitations: 12 }],
      emergingTrends: [{ title: "Machine Learning Applications", year: 2024, citations: 32, venue: "AI Review", isOpenAccess: false, influentialCitations: 8 }]
    },
    isLoading: false,
    error: null
  })
}));

// Mock router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}));

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      topicIdeas: [
        { title: "The Future of AI in Education", description: "Exploring how artificial intelligence is transforming educational practices" },
        { title: "Machine Learning in Classroom Settings", description: "Investigating practical applications of ML in real classrooms" }
      ]
    })
  } as any)
);

describe('EnhancedTopicIdeaGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the enhanced topic idea generator component', async () => {
    render(<EnhancedTopicIdeaGenerator />);
    
    expect(screen.getByText('Research Topic Idea Generator')).toBeInTheDocument();
    expect(screen.getByText('Stuck on a topic? Select your field of study to brainstorm ideas for your thesis or dissertation based on current research trends.')).toBeInTheDocument();
    
    // Check for field selector
    expect(screen.getByTestId('field-selector')).toBeInTheDocument();
  });

  test('displays research trends when a field is selected', async () => {
    render(<EnhancedTopicIdeaGenerator />);
    
    // Select a field
    const fieldSelector = screen.getByTestId('field-selector') as HTMLSelectElement;
    fieldSelector.value = 'education';
    fieldSelector.dispatchEvent(new Event('change'));
    
    // Wait for trends to load
    await waitFor(() => {
      expect(screen.getByText('Research Trends for education')).toBeInTheDocument();
    });
    
    // Check for trend tabs
    expect(screen.getByText('Trends')).toBeInTheDocument();
    expect(screen.getByText('Ideas')).toBeInTheDocument();
    
    // Check for trend data
    expect(screen.getByText('Total Papers')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Avg. Citations')).toBeInTheDocument();
    expect(screen.getByText('38.5')).toBeInTheDocument();
  });

  test('generates topic ideas when button is clicked', async () => {
    render(<EnhancedTopicIdeaGenerator />);
    
    // Select a field
    const fieldSelector = screen.getByTestId('field-selector') as HTMLSelectElement;
    fieldSelector.value = 'education';
    fieldSelector.dispatchEvent(new Event('change'));
    
    // Click generate button
    const generateButton = screen.getByText('Generate Trend-Aware Ideas');
    generateButton.click();
    
    // Wait for ideas to generate
    await waitFor(() => {
      expect(screen.getByText('The Future of AI in Education')).toBeInTheDocument();
    });
    
    // Check that ideas are displayed with relevance scores
    expect(screen.getByText('Trend Relevance:')).toBeInTheDocument();
  });
});