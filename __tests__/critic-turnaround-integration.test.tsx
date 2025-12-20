import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/components/auth-provider';
import TurnaroundPage from '@/app/(dashboard)/critic/turnaround/page';

// Mock the auth provider
vi.mock('@/components/auth-provider', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

vi.mock('@/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, placeholder }: { value?: string; onChange?: () => void; placeholder?: string }) => (
    <textarea value={value} onChange={onChange} placeholder={placeholder} />
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock('@/components/ui/progress', () => ({
  Progress: () => <div>Progress</div>,
}));

vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
  TableCell: ({ children }: { children: React.ReactNode }) => <td>{children}</td>,
  TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
  TableRow: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder }: { value?: string; onChange?: () => void; placeholder?: string }) => (
    <input value={value} onChange={onChange} placeholder={placeholder} />
  ),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: () => <div>Select Value</div>,
}));

// Mock chart components
vi.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => <div>Bar</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
  Tooltip: () => <div>Tooltip</div>,
  Legend: () => <div>Legend</div>,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => <div>Line</div>,
}));

// Create a test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster />
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('Turnaround Metrics Integration Tests', () => {
  const mockProfile = {
    id: 'test-user-id',
    role: 'critic',
    email: 'critic@example.com',
  };

  beforeEach(() => {
    (useAuth as vi.Mock).mockReturnValue({
      session: { user: { id: 'test-user-id' } },
      profile: mockProfile,
      isLoading: false,
    });
  });

  it('renders the turnaround metrics page with all components', async () => {
    render(
      <TestWrapper>
        <TurnaroundPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Turnaround Metrics')).toBeInTheDocument();
      expect(screen.getByText('Track and optimize your review completion times')).toBeInTheDocument();
    });

    // Check for key elements
    expect(screen.getByText('Avg. Time')).toBeInTheDocument();
    expect(screen.getByText('On Time')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Avg. Performance')).toBeInTheDocument();
  });

  it('displays review turnaround metrics in the table', async () => {
    render(
      <TestWrapper>
        <TurnaroundPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Turnaround Metrics')).toBeInTheDocument();
    });

    // Check if metrics are displayed in the table
    expect(screen.getByText('Initial Review')).toBeInTheDocument();
    expect(screen.getByText('Revisions')).toBeInTheDocument();
    expect(screen.getByText('Final Approval')).toBeInTheDocument();
    expect(screen.getByText('Urgent Reviews')).toBeInTheDocument();
  });

  it('allows filtering by time range', async () => {
    render(
      <TestWrapper>
        <TurnaroundPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Turnaround Metrics')).toBeInTheDocument();
    });

    // Find and click the time range filter
    const timeRangeSelect = screen.getByText('Time range');
    fireEvent.click(timeRangeSelect);

    // Select a time range
    const monthOption = screen.getByText('Last Month');
    fireEvent.click(monthOption);
  });

  it('allows searching review types', async () => {
    render(
      <TestWrapper>
        <TurnaroundPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Turnaround Metrics')).toBeInTheDocument();
    });

    // Find and type in the search box
    const searchInput = screen.getByPlaceholderText('Filter review types...');
    fireEvent.change(searchInput, { target: { value: 'initial' } });
  });

  it('displays performance trend when a metric is selected', async () => {
    render(
      <TestWrapper>
        <TurnaroundPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Turnaround Metrics')).toBeInTheDocument();
    });

    // Check if the performance trend section is rendered
    expect(screen.getByText('Performance Trend')).toBeInTheDocument();
    expect(screen.getByText('Turnaround time trend for selected metric')).toBeInTheDocument();
  });

  it('displays performance comparison charts', async () => {
    render(
      <TestWrapper>
        <TurnaroundPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Turnaround Metrics')).toBeInTheDocument();
    });

    // Check the performance comparison chart
    expect(screen.getByText('Performance Comparison')).toBeInTheDocument();
    expect(screen.getByText('Compare turnaround times across review types')).toBeInTheDocument();
  });

  it('displays efficiency analysis', async () => {
    render(
      <TestWrapper>
        <TurnaroundPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Turnaround Metrics')).toBeInTheDocument();
    });

    // Check the efficiency analysis section
    expect(screen.getByText('Efficiency Analysis')).toBeInTheDocument();
    expect(screen.getByText('Review completion rates and performance')).toBeInTheDocument();
  });

  it('allows saving improvement notes', async () => {
    render(
      <TestWrapper>
        <TurnaroundPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Turnaround Metrics')).toBeInTheDocument();
    });

    // Find the improvement notes textarea
    const notesTextarea = screen.getByPlaceholderText('Add notes about improving turnaround times...');
    fireEvent.change(notesTextarea, { target: { value: 'Need to improve review speed' } });

    // Click the save button
    const saveButton = screen.getByText('Save Notes');
    fireEvent.click(saveButton);
  });

  it('shows improvement recommendations', async () => {
    render(
      <TestWrapper>
        <TurnaroundPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Turnaround Metrics')).toBeInTheDocument();
    });

    // Check the improvement recommendations section
    expect(screen.getByText('Improvement Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Strategies to optimize your turnaround times')).toBeInTheDocument();
  });
});