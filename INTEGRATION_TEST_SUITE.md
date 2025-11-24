# Integration Testing Suite: Research Gap Identifier with Puter.js AI

## Overview
This test suite validates the integration between the Research Gap Identifier UI component and the backend AI analysis powered by Puter.js.

## Test Environment Setup

### Prerequisites
- Node.js 18+ installed
- Supabase CLI installed
- Project dependencies installed (`npm install`)

### Setup Script
```bash
# Install testing dependencies (if not already part of project)
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
```

### Environment Configuration
Create a `.env.test` file with the following (use mock values for testing):
```
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key
TESTING_MODE=true
```

## Test Cases

### 1. UI Component Rendering and Interaction

**Test Case ID:** T001
**Objective:** Verify that the ResearchGapIdentifier component renders correctly and handles user input

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ResearchGapIdentifier } from '@/components/ResearchGapIdentifier';

describe('Research Gap Identifier UI Tests', () => {
  test('Should render all input fields correctly', () => {
    render(<ResearchGapIdentifier />);
    
    expect(screen.getByLabelText('Research Topic')).toBeInTheDocument();
    expect(screen.getByLabelText('Keywords')).toBeInTheDocument();
    expect(screen.getByLabelText('Field of Study')).toBeInTheDocument();
    expect(screen.getByLabelText('Research Focus')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Identify Research Gaps/i })).toBeInTheDocument();
  });

  test('Should allow user to input research parameters', () => {
    render(<ResearchGapIdentifier />);
    
    // Input research topic
    const topicInput = screen.getByLabelText('Research Topic');
    fireEvent.change(topicInput, { target: { value: 'Digital Learning in Philippine Higher Education' } });
    expect(topicInput).toHaveValue('Digital Learning in Philippine Higher Education');
    
    // Input keywords
    const keywordsInput = screen.getByLabelText('Keywords');
    fireEvent.change(keywordsInput, { target: { value: 'AI, education, Philippines' } });
    expect(keywordsInput).toHaveValue('AI, education, Philippines');
    
    // Select field of study
    const fieldSelect = screen.getByRole('combobox', { name: 'Select field of study' });
    fireEvent.mouseDown(fieldSelect);
    fireEvent.click(screen.getByText('Education'));
    
    // Verify selections were captured
    expect(fieldSelect.querySelector('[data-value="education"]')).toBeInTheDocument();
  });
});
```

### 2. API Integration and Data Flow

**Test Case ID:** T002
**Objective:** Verify that the component correctly calls the backend API and handles responses

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, beforeEach, afterEach, test, describe } from 'vitest';
import { ResearchGapIdentifier } from '@/components/ResearchGapIdentifier';

// Mock the fetch API
global.fetch = vi.fn();

describe('API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful API response
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        identifiedGaps: [
          {
            id: 'gap-1',
            title: 'Test Gap',
            description: 'This is a test research gap',
            gapType: 'empirical',
            noveltyScore: 90
          }
        ],
        recommendations: [],
        relatedConferences: [],
        fundingOpportunities: []
      })
    });
  });

  test('Should call backend API when "Identify Research Gaps" button is clicked', async () => {
    render(<ResearchGapIdentifier />);
    
    // Fill in required inputs
    fireEvent.change(screen.getByLabelText('Research Topic'), { target: { value: 'Test Topic' } });
    fireEvent.change(screen.getByLabelText('Keywords'), { target: { value: 'test' } });
    
    // Select field of study
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Select field of study' }));
    fireEvent.click(screen.getByText('Education'));
    
    // Click analyze button
    fireEvent.click(screen.getByRole('button', { name: /Identify Research Gaps/i }));
    
    // Wait for API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/analyze-research-gaps',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });

  test('Should display results after successful API call', async () => {
    render(<ResearchGapIdentifier />);
    
    // Fill in inputs and click analyze
    fireEvent.change(screen.getByLabelText('Research Topic'), { target: { value: 'Test Topic' } });
    fireEvent.change(screen.getByLabelText('Keywords'), { target: { value: 'test' } });
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Select field of study' }));
    fireEvent.click(screen.getByText('Education'));
    fireEvent.click(screen.getByRole('button', { name: /Identify Research Gaps/i }));
    
    // Wait for results to be displayed
    await waitFor(() => {
      expect(screen.getByText('Test Gap')).toBeInTheDocument();
    });
  });
});
```

### 3. Error Handling

**Test Case ID:** T003
**Objective:** Verify proper error handling when API calls fail

```typescript
describe('Error Handling Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock API failure
    (global.fetch as Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Internal Server Error' })
    });
  });

  test('Should display error message when API call fails', async () => {
    render(<ResearchGapIdentifier />);
    
    // Fill in inputs and click analyze
    fireEvent.change(screen.getByLabelText('Research Topic'), { target: { value: 'Test Topic' } });
    fireEvent.change(screen.getByLabelText('Keywords'), { target: { value: 'test' } });
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Select field of study' }));
    fireEvent.click(screen.getByText('Education'));
    fireEvent.click(screen.getByRole('button', { name: /Identify Research Gaps/i }));
    
    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Failed to analyze research gaps/i)).toBeInTheDocument();
    });
  });
});
```

### 4. Literature Integration

**Test Case ID:** T004
**Objective:** Verify that the component can import and utilize literature references

```typescript
describe('Literature Integration Tests', () => {
  test('Should allow importing literature references', async () => {
    render(<ResearchGapIdentifier />);
    
    const importBtn = screen.getByRole('button', { name: /FileText/ }); // The import icon button
    fireEvent.click(importBtn);
    
    await waitFor(() => {
      expect(screen.getByText(/Sample references imported successfully/i)).toBeInTheDocument();
    });
  });
});
```

### 5. End-to-End Workflow

**Test Case ID:** T005
**Objective:** Verify complete workflow from input to results

```typescript
describe('End-to-End Workflow Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful response
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        identifiedGaps: [
          {
            id: 'gap-1',
            title: 'Longitudinal Impact of Digital Learning Tools',
            description: 'Gap in long-term impact studies',
            gapType: 'empirical',
            noveltyScore: 88
          },
          {
            id: 'gap-2', 
            title: 'Cultural Adaptation of Interventions',
            description: 'Gap in cultural context studies',
            gapType: 'contextual',
            noveltyScore: 95
          }
        ],
        recommendations: [
          {
            gapId: 'gap-1',
            priority: 'high',
            rationale: 'High impact and feasibility'
          }
        ],
        relatedConferences: [
          {
            id: 'conf-1',
            name: 'International Conference on EdTech',
            deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        fundingOpportunities: []
      })
    });
  });

  test('Should complete the full research gap analysis workflow', async () => {
    render(<ResearchGapIdentifier />);
    
    // Step 1: Fill in research parameters
    fireEvent.change(screen.getByLabelText('Research Topic'), { 
      target: { value: 'Digital Learning in Philippine Higher Education' } 
    });
    fireEvent.change(screen.getByLabelText('Keywords'), { 
      target: { value: 'digital learning, critical thinking, higher education, philippines' } 
    });
    
    // Step 2: Select field of study
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Select field of study' }));
    fireEvent.click(screen.getByText('Education'));
    
    // Step 3: Select research focus
    fireEvent.mouseDown(screen.getAllByRole('combobox')[1]);
    fireEvent.click(screen.getByText('Quantitative'));
    
    // Step 4: Click analyze button
    fireEvent.click(screen.getByRole('button', { name: /Identify Research Gaps/i }));
    
    // Step 5: Wait for analysis results and verify content
    await waitFor(() => {
      expect(screen.getByText('Longitudinal Impact of Digital Learning Tools')).toBeInTheDocument();
      expect(screen.getByText('Cultural Adaptation of Interventions')).toBeInTheDocument();
    });
    
    // Step 6: Verify gap details are displayed
    const gapCard = screen.getByText('Longitudinal Impact of Digital Learning Tools').closest('.hover\\:shadow-md');
    fireEvent.click(gapCard);
    
    // Step 7: Verify tab navigation works
    fireEvent.click(screen.getByRole('tab', { name: /Gap Analysis/ }));
    await waitFor(() => {
      expect(screen.getByText('Gap Type')).toBeInTheDocument();
    });
  });
});
```

## Running the Tests

### Automated Test Execution
```bash
npm run test:integration
```

or

```bash
vitest --config ./vitest.config.ts
```

### Manual Test Execution
1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open a new terminal and run:
   ```bash
   npm test
   ```

## Success Criteria

- [ ] All UI components render without errors
- [ ] User input fields work correctly
- [ ] API calls are made with correct parameters
- [ ] API responses are handled appropriately
- [ ] Error states are displayed correctly
- [ ] Literature import functionality works
- [ ] Complete workflow operates end-to-end
- [ ] All tab navigation functions properly
- [ ] Result display is accurate and readable

## Known Issues & Limitations

1. **Mock API Dependency**: Current tests rely on mocked API responses. For true integration testing, a test Supabase environment with deployed functions would be needed.

2. **Timing Issues**: Some tests may require specific timeout values depending on API response time.

3. **Environment Variables**: Tests may require specific environment variables to be set.

## Deployment Verification Checklist

Before deploying to production:

- [ ] Verify all Supabase functions are deployed
- [ ] Test API keys are removed from production builds
- [ ] CORS settings are properly configured
- [ ] Authentication is properly implemented if needed
- [ ] Error handling is robust
- [ ] Performance metrics are acceptable
- [ ] All test cases pass in the target environment

## Maintenance Notes

- Update tests when API contracts change
- Maintain test data consistency
- Regular validation of mock responses reflects actual API
- Monitor performance impact of AI calls